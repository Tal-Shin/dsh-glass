/**
 * Host half of workbench: a change history that outlives the run, and a way back.
 *
 * The shell's own change summaries live in the Host's memory and end with the run, so after a
 * restart a turn's diff is gone. This keeps its own record, the way the shell captures files:
 * before a file tool first changes a path in a turn, the file is copied; when the turn ends, it
 * is copied again. Copies are stored once each by their SHA-1 under storages/workbench, with a
 * small history per session that lists each turn's files and line counts.
 *
 * From that record the Client can show any turn's diff, and put files back to how they were
 * before a turn. A revert copies what it overwrites first, so it can be undone. It refuses while
 * a turn is running, and reports any file that changed after the agent last wrote it (an edit of
 * your own, or a shell command) so the overwrite is a choice, not an accident.
 *
 * Only file-tool edits are recorded: write, edit, apply_patch and str_replace_editor. Changes made
 * through shell commands are not, so they are neither shown nor reverted. Subagent sessions are
 * skipped, as the shell skips them.
 */
import { createHash } from 'node:crypto';
import { mkdir, open, readFile, readdir, rename, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative } from 'node:path';

export const name = 'workbench';
export const inject = ['connection', 'fs'];

const MAX_BYTES = 2 * 1024 * 1024;
const KEEP_TURNS = 60;
const KEEP_DAYS = 60;
const ROOT = join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'storages', 'workbench');
const BLOBS = join(ROOT, 'blobs');
const HISTORY = join(ROOT, 'history');

const safeId = (id) => String(id).replace(/[^\w.-]/g, '_').slice(0, 120);
const historyFile = (sessionId) => join(HISTORY, `${safeId(sessionId)}.json`);
const blobFile = (sha) => join(BLOBS, sha.slice(0, 2), sha);
const missing = (error) => error?.code === 'ENOENT' || error?.code === 'ENOTDIR';

/** The file's bytes, or null when it is absent, or 'oversized' / 'other' when it cannot be kept. */
async function readBytes(path) {
  let handle;
  try {
    handle = await open(path, 'r');
  } catch (error) {
    if (missing(error)) return null;
    throw error;
  }
  try {
    const info = await handle.stat();
    if (!info.isFile()) return 'other';
    if (info.size > MAX_BYTES) return 'oversized';
    const bytes = await handle.readFile();
    return bytes.length > MAX_BYTES ? 'oversized' : bytes;
  } finally {
    await handle.close();
  }
}

/** A side of a change: { kind: 'absent' } | { kind: 'oversized' } | { kind: 'file', sha, size }. */
async function capture(path) {
  const bytes = await readBytes(path);
  if (bytes === null) return { kind: 'absent' };
  if (bytes === 'other') return undefined;
  if (bytes === 'oversized') return { kind: 'oversized' };
  const sha = createHash('sha1').update(bytes).digest('hex');
  const file = blobFile(sha);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, bytes, { flag: 'wx' }).catch((error) => {
    if (error.code !== 'EEXIST') throw error;
  });
  return { kind: 'file', sha, size: bytes.length };
}

const sameSide = (a, b) => a?.kind === b?.kind && (a.kind !== 'file' || a.sha === b.sha);
const blobBytes = (side) => (side?.kind === 'file' ? readFile(blobFile(side.sha)) : Promise.resolve(null));
const isBinary = (bytes) => bytes !== null && bytes.subarray(0, 8192).includes(0);
const linesOf = (bytes) => {
  if (bytes === null) return [];
  const text = bytes.toString('utf8');
  if (text === '') return [];
  const lines = text.split(/\r?\n/);
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
};

/**
 * Line diff by Myers' O(ND) method, as a list of [op, line] with op ' ', '-' or '+'. Past
 * `limit` edits it gives up and replaces every line, which is the honest answer for a rewrite
 * and keeps the trace under about 8 MB.
 */
function diffLines(a, b, limit = 1000) {
  const n = a.length;
  const m = b.length;
  const max = Math.min(n + m, limit);
  const offset = max + 1;
  const v = new Int32Array(2 * max + 3);
  const trace = [];
  let found = n === 0 && m === 0;
  for (let d = 0; d <= max && !found; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]) ? v[offset + k + 1] : v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x++; y++; }
      v[offset + k] = x;
      if (x >= n && y >= m) { found = true; break; }
    }
  }
  if (!found) return [...a.map((line) => ['-', line]), ...b.map((line) => ['+', line])];
  const ops = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d];
    const k = x - y;
    const prevK = k === -d || (k !== d && vd[offset + k - 1] < vd[offset + k + 1]) ? k + 1 : k - 1;
    const prevX = vd[offset + prevK];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) { ops.push([' ', a[--x]]); y--; }
    if (d === 0) break;
    if (x === prevX) ops.push(['+', b[--y]]);
    else ops.push(['-', a[--x]]);
  }
  while (x > 0 && y > 0) { ops.push([' ', a[--x]]); y--; }
  return ops.reverse();
}

/**
 * Hunks with three lines of context: changes closer than twice the context share a hunk.
 * Capped so a huge rewrite stays readable.
 */
function hunksOf(ops, context = 3, cap = 1500) {
  const oldAt = new Int32Array(ops.length + 1);
  const newAt = new Int32Array(ops.length + 1);
  oldAt[0] = 1;
  newAt[0] = 1;
  const changes = [];
  ops.forEach(([op], i) => {
    oldAt[i + 1] = oldAt[i] + (op === '+' ? 0 : 1);
    newAt[i + 1] = newAt[i] + (op === '-' ? 0 : 1);
    if (op !== ' ') changes.push(i);
  });
  const hunks = [];
  let shown = 0;
  for (let c = 0; c < changes.length;) {
    let end = c;
    while (end + 1 < changes.length && changes[end + 1] - changes[end] <= 2 * context) end++;
    const from = Math.max(0, changes[c] - context);
    const to = Math.min(ops.length, changes[end] + context + 1);
    const lines = ops.slice(from, Math.min(to, from + (cap - shown)));
    hunks.push({ oldStart: oldAt[from], newStart: newAt[from], lines });
    shown += lines.length;
    if (shown >= cap) return { hunks, truncated: true };
    c = end + 1;
  }
  return { hunks, truncated: false };
}

function displayPath(path, cwd) {
  if (cwd) {
    const inside = relative(cwd, path);
    if (inside && !inside.startsWith('..') && !isAbsolute(inside)) return inside.split('\\').join('/');
  }
  const home = homedir();
  const underHome = relative(home, path);
  if (underHome && !underHome.startsWith('..') && !isAbsolute(underHome)) return `~/${underHome.split('\\').join('/')}`;
  return path.split('\\').join('/');
}

function eligible(session) {
  const { cwd, origin, delegationDepth } = session.header ?? {};
  return origin === 'subagent' || (delegationDepth ?? 0) > 0 ? undefined : cwd;
}

export function apply(ctx) {
  /** Per live session: the turn in progress and its first captures. */
  const live = new Map();
  const owners = new WeakMap();
  const loaded = new Map();
  const queues = new Map();
  const lifetime = new AbortController();

  /** Every write of one session's history runs in order. */
  const serial = (sessionId, task) => {
    const run = (queues.get(sessionId) ?? Promise.resolve()).then(task, task);
    queues.set(sessionId, run.catch(() => {}));
    return run;
  };
  const load = async (sessionId) => {
    if (loaded.has(sessionId)) return loaded.get(sessionId);
    let data;
    try {
      data = JSON.parse(await readFile(historyFile(sessionId), 'utf8'));
    } catch (error) {
      if (!missing(error) && !(error instanceof SyntaxError)) throw error;
      data = null;
    }
    if (!data || !Array.isArray(data.turns)) data = { version: 1, sessionId, cwd: null, turns: [], reverts: [] };
    // Older histories marked whole turns. Give their files the same marker so a
    // partially successful undo can retain exactly the files still reverted.
    for (const turn of data.turns) {
      if (turn.revertedAt) for (const file of turn.files) file.revertedAt ??= turn.revertedAt;
    }
    loaded.set(sessionId, data);
    return data;
  };
  const save = async (sessionId, data) => {
    await mkdir(HISTORY, { recursive: true });
    const file = historyFile(sessionId);
    const temp = `${file}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(data));
    await rename(temp, file);
  };
  const warn = (message, error) => ctx.logger?.warn?.(`workbench: ${message}${error ? `: ${error.message ?? error}` : ''}`);

  // ── Recording ─────────────────────────────────────────────────────────────
  ctx.on('session/event', (session, event) => {
    if (event.type === 'turn/start') {
      const cwd = eligible(session);
      if (cwd === undefined) return;
      live.set(session, { id: session.id, cwd, turn: event.data.turn, captures: new Map(), chain: Promise.resolve(), started: Date.now() });
    } else if (event.type === 'turn/end') {
      const state = live.get(session);
      if (state && state.turn === event.data.turn) finish(state).catch((error) => warn('could not record a turn', error));
    }
  });
  ctx.on('session/disposed', (session) => { live.delete(session); });
  ctx.on('tools/pre-execute', async (exec, next) => {
    const session = exec.agent?.session;
    if (session !== undefined && live.has(session)) owners.set(exec, live.get(session));
    return next();
  });
  const before = async (target, actor) => {
    const state = actor === undefined ? undefined : owners.get(actor);
    if (state === undefined) return;
    let path;
    try {
      path = ctx.fs.processPath(target);
    } catch {
      return;
    }
    if (typeof path !== 'string' || state.captures.has(path)) return;
    state.captures.set(path, null);
    // The tool waits for this: the copy has to exist before the file changes.
    state.chain = state.chain.then(async () => {
      try {
        state.captures.set(path, (await capture(path)) ?? null);
      } catch (error) {
        state.captures.delete(path);
        warn(`could not copy ${path}`, error);
      }
    });
    await state.chain;
  };
  for (const intent of ['fs/write-intent', 'fs/edit-intent', 'fs/delete-intent']) {
    ctx.on(intent, async (target, actor, next) => {
      const result = await next();
      await before(target, actor);
      return result;
    }, { prepend: true });
  }

  async function finish(state) {
    if (state.done) return;
    state.done = true;
    await state.chain;
    const files = [];
    for (const [path, first] of state.captures) {
      if (!first) continue;
      const after = await capture(path).catch(() => undefined);
      if (!after || sameSide(first, after)) continue;
      const file = { path, display: displayPath(path, state.cwd), before: first, after, added: 0, deleted: 0 };
      if (first.kind === 'oversized' || after.kind === 'oversized') file.oversized = true;
      else {
        const [a, b] = await Promise.all([blobBytes(first), blobBytes(after)]);
        if (isBinary(a) || isBinary(b)) file.binary = true;
        else {
          for (const [op] of diffLines(linesOf(a), linesOf(b))) {
            if (op === '+') file.added++;
            else if (op === '-') file.deleted++;
          }
        }
      }
      files.push(file);
    }
    for (const [key, value] of live) if (value === state) live.delete(key);
    if (files.length === 0) return;
    files.sort((x, y) => (x.display < y.display ? -1 : x.display > y.display ? 1 : 0));
    await serial(state.id, async () => {
      const data = await load(state.id);
      data.cwd = state.cwd;
      data.turns = data.turns.filter((turn) => turn.turn !== state.turn);
      data.turns.push({ turn: state.turn, startedAt: state.started, endedAt: Date.now(), files });
      data.turns.sort((x, y) => x.turn - y.turn);
      if (data.turns.length > KEEP_TURNS) data.turns = data.turns.slice(-KEEP_TURNS);
      await save(state.id, data);
    });
  }

  // ── Reading and reverting ─────────────────────────────────────────────────
  const running = (sessionId) => [...live.values()].some((state) => state.id === sessionId && !state.done);

  /** What each path was last known to hold, from turns and reverts in time order. */
  const lastKnown = (data) => {
    const events = [
      ...data.turns.map((turn) => ({ at: turn.endedAt, files: turn.files.map((file) => [file.path, file.after]) })),
      ...(data.reverts ?? []).map((revert) => ({ at: revert.at, files: revert.files.map((file) => [file.path, file.restored]) })),
      ...(data.undone ?? []).map((undo) => ({ at: undo.at, files: undo.files.map((file) => [file.path, file.previous]) })),
    ].sort((a, b) => a.at - b.at);
    const known = new Map();
    for (const event of events) for (const [path, side] of event.files) known.set(path, side);
    return known;
  };

  /** The files a revert to before `turn` touches: each path's state before its first change at or after that turn. */
  const plan = async (data, turnNumber) => {
    const targets = new Map();
    for (const turn of data.turns) {
      if (turn.turn < turnNumber || turn.revertedAt) continue;
      for (const file of turn.files) if (!file.revertedAt && !targets.has(file.path)) targets.set(file.path, { path: file.path, display: file.display, restore: file.before });
    }
    const known = lastKnown(data);
    const items = [];
    for (const target of targets.values()) {
      const now = await capture(target.path).catch(() => undefined);
      const expected = known.get(target.path);
      items.push({
        ...target,
        now,
        drift: now !== undefined && expected !== undefined && !sameSide(now, expected),
        blocked: target.restore.kind === 'oversized' || now === undefined || now.kind === 'oversized' ? true : undefined,
        reason: target.restore.kind === 'oversized' ? 'oversized' : now === undefined ? 'unreadable' : now.kind === 'oversized' ? 'backup-too-large' : undefined,
        action: target.restore.kind === 'absent' ? 'delete' : now?.kind === 'absent' ? 'recreate' : 'restore',
      });
    }
    return items;
  };

  const updateTurnMarkers = (data) => {
    for (const turn of data.turns) {
      if (turn.files.length && turn.files.every((file) => file.revertedAt)) turn.revertedAt = Math.max(...turn.files.map((file) => file.revertedAt));
      else delete turn.revertedAt;
    }
  };
  // Markers must remain distinct even when two requests finish in one millisecond.
  const timestamp = (data) => Math.max(Date.now(), ...(data.reverts ?? []).map((item) => item.at + 1), ...(data.undone ?? []).map((item) => item.at + 1));
  const failure = (item, reason) => ({ display: item.display, reason });

  const json = (value, status = 200) => Response.json(value, { status, headers: { 'cache-control': 'no-store' } });
  const params = (request) => new URL(request.url).searchParams;
  const number = (value) => (value !== null && /^\d+$/.test(value) ? Number(value) : undefined);
  const publicFile = (file) => ({ display: file.display, added: file.added, deleted: file.deleted, binary: file.binary, oversized: file.oversized, revertedAt: file.revertedAt, created: file.before.kind === 'absent' || undefined, removed: file.after.kind === 'absent' || undefined });

  const routes = {
    '/api/workbench.history': ['GET', async (request) => {
      const id = params(request).get('sessionId');
      if (!id) return json({ error: 'sessionId' }, 400);
      const data = await load(id);
      return json({
        running: running(id),
        turns: data.turns.slice().reverse().map((turn) => ({ turn: turn.turn, endedAt: turn.endedAt, revertedAt: turn.revertedAt, files: turn.files.map(publicFile) })),
        lastRevert: data.reverts?.length ? (({ at, turn, files }) => ({ at, turn, count: files.length }))(data.reverts[data.reverts.length - 1]) : null,
      });
    }],
    '/api/workbench.diff': ['GET', async (request) => {
      const query = params(request);
      const id = query.get('sessionId');
      const turnNumber = number(query.get('turn'));
      const index = number(query.get('index'));
      if (!id || turnNumber === undefined || index === undefined) return json({ error: 'coordinates' }, 400);
      const file = (await load(id)).turns.find((turn) => turn.turn === turnNumber)?.files[index];
      if (!file) return json({ error: 'not-found' }, 404);
      if (file.oversized) return json({ kind: 'oversized' });
      const [a, b] = await Promise.all([blobBytes(file.before), blobBytes(file.after)]).catch(() => [undefined, undefined]);
      if (a === undefined) return json({ kind: 'missing' });
      if (isBinary(a) || isBinary(b)) return json({ kind: 'binary' });
      return json({ kind: 'text', ...hunksOf(diffLines(linesOf(a), linesOf(b))) });
    }],
    '/api/workbench.revert-plan': ['GET', async (request) => {
      const query = params(request);
      const id = query.get('sessionId');
      const turnNumber = number(query.get('turn'));
      if (!id || turnNumber === undefined) return json({ error: 'coordinates' }, 400);
      if (running(id)) return json({ error: 'running' }, 409);
      const items = await plan(await load(id), turnNumber);
      return json({ files: items.map((item) => ({ display: item.display, action: item.action, drift: item.drift || undefined, blocked: item.blocked, reason: item.reason })) });
    }],
    '/api/workbench.revert': ['POST', async (request) => {
      const query = params(request);
      const id = query.get('sessionId');
      const turnNumber = number(query.get('turn'));
      const force = query.get('force') === '1';
      if (!id || turnNumber === undefined) return json({ error: 'coordinates' }, 400);
      return serial(id, async () => {
        if (running(id)) return json({ error: 'running' }, 409);
        const data = await load(id);
        const items = await plan(data, turnNumber);
        if (items.length === 0) return json({ error: 'nothing' }, 409);
        if (!force && items.some((item) => !item.blocked && item.drift)) return json({ error: 'drift', files: items.filter((item) => !item.blocked && item.drift).map((item) => item.display) }, 409);
        const done = [];
        const failures = [];
        for (const item of items) {
          if (item.blocked) { failures.push(failure(item, item.reason)); continue; }
          let bytes;
          try {
            bytes = await blobBytes(item.restore);
          } catch {
            failures.push(failure(item, 'missing-copy'));
            continue;
          }
          try {
            if (item.restore.kind === 'absent') await unlink(item.path).catch((error) => { if (!missing(error)) throw error; });
            else {
              await mkdir(dirname(item.path), { recursive: true });
              await writeFile(item.path, bytes);
            }
            done.push({ path: item.path, display: item.display, previous: item.now, restored: item.restore });
          } catch (error) {
            failures.push(failure(item, 'write-failed'));
            warn(`could not restore ${item.path}`, error);
          }
        }
        if (done.length) {
          const at = timestamp(data);
          const paths = new Set(done.map((file) => file.path));
          data.reverts = [...(data.reverts ?? []), { at, turn: turnNumber, files: done }].slice(-20);
          for (const turn of data.turns) if (turn.turn >= turnNumber) {
            for (const file of turn.files) if (!file.revertedAt && paths.has(file.path)) file.revertedAt = at;
          }
          updateTurnMarkers(data);
          await save(id, data);
        }
        return json({ restored: done.length, failed: failures.length, failures });
      });
    }],
    '/api/workbench.undo-revert': ['POST', async (request) => {
      const query = params(request);
      const id = query.get('sessionId');
      const force = query.get('force') === '1';
      if (!id) return json({ error: 'sessionId' }, 400);
      return serial(id, async () => {
        if (running(id)) return json({ error: 'running' }, 409);
        const data = await load(id);
        const last = data.reverts?.[data.reverts.length - 1];
        if (!last) return json({ error: 'nothing' }, 409);
        const items = [];
        for (const file of last.files) {
          const now = await capture(file.path).catch(() => undefined);
          items.push({ ...file, now, reason: !file.previous || file.previous.kind === 'oversized' ? 'missing-copy' : now === undefined ? 'unreadable' : now.kind === 'oversized' ? 'backup-too-large' : undefined });
        }
        // A file changed since the revert wrote it (a new turn, an edit of your own) is reported first.
        if (!force) {
          const drifted = items.filter((file) => !file.reason && !sameSide(file.now, file.restored)).map((file) => file.display);
          if (drifted.length > 0) return json({ error: 'drift', files: drifted }, 409);
        }
        const done = [];
        const failures = [];
        for (const file of items) {
          if (file.reason) { failures.push(failure(file, file.reason)); continue; }
          let bytes;
          try {
            bytes = await blobBytes(file.previous);
          } catch {
            failures.push(failure(file, 'missing-copy'));
            continue;
          }
          try {
            if (file.previous.kind === 'absent') await unlink(file.path).catch((error) => { if (!missing(error)) throw error; });
            else {
              await mkdir(dirname(file.path), { recursive: true });
              await writeFile(file.path, bytes);
            }
            done.push(file);
          } catch (error) {
            failures.push(failure(file, 'write-failed'));
            warn(`could not undo ${file.path}`, error);
          }
        }
        if (done.length) {
          const paths = new Set(done.map((file) => file.path));
          last.files = last.files.filter((file) => !paths.has(file.path));
          if (last.files.length === 0) data.reverts.pop();
          for (const turn of data.turns) for (const file of turn.files) {
            if (file.revertedAt === last.at && paths.has(file.path)) delete file.revertedAt;
          }
          updateTurnMarkers(data);
          // Only successful writes become the last known state; failures stay retryable.
          data.undone = [...(data.undone ?? []), { at: timestamp(data), files: done.map((file) => ({ path: file.path, previous: file.previous })) }].slice(-20);
          await save(id, data);
        }
        return json({ restored: done.length, failed: failures.length, failures });
      });
    }],
  };
  for (const [path, [method, handler]] of Object.entries(routes)) {
    ctx.connection.fetch.register({
      path,
      methods: [method],
      requestBody: 'buffered',
      fetch: (request) => handler(request).catch((error) => {
        warn(`${path} failed`, error);
        return json({ error: 'failed' }, 500);
      }),
    });
  }

  // ── Housekeeping: old histories and copies nothing points at any more ─────
  const sweep = setTimeout(async () => {
    try {
      const referenced = new Set();
      const cutoff = Date.now() - KEEP_DAYS * 86400000;
      for (const entry of await readdir(HISTORY).catch(() => [])) {
        if (!entry.endsWith('.json')) continue;
        const file = join(HISTORY, entry);
        if ((await stat(file)).mtimeMs < cutoff) { await rm(file, { force: true }); continue; }
        const data = JSON.parse(await readFile(file, 'utf8'));
        const keep = (side) => { if (side?.kind === 'file') referenced.add(side.sha); };
        for (const turn of data.turns ?? []) for (const item of turn.files) { keep(item.before); keep(item.after); }
        for (const revert of data.reverts ?? []) for (const item of revert.files) { keep(item.previous); keep(item.restored); }
        for (const undo of data.undone ?? []) for (const item of undo.files) keep(item.previous);
      }
      // Copies of turns still in progress are kept by their age: only older ones go.
      const young = Date.now() - 86400000;
      for (const prefix of await readdir(BLOBS).catch(() => [])) {
        for (const sha of await readdir(join(BLOBS, prefix)).catch(() => [])) {
          if (referenced.has(sha)) continue;
          const file = join(BLOBS, prefix, sha);
          if ((await stat(file)).mtimeMs < young) await rm(file, { force: true });
        }
      }
    } catch (error) {
      warn('housekeeping failed', error);
    }
  }, 60000);
  ctx.effect(() => () => {
    lifetime.abort();
    clearTimeout(sweep);
  });
}
