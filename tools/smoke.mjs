#!/usr/bin/env node
/**
 * Smoke test for the dsh-glass plugins against a running DSH desktop app.
 *
 * Run it after every DSH update. Start DSH with a debugging port first:
 *
 *   "%LOCALAPPDATA%\Programs\DeepSeek Harness\DeepSeek Harness.exe" --remote-debugging-port=9333
 *
 * then open a conversation and run:
 *
 *   node tools/smoke.mjs              read-only checks of the page as it is
 *   node tools/smoke.mjs --scroll     also scrolls the conversation to measure the frame rate
 *   node tools/smoke.mjs --port 9222  another debugging port
 *
 * By default nothing is clicked, typed or changed. --scroll sends mouse-wheel events to the
 * conversation and puts it back where it was. Exit code 1 means a check failed.
 */
const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1]) || 9333;
const scroll = args.includes('--scroll');

let list;
try {
  list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
} catch {
  console.error(`No DSH on port ${port}. Start it with --remote-debugging-port=${port}.`);
  process.exit(2);
}
const page = list.find((target) => target.type === 'page' && /^dsh-app:|^http/.test(target.url)) ?? list.find((target) => target.type === 'page');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let serial = 0;
const pending = new Map();
socket.onmessage = (message) => {
  const data = JSON.parse(message.data);
  if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); }
};
const send = (method, params = {}) => new Promise((resolve) => { const id = ++serial; pending.set(id, resolve); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => {
  const reply = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (reply.result?.exceptionDetails) throw new Error(reply.result.exceptionDetails.exception?.description ?? 'evaluation failed');
  return reply.result?.result?.value;
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const results = [];
const record = (status, name, detail = '') => results.push({ status, name, detail });
const check = async (name, run) => {
  try {
    const [status, detail] = await run();
    record(status, name, detail);
  } catch (error) {
    record('FAIL', name, error.message);
  }
};

await check('DSH version', async () => {
  const version = await evaluate(`/dsh-desktop\\/([\\w.+-]+)/.exec(navigator.userAgent)?.[1] ?? null`);
  return [version ? 'PASS' : 'WARN', version ?? 'not in the user agent'];
});
await check('glass-theme loaded', async () => {
  const sheets = await evaluate(`[...document.querySelectorAll('style[data-plugin-css]')].map((s) => s.dataset.pluginCss).filter((n) => /theme\\/(base|color|glass|shape|motion)$/.test(n))`);
  return [sheets.length === 5 ? 'PASS' : 'FAIL', `${sheets.length} of 5 stylesheets`];
});
await check('glass-theme self-check', async () => {
  const raw = await evaluate(`typeof globalThis.__dshGlassCheck === 'function' ? globalThis.__dshGlassCheck() : null`);
  if (!raw) return ['FAIL', 'no report: the theme is off or older than 0.3'];
  const report = JSON.parse(raw);
  if (report.legacy.length > 0) return ['FAIL', `old plugins still installed: ${report.legacy.join(', ')}`];
  if (report.missing.length > 0) return ['FAIL', `shell structure changed in: ${report.missing.join(', ')}`];
  return ['PASS', `${report.found} of ${report.total} places matched; seen ${report.seen.join(', ') || 'none'}`];
});
await check('liquid glass surfaces', async () => {
  const mode = await evaluate(`document.documentElement.dataset.lgRefraction ?? 'off'`);
  if (mode !== 'lens') return ['PASS', 'refraction is off, nothing to attach'];
  const surfaces = await evaluate(`[...document.querySelectorAll('[data-lg-surface]')].map((e) => e.getAttribute('data-lg-surface') + (e.querySelector(':scope > [data-lg-glass] > b') ? '' : '(no layer)'))`);
  const broken = surfaces.filter((name) => name.includes('(no layer)'));
  const composer = await evaluate(`!!document.querySelector('[data-composer-card]')`);
  if (composer && !surfaces.some((name) => name.startsWith('composer'))) return ['FAIL', 'composer on screen without glass'];
  return [broken.length ? 'FAIL' : 'PASS', surfaces.join(', ') || 'none on screen'];
});
await check('conversation does not scroll sideways', async () => {
  const value = await evaluate(`(() => { const s = document.querySelector('[data-conversation-scroll]'); return s ? s.scrollWidth - s.clientWidth : null; })()`);
  if (value === null) return ['WARN', 'no conversation open'];
  return [value <= 0 ? 'PASS' : 'FAIL', value <= 0 ? 'no overflow' : `${value}px overflow lifts the composer`];
});
await check('koi-pond', async () => {
  const canvas = await evaluate(`!!document.getElementById('cngtn-pond-canvas')`);
  return [canvas ? 'PASS' : 'WARN', canvas ? 'canvas mounted' : 'no canvas (plugin off, or switched off in its settings)'];
});
await check('workbench page', async () => {
  const pageShown = await evaluate(`!!document.querySelector('[data-workbench-page]')`);
  return [pageShown ? 'PASS' : 'WARN', pageShown ? 'on the right panel' : 'not on screen (right panel closed, or plugin off)'];
});
await check('workbench change history', async () => {
  const status = await evaluate(`fetch('api/workbench.history?sessionId=smoke-probe').then((r) => r.status)`);
  return [status === 200 ? 'PASS' : 'FAIL', status === 200 ? 'Host half answers' : `HTTP ${status}: the Host half is not loaded; restart DSH after installing`];
});

if (scroll) {
  await check('scroll frame rate', async () => {
    const box = await evaluate(`(() => { const s = document.querySelector('[data-conversation-scroll]'); if (!s) return null; const r = s.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 3, top: s.scrollTop }; })()`);
    if (!box) return ['WARN', 'no conversation open'];
    // A hidden or minimised window gets no animation frames, so there is nothing to measure.
    if ((await evaluate('document.visibilityState')) !== 'visible') return ['WARN', 'window hidden or minimised; bring DSH to the front and run again'];
    const frames = evaluate(`new Promise((done) => { const d = []; let last = performance.now(); const start = last; const step = (now) => { d.push(now - last); last = now; if (now - start < 1800) requestAnimationFrame(step); else { d.sort((a, b) => a - b); done({ fps: Math.round(d.length / 1.8), p95: +d[Math.floor(d.length * 0.95)].toFixed(1) }); } }; requestAnimationFrame(step); })`);
    for (let i = 0; i < 60; i++) {
      send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: box.x, y: box.y, deltaX: 0, deltaY: i % 20 < 10 ? -120 : 120 });
      await wait(25);
    }
    const result = await frames;
    await evaluate(`document.querySelector('[data-conversation-scroll]').scrollTop = ${box.top}`);
    return [result.fps >= 100 ? 'PASS' : result.fps >= 50 ? 'WARN' : 'FAIL', `${result.fps} fps, 95th percentile frame ${result.p95} ms`];
  });
}

socket.close();
const width = Math.max(...results.map((r) => r.name.length));
for (const { status, name, detail } of results) console.log(`${status.padEnd(4)}  ${name.padEnd(width)}  ${detail}`);
const failed = results.filter((r) => r.status === 'FAIL').length;
console.log(failed ? `\n${failed} failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
