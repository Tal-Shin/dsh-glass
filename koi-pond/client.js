/**
 * koi-pond — Client half.
 *
 * The ASCII koi pond as a stand-alone, removable layer. Derived from
 * @cngtn/dsh-cngtn-pond 1.5.1 (MIT, github.com/cngtn/dsh-cngtn-pond): the world,
 * shape, renderer and engine modules are unchanged but for the splash and nudge the Glass
 * theme's send animation and typing ask for. Generated from that package;
 * its token layer and shell stylesheet were left out because the look of the
 * shell now belongs to the active theme.
 *
 * Everything is registered inside `ctx.effect`, so disabling this bundle removes
 * the canvas, stops the engine and drops the stylesheet. Any theme works as long
 * as it keeps the shell frame above z-index 0 and leaves its panels translucent.
 */
window.__ModuleLoader__.load({
  id: '@tal-shin/dsh-koi-pond',
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;

// The theme sets no font family, so no webfont is inlined.


/**
 * The simulation and the rasteriser, with no DOM access. Wrapped in a function so
 * the pond worker can be started from this exact source (see WorkerPond).
 */
function pondLibrary() {
/* ── world ─────────────────────────────────────────────────────────────── */
const __m_world = (() => {
/**
 * world.js — the pond's physics, ported from the original site's `world.ts`.
 *
 * Nothing here touches the DOM or a canvas: this module owns koi, pellets,
 * ripples and bites, and steps them on a fixed 1/60s clock. Keeping it pure is
 * what lets the headless smoke test run 600 frames in Node and assert that no
 * spine node ever goes NaN.
 *
 * The port is deliberately literal. Every constant, every steering force and
 * every ordering decision is the one the site ships, because the whole point of
 * this theme is that the pond feels the same as the pond on the original site.
 */

const TAU = Math.PI * 2;
const KOI_NODES = 20;
const RIPPLE_SPEED = 52;
// Enough to count as fleeing for about half a second, not the full bolt of a splash.
const WRITING_NUDGE = 0.6;

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function angleDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

/** Deterministic integer hash to [0, 1), so textures stay pinned to the body. */
function hash3(x, y, z) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * Koi varieties, weighted the way a real pond is stocked: mostly white-and-red,
 * a few patterned, and one or two of the metallic or blue fish that give a
 * school its depth.
 *
 * Each entry is `[variety, weight]`. The renderer owns what each variety looks
 * like; this table only decides how often one appears.
 */
const VARIETY_WEIGHTS = [
  ['kohaku', 4],
  ['sanke', 3],
  ['tancho', 2],
  ['showa', 2],
  ['ogon', 2],
  ['asagi', 1],
  ['bekko', 1],
  // Added: the two utsuris, the leaf koi, and the blue-bodied one. Weight 1 each,
  // so kohaku still sets the tone of the school.
  ['utsuri', 1],
  ['shiro', 1],
  ['momiji', 1],
  ['goshiki', 1],
];
const TOTAL_WEIGHT = VARIETY_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);

function pickVariety() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const [variety, weight] of VARIETY_WEIGHTS) {
    r -= weight;
    if (r <= 0) return variety;
  }
  return 'kohaku';
}

/**
 * The pigment each fish can carry. These are mid-tones on purpose: the renderer
 * shades them into a ramp, so a colour only has to be recognisable at the
 * middle of the body, not at both ends of the scale.
 */
const ACCENTS = {
  vermilion: '#cc3e1c',
  orange: '#e0662a',
  gold: '#c9973a',
  yellow: '#d8b64a',
  crimson: '#a8231f',
  blue: '#5f7f95',
  silver: '#b9b3a9',
  ink: '#3a3630',
  // Added for a fuller pond: the browns, greens and violets real koi carry. The
  // renderer derives a six-stop ramp from whatever pigment a fish gets, so a new
  // name here is a new fish colour without any further code.
  amber: '#d9902f',
  chestnut: '#8a5a3b',
  jade: '#4a8574',
  plum: '#7a4b6b',
  rose: '#c2564f',
  pearl: '#cfc9c0',
};

/** Accent pools by palette preset; `mixed` is the full range. */
const ACCENT_PRESETS = {
  mixed: Object.keys(ACCENTS),
  warm: ['vermilion', 'orange', 'gold', 'yellow', 'crimson', 'amber', 'chestnut', 'rose'],
  cool: ['blue', 'silver', 'jade', 'plum', 'pearl'],
  mono: ['ink'],
};

/** Valid values for the `palette` option, in menu order. */
const PALETTE_PRESETS = ['mixed', 'warm', 'cool', 'mono'];

/**
 * Pigment families. A fish is blended *inside* its own family and never across,
 * because `mixed` holds silver and pearl alongside vermilion: blend those and a
 * red koi comes out beige, which is what the first run of this did.
 */
const ACCENT_FAMILIES = {
  vermilion: 'warm', orange: 'warm', gold: 'warm', yellow: 'warm', crimson: 'warm',
  amber: 'warm', chestnut: 'warm', rose: 'warm',
  blue: 'cool', silver: 'cool', jade: 'cool', plum: 'cool', pearl: 'cool',
  ink: 'neutral',
};

/** Valid variety names, in menu order. */
const VARIETIES = VARIETY_WEIGHTS.map(([name]) => name);

/** '#rrggbb' to [r, g, b], and back. The renderer keeps its own copy of the first. */
const accentRgb = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const accentHex = (c) =>
  '#' + c.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

function pickAccent(preset) {
  const pool = ACCENT_PRESETS[preset] ?? ACCENT_PRESETS.mixed;
  // The preset lists pigment *names*; a koi carries the hex, because that is what
  // the renderer turns into a ramp. A second name from the *same family* is mixed
  // in, so two kohaku are never quite the same red and the pond gains hues that
  // are in no palette at all — without a warm fish ever drifting toward beige.
  const name = pool[Math.floor(Math.random() * pool.length)];
  const family = ACCENT_FAMILIES[name] ?? 'warm';
  const kin = pool.filter((n) => (ACCENT_FAMILIES[n] ?? 'warm') === family);
  const a = accentRgb(ACCENTS[name]);
  const b = accentRgb(ACCENTS[kin[Math.floor(Math.random() * kin.length)] ?? name]);
  const k = 0.12 + Math.random() * 0.3;
  return accentHex(a.map((v, i) => v + (b[i] - v) * k));
}

const push = { x: 0, y: 0 };

/** Sum of pushes away from every box within `margin` of (x, y), each scaled 0..1 by closeness. */
function repel(boxes, x, y, margin, out) {
  out.x = 0;
  out.y = 0;
  for (const b of boxes) {
    let ox = x - clamp(x, b.left, b.right);
    let oy = y - clamp(y, b.top, b.bottom);
    let d = Math.hypot(ox, oy);
    if (d > margin) continue;
    if (d < 1e-3) {
      // Inside the box: head for the nearest edge.
      const edges = [b.left - x, x - b.right, b.top - y, y - b.bottom];
      const nearest = edges.indexOf(Math.max(...edges));
      ox = nearest === 0 ? -1 : nearest === 1 ? 1 : 0;
      oy = nearest === 2 ? -1 : nearest === 3 ? 1 : 0;
      d = 0;
    }
    const len = Math.hypot(ox, oy) || 1;
    out.x += (ox / len) * (1 - d / margin);
    out.y += (oy / len) * (1 - d / margin);
  }
  return out;
}

const PELLET_LIFE = 14;
const BITE_LIFE = 0.45;
const RUSH_RANGE = 650;
const FEED_CALM = 2;
/** Uneaten pellets start to sink this many seconds in, fading out by PELLET_LIFE. */
const PELLET_SINK = 9;
const THROW_RADIUS = 34;
const STARTLE_SPEED = 1100;
const MAX_PELLETS = 24;

/**
 * A pond. `budget` scales the population down for a shell that has less open
 * water than a full-screen page: the site seeds 3–6 adults plus two young koi,
 * the DSH theme asks for a smaller pond so the fish never crowd the panels.
 */
class World {
  constructor(options = {}) {
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.koi = [];
    this.pellets = [];
    this.bites = [];
    this.ripples = [];
    this.pointer = { x: 0, y: 0, speed: 0, active: false };
    /** Page content the koi steer around, in canvas space. */
    this.avoid = [];
    /** Fraction of the site's population; 1 = the original, 0.7 = the DSH default. */
    this.budget = options.budget ?? 1;
    /**
     * User-facing knobs, all optional:
     *
     *  - `fish`: an exact adult count (3–12). Overrides `budget`.
     *  - `young`: whether the two small koi that keep to the deep water appear.
     *  - `palette`: which accent pool the fish draw from.
     */
    this.fish = Number.isFinite(options.fish) ? clamp(Math.round(options.fish), 3, 12) : null;
    this.young = options.young !== false;
    this.palette = PALETTE_PRESETS.includes(options.palette) ? options.palette : 'mixed';
    this.lastFeed = -Infinity;
  }

  /**
   * Adopt a new canvas size.
   *
   * The site seeds once, because its canvas is always correctly sized on the
   * first measurement. A shell is not that tidy: the canvas is inserted before
   * its stylesheet lands, so the first rect can be the 300×150 default and the
   * fish would then be trapped in that corner of a much larger pond. Seeding
   * again whenever the box changes by more than a quarter keeps the school
   * spread across whatever water it actually has.
   */
  resize(width, height) {
    const first = this.width === 0;
    const shrankOrGrew =
      !first &&
      (Math.abs(width - this.width) > this.width * 0.25 || Math.abs(height - this.height) > this.height * 0.25);
    this.width = width;
    this.height = height;
    if (first || shrankOrGrew) this.seed();
  }

  seed() {
    const { width: W, height: H } = this;
    const minSide = Math.min(W, H);
    const baseLength = clamp(minSide * 0.5, 170, 420);
    // The site's density is one adult per 240 000 px², floored at three and
    // capped at six. `budget` scales that down for a shell with less open water,
    // but the floor stays at three: a pond with two fish does not read as a pond,
    // it reads as two fish.
    const density = (W * H) / 240000;
    // `fish` is the *total* the user asked for, so the number in the panel is the
    // number in the pond. Without it the density estimate decides.
    const total = this.fish !== null ? this.fish : clamp(Math.round(density * this.budget), 3, 6);
    // Wide screens also get a couple of young koi that keep to the deep water,
    // for a sense of depth. They are part of the total, never extra, and only
    // appear when there is water and enough fish to spare.
    const young =
      this.young && W >= 1024 && this.budget >= 0.6 ? Math.min(2, Math.max(0, total - 3)) : 0;
    const count = Math.max(1, total - young);

    // Goldfish are chosen before the loop so the pond always has its second
    // species instead of only sometimes having one: one in a small pond, two once
    // the school is big enough that they do not read as a pair of clones.
    const goldfishCount = count >= 8 ? 2 : count >= 3 ? 1 : 0;
    const goldfishAt = new Set();
    while (goldfishAt.size < goldfishCount) goldfishAt.add(Math.floor(Math.random() * count));

    this.koi = [];
    for (let i = 0; i < count + young; i++) {
      const isYoung = i >= count;
      // Adults come in three size classes rather than one smooth range: a pond
      // reads as a pond when the fish are visibly of different ages, not merely
      // of different lengths. Weighted so the school still looks settled — one
      // big fish to anchor it, a few mid-sized, the rest small.
      const tier = Math.random();
      const adultScale = tier < 0.18 ? rand(1.0, 1.14) : tier < 0.55 ? rand(0.8, 0.96) : rand(0.55, 0.72);
      // A goldfish is a different animal, not a small koi: shorter, so its
      // half-width (measured in fractions of length) comes out rounder; wider
      // still; and carrying a much larger fan tail.
      const goldfish = goldfishAt.has(i);
      const length = baseLength * (isYoung ? rand(0.32, 0.45) : goldfish ? rand(0.44, 0.6) : adultScale);
      const depthMax = isYoung ? 0.72 : 1;
      const heading = rand(0, TAU);
      const x = rand(W * 0.1, W * 0.9);
      const y = rand(H * 0.1, H * 0.9);
      const nodes = new Float32Array(KOI_NODES * 2);
      const seg = length / (KOI_NODES - 1);
      for (let n = 0; n < KOI_NODES; n++) {
        nodes[n * 2] = x - Math.cos(heading) * seg * n;
        nodes[n * 2 + 1] = y - Math.sin(heading) * seg * n;
      }
      this.koi.push({
        id: i + 1,
        variety: goldfish ? (Math.random() < 0.55 ? 'ogon' : 'momiji') : pickVariety(),
        species: goldfish ? 'goldfish' : 'koi',
        girth: goldfish ? rand(1.2, 1.36) : 1,
        flareBias: goldfish ? rand(1.3, 1.5) : 1,
        accent: pickAccent(this.palette),
        length,
        nodes,
        heading,
        speed: 20,
        phase: rand(0, TAU),
        turn: 0,
        wander: 0,
        curiosity: rand(0.35, 1),
        depth: rand(0.5, depthMax),
        depthTarget: rand(0.5, depthMax),
        depthMax,
        nextDive: rand(6, 18),
        nextSurface: rand(3, 14),
        nextWake: rand(0, 2),
        beat: 0,
        rush: 0,
        food: null,
        burstUntil: 0,
        nextBurst: rand(0, 3),
        finPhase: rand(0, TAU),
        startle: 0,
        fleeX: 0,
        fleeY: 0,
        gulp: 0,
      });
    }
  }

  /**
   * Apply new user settings. Population and palette changes re-seed the school,
   * which is the only honest way to change "how many fish" — moving existing
   * fish around would leave the pond with a different look than it reports.
   */
  setOptions(next = {}) {
    let reseed = false;
    if (next.fish !== undefined) {
      const value = Number.isFinite(next.fish) ? clamp(Math.round(next.fish), 3, 12) : null;
      if (value !== this.fish) {
        this.fish = value;
        reseed = true;
      }
    }
    if (next.young !== undefined && Boolean(next.young) !== this.young) {
      this.young = Boolean(next.young);
      reseed = true;
    }
    if (next.palette !== undefined && PALETTE_PRESETS.includes(next.palette) && next.palette !== this.palette) {
      this.palette = next.palette;
      reseed = true;
    }
    if (next.budget !== undefined && Number.isFinite(next.budget)) this.budget = next.budget;
    if (reseed && this.width > 0) this.seed();
    return { fish: this.fish, young: this.young, palette: this.palette };
  }

  /** Current settings, for a settings UI to render. */
  getOptions() {
    return { fish: this.fish, young: this.young, palette: this.palette };
  }

  /**
   * Something heavy met the water: all of the shape at `box` (canvas space, top-left corner), not
   * one point of it. Three rings race out from its outline, and koi in reach bolt from its
   * nearest edge, or from its middle if they were under it.
   */
  splash(box) {
    const t = this.time;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    this.ripples.push(
      { x, y, box, born: t, strength: 1, speed: 3.2 },
      { x, y, box, born: t + 0.16, strength: 0.7, speed: 3.2 },
      { x, y, box, born: t + 0.34, strength: 0.45, speed: 3.2 },
    );
    const reach = Math.max(this.width, this.height) * 0.6;
    for (const k of this.koi) {
      const hx = k.nodes[0];
      const hy = k.nodes[1];
      const nx = clamp(hx, box.x, box.x + box.width);
      const ny = clamp(hy, box.y, box.y + box.height);
      if (Math.hypot(hx - nx, hy - ny) > reach) continue;
      const under = nx === hx && ny === hy;
      k.startle = 1;
      k.fleeX = under ? x : nx;
      k.fleeY = under ? y : ny;
    }
  }

  /**
   * Someone is writing on the shape at `box`: koi lose interest in the resting cursor, and any
   * still under it get a nudge out the near side, since steering alone takes a long fish about
   * twelve seconds and the words are there now. No ring: typing happens too often for one.
   */
  writing(box) {
    this.pointer.active = false;
    const y = box.y + box.height / 2;
    const within = (px, py) => px > box.x && px < box.x + box.width && py > box.y && py < box.y + box.height;
    for (const k of this.koi) {
      const hx = k.nodes[0];
      const hy = k.nodes[1];
      let caught = false;
      for (let n = 0; n < k.nodes.length && !caught; n += 2) caught = within(k.nodes[n], k.nodes[n + 1]);
      if (!caught) continue;
      k.startle = Math.max(k.startle, WRITING_NUDGE);
      k.fleeX = clamp(hx, box.x, box.x + box.width);
      k.fleeY = within(hx, hy) ? hy + Math.sign(y - hy || 1) : clamp(hy, box.y, box.y + box.height);
    }
  }

  /** A loose handful thrown at (x, y): each pellet lands a beat apart with its own splash, then drifts and sinks. */
  feed(x, y) {
    this.lastFeed = this.time;
    this.ripples.push({ x, y, born: this.time, strength: 0.35 });
    // A full pond takes no more food, rather than dropping old pellets out from
    // under koi already going for them.
    const count = Math.min(5 + Math.floor(Math.random() * 3), MAX_PELLETS - this.pellets.length);
    for (let k = 0; k < count; k++) {
      const a = rand(0, TAU);
      const r = Math.sqrt(Math.random()) * THROW_RADIUS;
      const drift = rand(2, 6);
      this.pellets.push({
        x: x + Math.cos(a) * r * 1.3,
        y: y + Math.sin(a) * r,
        born: this.time,
        landAt: rand(0.15, 0.45),
        landed: false,
        vx: Math.cos(a) * drift,
        vy: Math.sin(a) * drift,
      });
    }
  }

  step(dt) {
    this.time += dt;
    this.pointer.speed *= Math.exp(-dt * 8);
    for (const k of this.koi) this.stepKoi(k, dt);
    const t = this.time;
    this.pellets = this.pellets.filter((p) => t - p.born < PELLET_LIFE);
    for (const p of this.pellets) {
      if (!p.landed) {
        if (t - p.born < p.landAt) continue;
        p.landed = true;
        this.ripples.push({ x: p.x, y: p.y, born: t, strength: 0.1 });
        // The splash is what koi react to: every koi in range turns and bolts
        // for it at once.
        for (const k of this.koi) {
          if (Math.hypot(k.nodes[0] - p.x, k.nodes[1] - p.y) < RUSH_RANGE) k.rush = 1;
        }
        continue;
      }
      const damp = Math.exp(-dt * 0.2);
      p.vx *= damp;
      p.vy *= damp;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.ripples = this.ripples.filter((r) => t - r.born < rippleLife(r));
    this.bites = this.bites.filter((b) => t - b.born < BITE_LIFE);
  }

  stepKoi(k, dt) {
    const { width: W, height: H, pointer, time } = this;
    const L = k.length;
    const nodes = k.nodes;
    const hx = nodes[0];
    const hy = nodes[1];

    let dx = Math.cos(k.heading);
    let dy = Math.sin(k.heading);

    k.wander = clamp(k.wander + (Math.random() - 0.5) * dt * 2.4, -0.9, 0.9);
    dx += Math.cos(k.heading + k.wander) * 0.6;
    dy += Math.sin(k.heading + k.wander) * 0.6;

    const food = this.pickFood(k, hx, hy, Math.max(L * 1.6 + 220, k.rush > 0 ? RUSH_RANGE : 0));

    // A fast swipe close by spooks a koi: it bolts away, then calms down over a
    // couple of seconds. A koi already going for food ignores it; feeding beats
    // fear, and clicking to feed moves the mouse fast.
    const pointerD = Math.hypot(pointer.x - hx, pointer.y - hy);
    const feeding = time - this.lastFeed < FEED_CALM;
    if (!food && !feeding && pointer.active && pointer.speed > STARTLE_SPEED && pointerD < L * 0.9) {
      k.startle = 1;
      k.fleeX = pointer.x;
      k.fleeY = pointer.y;
    }
    k.startle = Math.max(0, k.startle - dt * 0.6);
    const fleeing = k.startle > 0.3 && !food;

    let chasing = false;
    let curious = false;
    let closing = 0;
    if (fleeing) {
      const ox = hx - k.fleeX;
      const oy = hy - k.fleeY;
      const d = Math.hypot(ox, oy) || 1;
      dx += (ox / d) * 4 * k.startle;
      dy += (oy / d) * 4 * k.startle;
    } else if (food) {
      const tx = food.x - hx;
      const ty = food.y - hy;
      const d = Math.hypot(tx, ty) || 1;
      dx += (tx / d) * 3;
      dy += (ty / d) * 3;
      chasing = true;
      closing = clamp(1 - d / (L * 1.2), 0, 1);
    } else if (pointer.active) {
      const tx = pointer.x - hx;
      const ty = pointer.y - hy;
      const d = Math.hypot(tx, ty) || 1;
      const range = 300;
      if (d < range) {
        // Swim up to the cursor, then circle under it rather than parking.
        const w = k.curiosity * (1 - d / range) * 2.2;
        const near = clamp(d / (L * 0.6), 0, 1);
        dx += ((tx / d) * near - (ty / d) * (1 - near)) * w;
        dy += ((ty / d) * near + (tx / d) * (1 - near)) * w;
        curious = true;
      }
    }

    for (const other of this.koi) {
      if (other === k) continue;
      const ohx = other.nodes[0];
      const ohy = other.nodes[1];
      if (Math.abs(ohx - hx) > L * 2 || Math.abs(ohy - hy) > L * 2) continue;
      for (let n = 0; n < KOI_NODES; n += 3) {
        const ox = hx - other.nodes[n * 2];
        const oy = hy - other.nodes[n * 2 + 1];
        const d = Math.hypot(ox, oy);
        // Koi going for food jostle in close, so personal space shrinks and
        // never outweighs the pull.
        const range = (L + other.length) * (food ? 0.12 : 0.28);
        if (d < range && d > 1e-3) {
          const w = (1 - d / range) * 2.4;
          dx += (ox / d) * w;
          dy += (oy / d) * w;
        }
      }
      // Loose shoaling: nearby koi drift the same way.
      if (!chasing && Math.hypot(ohx - hx, ohy - hy) < L * 1.6) {
        dx += Math.cos(other.heading) * 0.18;
        dy += Math.sin(other.heading) * 0.18;
      }
    }

    // Drift around page content rather than under it; food and the cursor can
    // still lure them across.
    repel(this.avoid, hx, hy, L * 0.4, push);
    dx += push.x * (chasing || curious ? 0.5 : 1.8);
    dy += push.y * (chasing || curious ? 0.5 : 1.8);

    // Let the body slip off-screen now and then, but always turn back.
    const over = Math.max(-hx, hx - W, -hy, hy - H);
    if (over > -L * 0.25) {
      const w = clamp((over + L * 0.25) / (L * 0.5), 0, 1) * 3.5;
      const toX = W / 2 - hx;
      const toY = H / 2 - hy;
      const d = Math.hypot(toX, toY) || 1;
      dx += (toX / d) * w;
      dy += (toY / d) * w;
    }

    const desired = Math.atan2(dy, dx);
    // Long bodies can't pivot on the spot: the turning circle grows with length.
    const agility =
      (1 + k.rush * 0.6) *
      Math.min(fleeing ? 3 : chasing ? 1.9 + closing : curious ? 1.2 : 0.7, (k.speed / L) * 4);
    const maxTurn = agility * dt;
    const turned = clamp(angleDiff(k.heading, desired), -maxTurn, maxTurn);
    k.heading += turned;
    k.turn += (turned / dt - k.turn) * Math.min(1, dt * 3);

    // Burst and coast: a few strong tail beats, then a long glide that bleeds
    // off speed. Chasing or fleeing koi beat without pause.
    if (time > k.nextBurst && time > k.burstUntil) {
      k.burstUntil = time + rand(0.7, 1.6);
      k.nextBurst = k.burstUntil + rand(1.2, 4);
    }
    const bursting = fleeing || chasing || time < k.burstUntil;
    k.beat += ((bursting ? 1 : 0) - k.beat) * Math.min(1, dt * 3);
    // Tail beats near the surface push small rings out behind the koi; gliding
    // or deep koi leave none.
    if (k.beat > 0.6 && k.depth > 0.65 && time > k.nextWake) {
      const tail = (KOI_NODES - 3) * 2;
      this.ripples.push({ x: nodes[tail], y: nodes[tail + 1], born: time, strength: 0.25 + 0.2 * k.depth });
      k.nextWake = time + rand(0.8, 1.6) / k.beat;
    }
    k.rush = Math.max(0, k.rush - dt * 0.7);
    const cruise = 12 + L * 0.05;
    const target =
      (1 + k.rush * 0.8) *
      (fleeing
        ? cruise * 3.2
        : chasing
          ? cruise * (1.9 + closing)
          : bursting
            ? cruise * (curious ? 1.6 : 1.35)
            : cruise * 0.45);
    k.speed += (target - k.speed) * Math.min(1, dt * (bursting ? 1.6 + k.rush * 3 : 0.35));
    k.phase += dt * (0.6 + k.beat * (2.2 + k.speed / 11));
    k.finPhase += dt * 2.4;
    k.gulp += ((chasing && closing > 0.55 ? 1 : 0) - k.gulp) * Math.min(1, dt * 6);

    // Koi drift between the deep and the surface, and rise for food.
    if (time > k.nextDive) {
      k.depthTarget = rand(0.5, k.depthMax);
      k.nextDive = time + rand(8, 20);
    }
    k.depth += ((chasing ? 1 : k.depthTarget) - k.depth) * Math.min(1, dt * (chasing ? 0.8 : 0.15));

    nodes[0] += Math.cos(k.heading) * k.speed * dt;
    nodes[1] += Math.sin(k.heading) * k.speed * dt;

    const seg = L / (KOI_NODES - 1);
    const maxBend = 0.16;
    let prevAngle = k.heading + Math.PI;
    for (let n = 1; n < KOI_NODES; n++) {
      const px = nodes[(n - 1) * 2];
      const py = nodes[(n - 1) * 2 + 1];
      let angle = Math.atan2(nodes[n * 2 + 1] - py, nodes[n * 2] - px);
      angle = prevAngle + clamp(angleDiff(prevAngle, angle), -maxBend, maxBend);
      nodes[n * 2] = px + Math.cos(angle) * seg;
      nodes[n * 2 + 1] = py + Math.sin(angle) * seg;
      prevAngle = angle;
    }

    const mouthR = L * 0.08 + 6;
    const before = this.pellets.length;
    this.pellets = this.pellets.filter(
      (p) => !p.landed || (p.x - nodes[0]) ** 2 + (p.y - nodes[1]) ** 2 > mouthR * mouthR
    );
    if (this.pellets.length < before) {
      this.ripples.push({ x: nodes[0], y: nodes[1], born: time, strength: 0.6 });
      this.bites.push({ x: nodes[0], y: nodes[1], born: time });
      k.nextSurface = time + rand(6, 16);
    } else if (time > k.nextSurface) {
      this.ripples.push({ x: nodes[0], y: nodes[1], born: time, strength: 0.3 });
      k.nextSurface = time + rand(8, 20);
    }
  }

  /** Keep the current target while it lasts; only switch for a pellet less than half as far away. */
  pickFood(k, x, y, range) {
    if (k.food && !this.pellets.includes(k.food)) k.food = null;
    const nearest = this.nearestPellet(x, y, range);
    if (!k.food) return (k.food = nearest);
    const current = Math.hypot(k.food.x - x, k.food.y - y);
    if (current > range * 1.3) k.food = nearest;
    else if (nearest && Math.hypot(nearest.x - x, nearest.y - y) < current * 0.5) k.food = nearest;
    return k.food;
  }

  nearestPellet(x, y, range) {
    let best = null;
    let bestD = range * range;
    for (const p of this.pellets) {
      if (!p.landed) continue;
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }
}

function rippleLife(r) {
  return 2.2 + r.strength * 1.6;
}
return { TAU, KOI_NODES, RIPPLE_SPEED, clamp, smoothstep, angleDiff, hash3, ACCENTS, ACCENT_PRESETS, PALETTE_PRESETS, VARIETIES, PELLET_LIFE, BITE_LIFE, PELLET_SINK, World, rippleLife };
})();
const { TAU, KOI_NODES, RIPPLE_SPEED, clamp, smoothstep, angleDiff, hash3, ACCENTS, ACCENT_PRESETS, PALETTE_PRESETS, VARIETIES, PELLET_LIFE, BITE_LIFE, PELLET_SINK, World, rippleLife } = __m_world;

/* ── shape ─────────────────────────────────────────────────────────────── */
const __m_shape = (() => {
/**
 * shape.js — the koi outline, ported from the original site's `shape.ts`.
 *
 * A point is classified against the body in *body space*: `s` runs along the
 * spine from snout (0) to tail tip (1), `a` is the distance from it, and `past`
 * says how far beyond the tail tip the point sits. The classifier returns which
 * part of the fish a point landed on, plus the fin-ray direction for the parts
 * that need one.
 */


const FLAG_BODY = 1;
const FLAG_FIN = 2;
const FLAG_EYE = 3;
const FLAG_DORSAL = 4;
const FLAG_BARBEL = 5;

// Top-down outline as a fraction of length: blunt round head, plump shoulders,
// narrow tail stalk.
function bodyHalfWidth(s) {
  if (s < 0.12) return 0.11 * Math.pow(Math.sin(((s / 0.12) * Math.PI) / 2), 0.55);
  if (s < 0.3) return 0.11 + 0.025 * smoothstep(0.12, 0.3, s);
  return 0.033 + 0.102 * (1 - smoothstep(0.3, 0.74, s));
}

const BODY_END = 0.74;

// Butterfly tail: fans out from the stalk, with a V notch in the trailing edge.
function tailHalfWidth(s) {
  return 0.03 + 0.15 * Math.pow(smoothstep(0.7, 1, s), 0.8);
}

/** Test a point against a fin: an ellipse leaning back from a root on the body's edge. */
function inFin(s, a, rootS, angle, reach, width, out, girth = 1) {
  const rootA = bodyHalfWidth(rootS) * 0.85 * girth;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const du = s - rootS;
  const da = a - rootA;
  const along = du * cosA + da * sinA - reach;
  const perp = -du * sinA + da * cosA;
  // `girth` widens the fin with the body: its reach is along the spine (unchanged),
  // its breadth across it (scaled).
  if ((along / reach) ** 2 + (perp / (width * girth)) ** 2 > 1) return false;
  out.flag = FLAG_FIN;
  out.du = du;
  out.da = da;
  return true;
}

/**
 * Classify a point given in body coordinates, all as fractions of length:
 * `s` along the spine (0 snout, 1 tail tip), `a` distance from it, and `past`
 * how far it sits beyond the tail tip. `flare` spreads the fins.
 */
function classify(s, a, past, flare, out, ahead = 0, lateral = 0, girth = 1) {
  out.flag = 0;
  out.across = 1;
  out.du = 1;
  out.da = 0;

  // Barbels: a short whisker angling out from each corner of the mouth, the tell
  // that this is a koi.
  if (ahead > 0) {
    if (ahead < 0.05 && Math.abs(lateral - (0.045 + ahead * 0.7)) < 0.016) {
      out.flag = FLAG_BARBEL;
      return true;
    }
    return false;
  }

  // `girth` widens the body without lengthening it. The half-width profile is in
  // fractions of *length*, so a fish that is merely shorter already comes out
  // rounder; this is the second half of the same trick, and it is what lets a
  // goldfish share the koi's spine instead of needing an outline of its own.
  const g = girth > 0 ? girth : 1;
  const w = bodyHalfWidth(s) * g;
  if (s <= BODY_END && a <= w) {
    const across = a / w;
    out.across = across;
    if (s > 0.055 && s < 0.1 && across > 0.5 && across < 0.85) out.flag = FLAG_EYE;
    else if (s > 0.28 && s < 0.6 && across < 0.14) out.flag = FLAG_DORSAL;
    else out.flag = FLAG_BODY;
    return true;
  }

  if (s > 0.68 && past <= 0) {
    const tw = tailHalfWidth(s) * flare;
    if (a <= tw && s <= 0.86 + 0.14 * (a / tw)) {
      out.flag = FLAG_FIN;
      out.da = (a / tw) * 0.8;
      return true;
    }
  }

  return (
    inFin(s, a, 0.19, 0.85 + 0.5 * (flare - 1), 0.066 * flare, 0.04, out, g) ||
    inFin(s, a, 0.47, 0.75, 0.036, 0.018, out, g)
  );
}
return { FLAG_BODY, FLAG_FIN, FLAG_EYE, FLAG_DORSAL, FLAG_BARBEL, bodyHalfWidth, classify };
})();
const { FLAG_BODY, FLAG_FIN, FLAG_EYE, FLAG_DORSAL, FLAG_BARBEL, bodyHalfWidth, classify } = __m_shape;

/* ── renderer ─────────────────────────────────────────────────────────────── */
const __m_renderer = (() => {
/**
 * renderer.js — the ASCII rasteriser, ported from the original site's `renderer.ts`.
 *
 * The fish are not drawn, they are *etched*: the pond is a grid of monospace
 * cells, each carrying one glyph, one glyph colour, one tile fill and one
 * tile alpha. Body coverage is sampled at five points per cell (centre plus
 * four quarter points), shading comes from a round-body luminance profile, and
 * glyph density encodes brightness — the halftone trick that makes a koi read
 * as ink on paper rather than as a vector sprite.
 *
 * Two details matter more than the rest, and both are preserved exactly:
 *
 *  - Glyph keys are hashed from *body* coordinates (`s`, `v`) and the koi id,
 *    never from screen position, so a glyph rides along with the skin instead
 *    of flickering every frame.
 *  - The two palettes are not inverses of each other. On dark, a koi is lighter
 *    than the paper and its glyphs are dark; on light, a koi is darker than the
 *    paper and its tiles are pale. Same algorithm, opposite contrast direction.
 */



const DARK = {
  bg: [26, 25, 33],
  white: [236, 228, 218],
  red: [232, 96, 56],
  black: [92, 90, 108],
  // Asagi's back. Cooler and lighter than `black`, so the fish reads as blue-grey
  // rather than as a black fish with a blue belly.
  slate: [120, 132, 146],
  fin: [214, 206, 198],
  eye: [20, 20, 26],
  water: [255, 247, 240],
  shadow: [0, 0, 0],
  shadowAlpha: 0.55,
  pellet: [236, 170, 92],
  alpha: 0.8,
  depthFloor: 0.4,
  tile: [0.68, 0.98],
  hi: [
    [112, 22, 24],
    [168, 34, 28],
    [214, 58, 30],
    [240, 96, 34],
    [250, 138, 52],
    [255, 178, 96],
  ],
  ink: 0.42,
};

// Paper page: tiles are pale washes of the skin colour with dark glyphs etched on top.
const LIGHT = {
  bg: [245, 244, 241],
  white: [112, 108, 104],
  red: [204, 62, 28],
  black: [36, 33, 40],
  slate: [104, 116, 128],
  fin: [138, 132, 126],
  eye: [24, 22, 26],
  water: [38, 37, 35],
  shadow: [60, 58, 56],
  shadowAlpha: 0.2,
  pellet: [176, 108, 40],
  alpha: 0.9,
  depthFloor: 0.55,
  tile: [0.78, 0.55],
  hi: [
    [138, 24, 22],
    [184, 38, 24],
    [222, 62, 28],
    [238, 100, 38],
    [244, 140, 66],
    [248, 176, 116],
  ],
  ink: 0.45,
};

// Dense glyphs etched into each skin tile, sparse where it catches the light.
const TILE_GLYPHS = 't%SX8@#';
const SUBSAMPLES = [0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.75, 0.75];

// A line glyph that follows a direction in screen space, for fin rays and ripple rings.
function lineGlyph(dx, dy) {
  const d = Math.hypot(dx, dy) || 1;
  if (Math.abs(dy) < 0.38 * d) return '-';
  if (Math.abs(dx) < 0.38 * d) return '|';
  return dx * dy > 0 ? '\\' : '/';
}

function valueNoise(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smoothstep(0, 1, x - xi);
  const v = smoothstep(0, 1, y - yi);
  const a = hash3(xi, yi, seed);
  const b = hash3(xi + 1, yi, seed);
  const c = hash3(xi, yi + 1, seed);
  const d = hash3(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function inPatch(m, s, vn, wobble) {
  return ((s - m.s) / m.rs) ** 2 + ((vn - m.v) / m.rv) ** 2 < 1 + wobble;
}

/** '#rrggbb' to [r, g, b]. */
function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/**
 * A six-stop ramp for one pigment, from shadowed to sunlit.
 *
 * The original theme had a single hard-coded vermilion ramp. A pond with more
 * than one colour needs the same *shape* of ramp for every pigment, so the stops
 * are derived from the accent itself: darken toward the page colour for the
 * shadowed end, lift toward the water colour for the lit end. That keeps every
 * fish shaded by the same logic, and stops a gold koi from reading as a red one
 * with a different hue.
 */
function rampFor(accent, palette) {
  const base = hexToRgb(accent);
  const shadow = palette.bg;
  const light = palette.water;
  return [
    mix(base, shadow, 0.55),
    mix(base, shadow, 0.3),
    base,
    mix(base, light, 0.18),
    mix(base, light, 0.38),
    mix(base, light, 0.58),
  ];
}

/**
 * Each koi gets a fixed set of markings, seeded by its id, so every fish carries
 * a clear pattern. The varieties are the ones a real pond is stocked with:
 *
 *  - kohaku  white, with an accent head and two or three saddles
 *  - sanke   kohaku plus small black spots
 *  - tancho  white, with a single accent disc on the crown
 *  - showa   black back, with accent and white patches
 *  - ogon    a single metallic colour, paler along the belly
 *  - asagi   slate back, accent along the belly
 *  - bekko   white, with black spots only
 *
 * \`base\` is what the body is where no patch applies; the lists are drawn over
 * it. Keeping the pattern in body coordinates is what makes a fish look like it
 * is swimming rather than like a texture sliding over it.
 */
function koiMarkings(k) {
  const r = (j) => hash3(k.id, j, 41);
  const saddles = (count, start = 0.25, spanTotal = 0.42) => {
    const out = [];
    const span = spanTotal / count;
    for (let j = 0; j < count; j++) {
      out.push({
        s: start + span * (j + 0.5) + (r(10 + j) - 0.5) * span * 0.3,
        v: (r(20 + j) - 0.5) * 0.05,
        rs: span * (0.32 + r(30 + j) * 0.12),
        rv: 0.09 + r(40 + j) * 0.05,
      });
    }
    return out;
  };
  const spots = (count, spread = 0.44) => {
    const out = [];
    for (let j = 0; j < count; j++) {
      out.push({ s: 0.24 + r(60 + j) * spread, v: (r(70 + j) - 0.5) * 0.16, rs: 0.022, rv: 0.026 });
    }
    return out;
  };

  switch (k.variety) {
    case 'tancho':
      return { base: 'white', accent: [{ s: 0.11, v: 0, rs: 0.05, rv: 0.055 }], black: [], white: [] };
    case 'ogon':
      return { base: 'accent', accent: [], black: [], white: [] };
    case 'asagi':
      return { base: 'slate', accent: [{ s: 0.5, v: 0, rs: 0.34, rv: 0.2 }], black: [], white: [] };
    case 'bekko':
      return { base: 'white', accent: [], black: spots(6, 0.5), white: [] };
    case 'showa': {
      const white = [];
      const patches = 2 + Math.floor(r(40) * 2);
      for (let j = 0; j < patches; j++) {
        white.push({ s: 0.2 + r(80 + j) * 0.5, v: (r(90 + j) - 0.5) * 0.18, rs: 0.05, rv: 0.07 });
      }
      return { base: 'black', accent: saddles(2 + Math.floor(r(3) * 2)), black: [], white };
    }
    case 'utsuri':
      // The inverse of showa: a black fish carrying accent saddles, no white.
      return { base: 'black', accent: saddles(2 + Math.floor(r(3) * 2)), black: [], white: [] };
    case 'shiro':
      // White under large black saddles — utsuri's mirror image.
      return { base: 'white', accent: [], black: saddles(2 + Math.floor(r(3) * 2)), white: [] };
    case 'momiji':
      // A solid accent body broken up by a few white patches. Ogon is the same
      // body with nothing on it, which is what makes this read as its own fish.
      return { base: 'accent', accent: [], black: [], white: saddles(2, 0.3, 0.42) };
    case 'goshiki':
      // The blue-bodied variety: a slate back with a scatter of accent spots.
      return { base: 'slate', accent: spots(5, 0.4), black: [], white: [] };
    case 'sanke':
      return {
        base: 'white',
        accent: saddles(2 + Math.floor(r(3) * 2)),
        black: spots(4 + Math.floor(r(50) * 3)),
        white: [],
      };
    default: {
      const accent = [];
      if (r(0) < 0.75) accent.push({ s: 0.1, v: (r(1) - 0.5) * 0.03, rs: 0.055 + r(2) * 0.03, rv: 0.11 });
      accent.push(...saddles(2 + Math.floor(r(3) * 2)));
      return { base: 'white', accent, black: [], white: [] };
    }
  }
}

/**
 * The tone names each palette provides. Exported so a test can prove that every
 * variety's base tone exists in *both* palettes — the check that would have
 * caught the missing `slate` before it froze the pond.
 */
function paletteTones() {
  return { dark: Object.keys(DARK), light: Object.keys(LIGHT) };
}

const packRgb = (c) => (c[0] << 16) | (c[1] << 8) | c[2];

const mix = (a, b, k) => [
  (a[0] + (b[0] - a[0]) * k) | 0,
  (a[1] + (b[1] - a[1]) * k) | 0,
  (a[2] + (b[2] - a[2]) * k) | 0,
];
const shade = (c, k) => [
  Math.min(255, c[0] * k) | 0,
  Math.min(255, c[1] * k) | 0,
  Math.min(255, c[2] * k) | 0,
];

/** Sample a colour ramp at t in [0, 1]. */
function ramp(stops, t) {
  const x = clamp(t, 0, 1) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return mix(stops[i], stops[i + 1], x - i);
}

class KoiRenderer {
  constructor(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
    this.dpr = 1;
    this.cw = 8;
    this.ch = 12;
    this.cols = 0;
    this.rows = 0;
    this.palette = options.isLight ? LIGHT : DARK;
    this.styles = new Map();
    this.markingCache = new Map();
    this.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    /** Cell budget for the whole grid; the shell can be large, so it is capped. */
    this.maxCells = options.maxCells ?? 26000;

    this.energy = new Float32Array(0);
    this.energyTmp = new Float32Array(0);
    this.cellGlyph = new Uint16Array(0);
    this.cellColor = new Uint32Array(0);
    this.cellAlpha = new Float32Array(0);
    this.cellTile = new Uint32Array(0);
    this.cellTileAlpha = new Float32Array(0);
    this.cellDim = new Float32Array(0);
    this.cellShadow = new Uint8Array(0);

    this.spine = new Float32Array(KOI_NODES * 2);
    this.arc = new Float32Array(KOI_NODES);
    this.arcTotal = 1;
    this.flareLeft = 1;
    this.flareRight = 1;
    this.girth = 1;
    // Scratch outputs of sample(), to avoid allocating per sample.
    this.hit = { flag: 0, across: 1, du: 1, da: 0 };
    this.hitS = 0;
    this.hitV = 0;
    this.hitDist = 0;
    this.hitTx = 1;
    this.hitTy = 0;
    this.hitSeg = 0;
  }

  setTheme(isLight) {
    this.palette = isLight ? LIGHT : DARK;
  }

  /** Wipe the canvas and stop drawing — used when the user asks for no transparency. */
  clear() {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.cellGlyph.fill(0);
    this.cellTileAlpha.fill(0);
    this.cellShadow.fill(0);
    this.energy.fill(0);
  }

  resize(width, height, dpr) {
    this.dpr = dpr;
    // Near-square tiles, large enough to read each etched glyph. On a very large
    // shell the tile grows instead of the grid exploding: the pond stays cheap.
    let cw = clamp(Math.round(width / 125), 8, 12);
    let ch = cw + 2;
    const budget = this.maxCells;
    while (Math.ceil(width / cw) * Math.ceil(height / ch) > budget && cw < 26) {
      cw += 1;
      ch = cw + 2;
    }
    this.cw = cw;
    this.ch = ch;
    this.cols = Math.ceil(width / cw);
    this.rows = Math.ceil(height / ch);
    this.ctx.canvas.width = Math.round(width * dpr);
    this.ctx.canvas.height = Math.round(height * dpr);

    const n = this.cols * this.rows;
    this.energy = new Float32Array(n);
    this.energyTmp = new Float32Array(n);
    this.cellGlyph = new Uint16Array(n);
    this.cellColor = new Uint32Array(n);
    this.cellAlpha = new Float32Array(n);
    this.cellTile = new Uint32Array(n);
    this.cellTileAlpha = new Float32Array(n);
    this.cellDim = new Float32Array(n).fill(1);
    this.cellShadow = new Uint8Array(n);
  }

  /**
   * Fade koi under these canvas-space boxes, easing back in over a few cells
   * around them.
   *
   * `groups` is a list of `{ boxes, floor }`: each group says how visible a koi
   * stays at the *centre* of its boxes, from 1 (untouched) down to 0 (gone). The
   * site has one such group — its prose block, at 0.15 — because prose is the
   * only thing drawn over the water. A shell has two: the places where bare text
   * sits on the water (fade gently, as the site does) and the transcript, where
   * every message is text over water and a koi must be a whisper or the words
   * stop being readable.
   */
  setDimBoxes(groups) {
    const { cols, rows, cw, ch, cellDim } = this;
    cellDim.fill(1);
    const pad = cw * 4;
    for (const group of groups) for (const b of group.boxes) {
      const floor = group.floor;
      // A `restore` group raises the floor rather than lowering it: used where a
      // block paints its own tint, so the water beneath it does not also have to
      // be faded. Groups run in order, so a restore after the dim wins.
      const restore = group.mode === 'restore';
      const c0 = Math.max(0, Math.floor((b.left - pad) / cw));
      const c1 = Math.min(cols - 1, Math.floor((b.right + pad) / cw));
      const r0 = Math.max(0, Math.floor((b.top - pad) / ch));
      const r1 = Math.min(rows - 1, Math.floor((b.bottom + pad) / ch));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const x = c * cw + cw / 2;
          const y = r * ch + ch / 2;
          const d = Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom));
          const i = r * cols + c;
          const target = floor + (1 - floor) * smoothstep(0, pad, d);
          cellDim[i] = restore ? Math.max(cellDim[i], target) : Math.min(cellDim[i], target);
        }
      }
    }
  }

  render(world, dt) {
    const { ctx, dpr, cols } = this;
    if (cols === 0) return;

    this.cellGlyph.fill(0);
    this.cellTileAlpha.fill(0);
    this.cellShadow.fill(0);
    // Deeper koi first, so the ones near the surface glide over them.
    for (const k of [...world.koi].sort((a, b) => a.depth - b.depth)) this.rasterizeKoi(k, world.time);
    this.depositWake(world);
    this.diffuse(dt);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `600 ${Math.round(this.ch * 0.72)}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    this.drawShadows();
    this.drawWake();
    this.drawRipples(world);
    this.drawPellets(world);
    this.drawCells();
    this.drawBites(world);
    ctx.globalAlpha = 1;
  }

  style(rgb) {
    let s = this.styles.get(rgb);
    if (!s) {
      s = `rgb(${rgb >>> 16},${(rgb >>> 8) & 255},${rgb & 255})`;
      this.styles.set(rgb, s);
    }
    return s;
  }

  glyphAt(i, glyph, rgb, alpha) {
    const { ctx, cw, ch, cols } = this;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.style(packRgb(rgb));
    ctx.fillText(glyph, (i % cols) * cw + cw / 2, ((i / cols) | 0) * ch + ch / 2);
  }

  cellIndex(x, y) {
    const c = Math.floor(x / this.cw);
    const r = Math.floor(y / this.ch);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
    return r * this.cols + c;
  }

  // ── koi ─────────────────────────────────────────────────────────────

  /** Find the nearest point on the render spine, then classify it against the koi's outline. */
  sample(px, py, L, from = 0, to = KOI_NODES - 2) {
    const { spine, arc } = this;
    let best = Infinity;
    let bestS = 0;
    let bestSign = 1;
    let past = 0;
    let ahead = 0;
    let lateral = 0;
    for (let n = from; n <= to; n++) {
      const ax = spine[n * 2];
      const ay = spine[n * 2 + 1];
      const sx = spine[(n + 1) * 2] - ax;
      const sy = spine[(n + 1) * 2 + 1] - ay;
      const len2 = sx * sx + sy * sy || 1;
      const raw = ((px - ax) * sx + (py - ay) * sy) / len2;
      const u = clamp(raw, 0, 1);
      const d2 = (px - ax - sx * u) ** 2 + (py - ay - sy * u) ** 2;
      if (d2 < best) {
        const len = Math.sqrt(len2);
        best = d2;
        bestS = (arc[n] + u * len) / this.arcTotal;
        bestSign = sx * (py - ay) - sy * (px - ax) >= 0 ? 1 : -1;
        past = n === KOI_NODES - 2 ? Math.max(0, raw - 1) * len : 0;
        ahead = n === 0 ? Math.max(0, -raw) * len : 0;
        lateral = Math.abs(sx * (py - ay) - sy * (px - ax)) / len;
        this.hitTx = sx / len;
        this.hitTy = sy / len;
        this.hitSeg = n;
      }
    }

    const a = Math.sqrt(best);
    this.hitDist = a;
    this.hitS = bestS;
    this.hitV = a * bestSign;
    return classify(
      bestS,
      a / L,
      past / L,
      bestSign > 0 ? this.flareLeft : this.flareRight,
      this.hit,
      ahead / L,
      lateral / L,
      this.girth
    );
  }

  /**
   * Skin kind for a body point, from the koi's own markings pinned to body
   * coordinates. Returns a *kind* rather than a colour: the accent differs per
   * fish, so the caller resolves it against that fish's ramp.
   */
  skin(k, s, v, across) {
    const vn = v / k.length;
    // Belly edges and the tail stalk stay pale on every variety, which frames
    // the markings.
    if (across > 0.9 || s > 0.74) return 'white';
    // Ragged edges, so patches read as painted markings rather than ellipses.
    const wobble = (valueNoise(s * 14 + k.id, vn * 30, k.id + 3) - 0.5) * 0.6;
    const markings = this.markings(k);
    for (const m of markings.black) if (inPatch(m, s, vn, wobble)) return 'black';
    for (const m of markings.white) if (inPatch(m, s, vn, wobble)) return 'white';
    for (const m of markings.accent) if (inPatch(m, s, vn, wobble)) return 'accent';
    return markings.base;
  }

  /** Markings and ramp for one fish, cached by identity so a re-seed refreshes them. */
  markings(k) {
    const key = k.id + ':' + k.variety + ':' + k.accent;
    let m = this.markingCache.get(key);
    if (!m) {
      m = koiMarkings(k);
      this.markingCache.set(key, m);
    }
    return m;
  }

  /** The six-stop pigment ramp for one fish. */
  ramp(k) {
    const key = 'ramp:' + k.id + ':' + k.accent;
    let r = this.markingCache.get(key);
    if (!r) {
      r = rampFor(k.accent, this.palette);
      this.markingCache.set(key, r);
    }
    return r;
  }

  rasterizeKoi(k, t) {
    const { spine, arc, cw, ch, cols, rows, cellGlyph, cellColor, cellAlpha, cellTile, cellTileAlpha, palette } = this;
    const L = k.length;
    const nodes = k.nodes;
    // The body only undulates while the tail is beating; coasting koi hold
    // almost straight.
    const swim = 0.2 + 1.1 * k.beat;

    // Travelling body wave that grows toward the tail.
    for (let n = 0; n < KOI_NODES; n++) {
      const s = n / (KOI_NODES - 1);
      const a = Math.max(0, n - 1);
      const b = Math.min(KOI_NODES - 1, n + 1);
      let tx = nodes[a * 2] - nodes[b * 2];
      let ty = nodes[a * 2 + 1] - nodes[b * 2 + 1];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl;
      ty /= tl;
      const amp = L * 0.04 * (0.05 + 0.95 * Math.pow(s, 2.2)) * swim;
      const off = amp * Math.sin(k.phase - s * 4.6);
      spine[n * 2] = nodes[n * 2] - ty * off;
      spine[n * 2 + 1] = nodes[n * 2 + 1] + tx * off;
    }
    arc[0] = 0;
    for (let n = 1; n < KOI_NODES; n++) {
      arc[n] =
        arc[n - 1] + Math.hypot(spine[n * 2] - spine[(n - 1) * 2], spine[n * 2 + 1] - spine[(n - 1) * 2 + 1]);
    }
    this.arcTotal = arc[KOI_NODES - 1] || 1;
    // Pectorals tuck in during a burst, scull in turn while coasting, and the
    // inner one spreads to brake on a turn.
    const spread = 1 - 0.25 * k.beat;
    const scull = 0.18 * (1 - k.beat) * Math.sin(k.finPhase);
    const bank = clamp(k.turn * 0.6, -0.35, 0.35);
    // Per-fish proportions: `girth` widens the body *and* its fins (a goldfish),
    // while `flareBias` opens the tail fan out without touching the body.
    this.girth = k.girth || 1;
    const bias = k.flareBias || 1;
    this.flareLeft = (spread + scull - bank) * bias;
    this.flareRight = (spread - scull + bank) * bias;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let n = 0; n < KOI_NODES; n++) {
      minX = Math.min(minX, spine[n * 2]);
      maxX = Math.max(maxX, spine[n * 2]);
      minY = Math.min(minY, spine[n * 2 + 1]);
      maxY = Math.max(maxY, spine[n * 2 + 1]);
    }
    // A goldfish's tail fans wider than a koi's, so its raster box is grown rather
    // than the common case paying for it.
    const reach = L * (k.flareBias > 1 ? 0.38 : 0.26);
    const c0 = Math.max(0, Math.floor((minX - reach) / cw));
    const c1 = Math.min(cols - 1, Math.floor((maxX + reach) / cw));
    const r0 = Math.max(0, Math.floor((minY - reach) / ch));
    const r1 = Math.min(rows - 1, Math.floor((maxY + reach) / ch));
    if (c0 > c1 || r0 > r1) return;

    const diag = Math.hypot(cw, ch);
    // Near the surface a koi is brighter and its shadow falls farther away on
    // the floor.
    const shadowDc = Math.round((L * 0.07 * k.depth) / cw) + 1;
    const shadowDr = Math.round((L * 0.05 * k.depth) / ch) + 1;
    const dim = palette.alpha * (palette.depthFloor + (1 - palette.depthFloor) * k.depth);
    const [tile0, tile1] = palette.tile;
    const hit = this.hit;

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const x = c * cw;
        const y = r * ch;
        const centerHit = this.sample(x + cw / 2, y + ch / 2, L);
        // Nothing reaches far from the spine at the waist, where the fins end.
        if (!centerHit && this.hitDist > L * (this.hitS > 0.4 && this.hitS < 0.62 ? 0.15 : 0.25) + diag) {
          // Distance to the spine changes by at most a cell per cell, so skip
          // cells that can't reach it.
          c += Math.max(0, Math.floor((this.hitDist - L * 0.25 - diag) / cw));
          continue;
        }
        // Sub-samples sit within a cell of the centre, so only the neighbouring
        // segments can be nearest.
        const from = Math.max(0, this.hitSeg - 2);
        const to = Math.min(KOI_NODES - 2, this.hitSeg + 2);
        let { flag, across } = hit;
        let s = this.hitS;
        let v = this.hitV;
        let tx = this.hitTx;
        let ty = this.hitTy;

        let hits = centerHit ? 1 : 0;
        // Points from the cell centre toward the covered side, i.e. across the
        // outline into the koi.
        let gx = 0;
        let gy = 0;
        // Cells well inside the body can't have a sub-sample outside it, so skip
        // straight to full coverage.
        const deepInside =
          centerHit &&
          flag !== FLAG_FIN &&
          flag !== FLAG_BARBEL &&
          s > 0.04 &&
          s < 0.72 &&
          bodyHalfWidth(s) * L - this.hitDist > diag * 0.35;
        if (deepInside) hits = 5;
        for (let q = 0; !deepInside && q < SUBSAMPLES.length; q += 2) {
          if (!this.sample(x + SUBSAMPLES[q] * cw, y + SUBSAMPLES[q + 1] * ch, L, from, to)) continue;
          gx += (SUBSAMPLES[q] - 0.5) * cw;
          gy += (SUBSAMPLES[q + 1] - 0.5) * ch;
          if (hits === 0) {
            ({ flag, across } = hit);
            s = this.hitS;
            v = this.hitV;
            tx = this.hitTx;
            ty = this.hitTy;
          }
          hits++;
        }
        if (hits === 0) continue;
        this.hitTx = tx;
        this.hitTy = ty;
        const coverage = hits / 5;
        const side = v >= 0 ? 1 : -1;

        const i = r * cols + c;
        // Body-anchored key so each glyph rides along with the skin.
        const key = (hash3(Math.round(s * 90), Math.round(v / (cw * 0.8)), k.id) * 4294967295) >>> 0;
        const solid = centerHit && coverage >= 0.6;

        let glyph = ' ';
        let rgb = palette.fin;
        let alpha = dim;
        let tile = null;
        let tileAlpha = 0;
        if (flag === FLAG_BARBEL) {
          // Drawn along the whisker: forward from the mouth and angled out to its
          // side.
          glyph = lineGlyph(-tx - side * ty * 0.7, -ty + side * tx * 0.7);
          rgb = shade(mix(palette.bg, palette.fin, 0.9), palette.ink + 0.3);
        } else if (flag === FLAG_EYE && solid) {
          tile = mix(palette.bg, palette.eye, 0.85);
          tileAlpha = dim;
          glyph = 'o';
          rgb = mix(palette.bg, palette.white, 0.9);
        } else if (flag === FLAG_FIN) {
          // Fins are a pale veil of tiles flecked with dots, so they never
          // compete with the body.
          tile = mix(palette.bg, palette.fin, 0.55);
          tileAlpha = dim * 0.45 * coverage;
          if (key % 2 === 0) {
            glyph = '.';
            alpha *= 0.6 * coverage;
          }
        } else {
          // Each skin cell is a tile washed in the skin colour, shaded like a
          // rounded back lit from the top-left, with a dense glyph etched on top.
          // Edge cells get a paler, empty tile.
          const skin = this.skin(k, s, v, across);
          const facing = side * (0.6 * ty - 0.8 * tx) * across;
          const lum = clamp(0.22 + 0.5 * Math.sqrt(1 - across * across) + 0.18 * facing, 0, 1);
          if (skin === 'accent') {
            // Pigment patches run the full ramp: shadowed at the flanks, lit
            // across the back. Each koi leans a little within its own hue, and a
            // slow body-pinned noise varies it like real pigment.
            const lean = (hash3(k.id, 5, 17) - 0.5) * 0.3;
            const grain = (valueNoise(s * 9 + k.id, (v / L) * 18, k.id + 21) - 0.5) * 0.25;
            // A band of shine travels down the body, like light sliding over wet
            // scales.
            const sheen = Math.max(0, Math.sin(s * 11 - t * 1.8 + k.id) - 0.7) / 0.3;
            tile = ramp(this.ramp(k), 0.15 + 0.8 * lum + lean + grain + sheen * 0.35);
          } else {
            // `?? palette.white` is deliberate: a variety whose tone is missing
            // from a palette must draw as a pale fish, not throw inside the
            // frame and stop the whole pond.
            const tone =
              (skin === 'black'
                ? palette.black
                : skin === 'slate'
                  ? palette.slate
                  : palette.white) ?? palette.white;
            tile = mix(palette.bg, tone, tile0 + (tile1 - tile0) * lum);
          }
          if (hits === 5) {
            const sc = c + shadowDc;
            const sr = r + shadowDr;
            if (sc < cols && sr < rows) this.cellShadow[sr * cols + sc] = 1;
            tileAlpha = dim;
            if (s < 0.035 && across < 0.6 && k.gulp > 0.5) {
              glyph = 'o';
              rgb = palette.eye;
            } else {
              const jitter = (key >>> 4) % 3;
              glyph = TILE_GLYPHS[clamp(Math.round((1 - lum) * 4) + jitter, 0, TILE_GLYPHS.length - 1)];
              rgb = shade(tile, palette.ink);
              // White skin is etched lightly so the red and black patches carry
              // the pattern.
              if (skin === 'white') alpha *= 0.6;
              // Scales glint on a staggered clock.
              const tick = Math.floor(t * 1.4 + (key % 997) / 97);
              if (hash3(key, tick, 7) < 0.03) tile = mix(tile, palette.bg, 0.45);
            }
          } else {
            tileAlpha = dim * coverage * 0.55;
            if (Math.hypot(gx, gy) > cw * 0.2 && key % 3 === 0) {
              glyph = '.';
              rgb = shade(tile, palette.ink);
            }
          }
        }
        if (glyph === ' ' && tileAlpha === 0) continue;
        cellTile[i] = tile ? packRgb(tile) : 0;
        cellTileAlpha[i] = tileAlpha;
        cellGlyph[i] = glyph.charCodeAt(0);
        cellColor[i] = packRgb(rgb);
        cellAlpha[i] = alpha;
      }
    }
  }

  drawCells() {
    const { ctx, cw, ch, cols, cellGlyph, cellColor, cellAlpha, cellTile, cellTileAlpha, cellDim } = this;
    for (let i = 0; i < cellGlyph.length; i++) {
      const code = cellGlyph[i];
      if (!code) continue;
      const x = (i % cols) * cw;
      const y = ((i / cols) | 0) * ch;
      if (cellTileAlpha[i] > 0) {
        ctx.globalAlpha = cellTileAlpha[i] * cellDim[i];
        ctx.fillStyle = this.style(cellTile[i]);
        ctx.fillRect(x + 1, y + 1, cw - 1, ch - 1);
      }
      if (code === 32) continue;
      ctx.globalAlpha = cellAlpha[i] * cellDim[i];
      ctx.fillStyle = this.style(cellColor[i]);
      ctx.fillText(String.fromCharCode(code), x + cw / 2, y + ch / 2 + 1);
    }
  }

  // ── water ───────────────────────────────────────────────────────────

  depositWake(world) {
    const { energy } = this;
    for (const k of world.koi) {
      for (let n = KOI_NODES - 4; n < KOI_NODES; n++) {
        const i = this.cellIndex(k.nodes[n * 2], k.nodes[n * 2 + 1]);
        if (i >= 0) energy[i] = Math.min(1.5, energy[i] + 0.035 + k.speed * 0.0012);
      }
    }
    if (world.pointer.active) {
      const i = this.cellIndex(world.pointer.x, world.pointer.y);
      if (i >= 0) energy[i] = Math.min(1.5, energy[i] + 0.12);
    }
  }

  /** Blur and decay so wakes spread like ripples and fade. */
  diffuse(dt) {
    const { cols, rows, energy, energyTmp: tmp } = this;
    const decay = Math.exp(-dt * 1.1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const l = c > 0 ? energy[i - 1] : energy[i];
        const rt = c < cols - 1 ? energy[i + 1] : energy[i];
        const u = r > 0 ? energy[i - cols] : energy[i];
        const d = r < rows - 1 ? energy[i + cols] : energy[i];
        tmp[i] = (energy[i] * 4 + l + rt + u + d) * 0.125 * decay;
      }
    }
    this.energy = tmp;
    this.energyTmp = energy;
  }

  drawShadows() {
    const { cellShadow, cellGlyph, cellDim, palette } = this;
    for (let i = 0; i < cellShadow.length; i++) {
      if (!cellShadow[i] || cellGlyph[i]) continue;
      this.glyphAt(i, ':', palette.shadow, palette.shadowAlpha * cellDim[i]);
    }
  }

  drawWake() {
    const { energy, cellGlyph, cellShadow, palette } = this;
    for (let i = 0; i < energy.length; i++) {
      const e = energy[i];
      if (e < 0.22 || cellGlyph[i] || cellShadow[i]) continue;
      this.glyphAt(i, e > 0.5 ? '-' : '.', palette.water, Math.min(1, (e - 0.22) * 1.4) * 0.35);
    }
  }

  /** Expanding rings drawn as ASCII circles: the glyph follows the ring's tangent. */
  drawRipples(world) {
    const { cw, ch, cols, rows, cellGlyph, palette } = this;
    for (const rp of world.ripples) {
      const age = world.time - rp.born;
      const life = rippleLife(rp);
      const fade = Math.pow(1 - age / life, 1.5) * rp.strength;
      // A ring is every point at one distance from the box; a plain ripple's box has no size,
      // which makes that a circle. Past a corner the distance curves, so rings stay rounded.
      const hw = rp.box ? rp.box.width / 2 : 0;
      const hh = rp.box ? rp.box.height / 2 : 0;
      for (let ring = 0; ring < 2; ring++) {
        const radius = Math.max(0, age - ring * 0.45) * RIPPLE_SPEED * (0.7 + 0.5 * rp.strength) * (rp.speed ?? 1);
        if (radius < 2) continue;
        const band = cw * 0.6;
        const c0 = Math.max(0, Math.floor((rp.x - hw - radius - cw) / cw));
        const c1 = Math.min(cols - 1, Math.floor((rp.x + hw + radius + cw) / cw));
        const r0 = Math.max(0, Math.floor((rp.y - hh - radius - ch) / ch));
        const r1 = Math.min(rows - 1, Math.floor((rp.y + hh + radius + ch) / ch));
        const alpha = fade * (ring === 0 ? 0.55 : 0.3);
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const i = r * cols + c;
            if (cellGlyph[i]) continue;
            const dx = c * cw + cw / 2 - rp.x;
            const dy = r * ch + ch / 2 - rp.y;
            const ox = Math.max(Math.abs(dx) - hw, 0);
            const oy = Math.max(Math.abs(dy) - hh, 0);
            const d = Math.hypot(ox, oy);
            if (d === 0 || Math.abs(d - radius) > band) continue; // nothing rings under the box itself
            const glyph = ring === 1 ? '.' : lineGlyph(-Math.sign(dy) * oy, Math.sign(dx) * ox);
            this.glyphAt(i, glyph, palette.water, alpha);
          }
        }
      }
    }
  }

  /** A bite flashes * over the koi's mouth, settling to + then a dot as the splash takes over. */
  drawBites(world) {
    const { palette } = this;
    for (const b of world.bites) {
      const i = this.cellIndex(b.x, b.y);
      if (i < 0) continue;
      const t = (world.time - b.born) / BITE_LIFE;
      const glyph = t < 0.35 ? '*' : t < 0.7 ? '+' : '.';
      this.glyphAt(i, glyph, palette.pellet, Math.min(1, palette.alpha * 1.6) * (1 - t * t));
    }
  }

  /** Pellets fall in (' then .), land as o with a splash, bob while floating, then dim to . as they sink. */
  drawPellets(world) {
    const { cellGlyph, palette, ch } = this;
    for (const p of world.pellets) {
      const age = world.time - p.born;
      if (!p.landed) {
        const fall = age / p.landAt;
        // Drawn a little above where it will land, closing in as it drops.
        const i = this.cellIndex(p.x, p.y - (1 - fall) * ch * 1.5);
        if (i < 0 || cellGlyph[i]) continue;
        this.glyphAt(i, fall < 0.5 ? "'" : '.', palette.pellet, palette.alpha * (0.5 + 0.4 * fall));
        continue;
      }
      const i = this.cellIndex(p.x, p.y);
      if (i < 0 || cellGlyph[i]) continue;
      const sink = smoothstep(PELLET_SINK, PELLET_LIFE, age);
      const bob = 0.8 + 0.2 * Math.sin(age * 3 + p.x);
      this.glyphAt(i, sink > 0.55 ? '.' : 'o', palette.pellet, palette.alpha * bob * (1 - 0.85 * sink));
    }
  }
}


return { koiMarkings, paletteTones, KoiRenderer };
})();
const { koiMarkings, paletteTones, KoiRenderer } = __m_renderer;
return { TAU, KOI_NODES, RIPPLE_SPEED, clamp, smoothstep, angleDiff, hash3, ACCENTS, ACCENT_PRESETS, PALETTE_PRESETS, VARIETIES, PELLET_LIFE, BITE_LIFE, PELLET_SINK, World, rippleLife, FLAG_BODY, FLAG_FIN, FLAG_EYE, FLAG_DORSAL, FLAG_BARBEL, bodyHalfWidth, classify, koiMarkings, paletteTones, KoiRenderer };
}
const { TAU, KOI_NODES, RIPPLE_SPEED, clamp, smoothstep, angleDiff, hash3, ACCENTS, ACCENT_PRESETS, PALETTE_PRESETS, VARIETIES, PELLET_LIFE, BITE_LIFE, PELLET_SINK, World, rippleLife, FLAG_BODY, FLAG_FIN, FLAG_EYE, FLAG_DORSAL, FLAG_BARBEL, bodyHalfWidth, classify, koiMarkings, paletteTones, KoiRenderer } = pondLibrary();

/* ── engine ─────────────────────────────────────────────────────────────── */
const __m_engine = (() => {
/**
 * engine.js — the pond's lifecycle, ported from the original site's `koi-pond.tsx`.
 *
 * The React component on the site does four things this module also does, in
 * plain DOM: own the rAF loop with a fixed-step accumulator, keep the canvas
 * sized to its box, measure the content the koi must swim around, and translate
 * pointer/click input into curiosity, food and fright. What it adds is what a
 * shell needs and a landing page does not: it survives being mounted into a live
 * application, it pauses when the window is hidden or the canvas is covered, and
 * it tears every listener down on dispose.
 *
 * One thing it deliberately does *not* do is steer the koi around the shell's
 * panels. On the site the prose block is the only thing over the water, so the
 * fish avoid it and fade beneath it. In a shell every panel is a frosted sheet:
 * the whole point of the theme is that a koi swims *under* the sidebar and the
 * composer and reads through the blur. Steering them away would leave every
 * glass panel empty, which is exactly the failure this module used to have.
 */



const STEP = 1 / 60;
const MAX_STEPS = 4;
// Content over the pond carries this attribute; koi steer around it and fade beneath it.
const AVOID_TARGETS = '[data-cngtn-avoid]';
// Koi swim out from under this for as long as it is marked, and nothing fades.
const STEER_TARGETS = '[data-koi-steer]';
// Re-measure the content boxes this often to follow layout shifts. In time, not
// frames, so a 240 Hz display does not pay four times what a 60 Hz one does.
const MEASURE_MS = 250;
// The world steps at 60 Hz, so painting faster shows nothing new, and every paint
// makes the glass above re-blur. While the page scrolls the pond yields further.
const RENDER_MS = 1000 / 60;
const SCROLL_RENDER_MS = 1000 / 24;
const SCROLL_SETTLE_MS = 200;
// Content boxes closer than this merge, so koi aren't squeezed into the slot between them.
const MERGE_GAP_PX = 72;
const INTERACTIVE =
  "a, button, input, textarea, select, label, [role='button'], [role='menuitem'], [contenteditable='true'], [data-cngtn-ignore]";

/**
 * Surfaces that genuinely hide the water. Only the status strip is opaque in
 * this theme; the sidebar, the right panel and the composer are frosted glass,
 * so a koi under one is *meant* to be seen. Steering away from them would make
 * the glass pointless.
 *
 * Every entry is a `data-*` hook the shell publishes itself — never a hashed
 * CSS-module class — so a DSH update cannot silently turn this list into a
 * no-op.
 */
const OPAQUE_SELECTORS = ['[data-shell-bottom]'];

/**
 * Bare text on the open water of the start page: the fish fade hard beneath it
 * and stay at full strength everywhere else.
 */
const TEXT_SELECTORS = [
  ':has(> * > [data-slot="conversation.hero.brand.mark"])',
  ':has(> [data-slot="conversation.hero.workspace"])',
];
/** Glass panels: the blur alone cannot hold small grey text over a dark koi. */
const PANEL_SELECTORS = ['[data-slot="sidebar"]', '[data-sidebar-right-open]'];
/** How much of a fish survives under bare text. */
const TEXT_FLOOR = 0.14;
/** Text on the conversation card: the glass carries legibility, so the fade is gentle. */
const CARD_SELECTORS = ['[data-chat-turn]', 'header:has([data-conversation-tabs])', '[data-composer-card] + *'];
const CARD_FLOOR = 0.55;

function mergeNearby(boxes) {
  const merged = [];
  for (const b of [...boxes].sort((p, q) => p.top - q.top)) {
    const near = merged.find(
      (m) => b.top - m.bottom < MERGE_GAP_PX && b.left - m.right < MERGE_GAP_PX && m.left - b.right < MERGE_GAP_PX
    );
    if (!near) {
      merged.push({ ...b });
      continue;
    }
    near.left = Math.min(near.left, b.left);
    near.right = Math.max(near.right, b.right);
    near.bottom = Math.max(near.bottom, b.bottom);
  }
  return merged;
}

/**
 * The DOM side of a pond: what it watches, and how it reads the page. A subclass supplies
 * the drawing side, here or off the main thread, through schedule, resize, feed,
 * pointerMoved, pointerLeft and scrolled.
 */
class PondSurface {
  constructor(canvas) {
    this.canvas = canvas;
    this.box = null;
    this.visible = true;
    this.disposed = false;
    this.hidden = document.hidden;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // A forced-colors palette has no place for a pond either: it would only sit behind the text.
    this.reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce), (forced-colors: active)');
  }

  /** Subclass fields do not exist during super(), so each subclass calls this last. */
  attach() {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.schedule();
    });
    this.resizeObserver.observe(this.canvas);
    this.intersectionObserver.observe(this.canvas);
    this.reducedMotion.addEventListener('change', this.onPreferenceChange);
    this.reducedTransparency.addEventListener('change', this.onPreferenceChange);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('click', this.onClick);
    window.addEventListener('dsh-glass:splash', this.onSplash);
    window.addEventListener('dsh-glass:writing', this.onWriting);
    document.addEventListener('scroll', this.onAnyScroll, { capture: true, passive: true });
    document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
    window.addEventListener('blur', this.onPointerLeave);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.resize();
    this.schedule();
  }

  destroy() {
    this.disposed = true;
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.reducedMotion.removeEventListener('change', this.onPreferenceChange);
    this.reducedTransparency.removeEventListener('change', this.onPreferenceChange);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onClick);
    window.removeEventListener('dsh-glass:splash', this.onSplash);
    window.removeEventListener('dsh-glass:writing', this.onWriting);
    document.removeEventListener('scroll', this.onAnyScroll, { capture: true });
    document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
    window.removeEventListener('blur', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  /** True when the shell is painting its light palette. */
  readIsLight() {
    return !document.body.hasAttribute('data-ds-dark-theme');
  }

  /**
   * The canvas is fixed to the window, so its box changes only on a resize. Keeping it means
   * a pointer event never has to read layout.
   */
  measureCanvas() {
    this.box = this.canvas.getBoundingClientRect();
    return this.box;
  }

  /** Canvas-space rects for one selector list, skipping anything unrendered. */
  rectsFor(selectors) {
    const origin = this.canvas.getBoundingClientRect();
    const nodes = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
    return nodes
      .map((el) => el.getBoundingClientRect())
      .filter((b) => b.width > 0 && b.height > 0)
      .map((b) => ({
        left: b.left - origin.left,
        top: b.top - origin.top,
        right: b.right - origin.left,
        bottom: b.bottom - origin.top,
      }));
  }

  contentBoxes() {
    // `data-koi-avoid` is the site's own contract: steer around it *and* fade
    // beneath it. The shell's opaque panels only steer; the text blocks only
    // fade. Keeping the two lists apart matters, because merging an opaque
    // full-height sidebar with the composer would otherwise produce one huge box
    // that washes out half the pond.
    const own = mergeNearby(this.rectsFor([AVOID_TARGETS]));
    const opaque = mergeNearby(this.rectsFor(OPAQUE_SELECTORS));
    const text = mergeNearby(this.rectsFor(TEXT_SELECTORS));
    const card = mergeNearby(this.rectsFor(CARD_SELECTORS));
    // Not merged: a merged box would span the gutters between the panels, which is
    // the one place the fish should stay crisp.
    const panels = this.rectsFor(PANEL_SELECTORS);
    return {
      // Steering is limited to the panels that genuinely hide water. The faded
      // boxes only dim what is drawn beneath them; adding them to `avoid` would
      // let the composer's full-width seat merge with the sidebar into one wall
      // and push every fish out of the centre column.
      avoid: [...own, ...opaque, ...this.rectsFor([STEER_TARGETS])],
      groups: [
        // The site's own contract: faint, so a koi reads as being under the words.
        { boxes: own, floor: 0.15 },
        // Words win over water; the feathered edge keeps the fade from reading as a box.
        { boxes: text, floor: TEXT_FLOOR },
        { boxes: card, floor: CARD_FLOOR },
        { boxes: panels, floor: CARD_FLOOR },
      ],
    };
  }

  toLocal(e) {
    const rect = this.box ?? this.measureCanvas();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
  }

  onPreferenceChange = () => {
    this.schedule();
  };

  onVisibilityChange = () => {
    this.hidden = document.hidden;
    this.schedule();
  };

  onAnyScroll = () => {
    this.scrolled();
  };

  onPointerMove = (e) => {
    this.pointerMoved(this.toLocal(e), e);
  };

  // glass-theme sends this when the composer leaves the start page; alone, this bundle never hears it.
  onSplash = (e) => {
    const box = this.boxFrom(e);
    if (box) this.splash(box);
  };

  onWriting = (e) => {
    const box = this.boxFrom(e);
    if (box) this.writing(box);
  };

  boxFrom(e) {
    if (this.reducedMotion.matches || this.reducedTransparency.matches) return null;
    const { left, top, width, height } = e.detail ?? {};
    if (!(width > 0 && height > 0)) return null;
    const { x, y } = this.toLocal({ clientX: left, clientY: top });
    return { x, y, width, height };
  }

  onPointerLeave = () => {
    this.pointerLeft();
  };

  // Clicks on empty space drop food; links, buttons, and text selection are left
  // alone.
  onClick = (e) => {
    if (this.reducedMotion.matches || this.reducedTransparency.matches) return;
    // The path recorded at dispatch, not target.closest(): a control that
    // re-renders as it is clicked can leave the target detached, with no
    // ancestors left to find the button through.
    if (e.composedPath().some((n) => n instanceof Element && n.matches(INTERACTIVE))) return;
    if (window.getSelection()?.toString()) return;
    const { x, y, inside } = this.toLocal(e);
    if (inside) this.feed(x, y);
  };
}

class PondEngine extends PondSurface {
  constructor(canvas, options = {}) {
    super(canvas);
    this.world = new World({
      budget: options.budget ?? 0.7,
      fish: options.fish,
      young: options.young,
      palette: options.palette,
    });
    this.renderer = new KoiRenderer(canvas, { maxCells: options.maxCells ?? 26000 });
    this.raf = 0;
    this.last = 0;
    this.acc = 0;
    this.frames = 0;
    this.lastPointerTime = 0;
    this.isLight = undefined;
    this.onStats = options.onStats ?? null;
    this.reported = { koi: -1, pellets: -1 };
    this.setTheme(this.readIsLight());
    this.attach();
  }

  /**
   * Change the school without remounting: population, palette, young koi.
   * The world re-seeds, which is what makes "how many fish" mean what it says.
   */
  setOptions(next = {}) {
    const applied = this.world.setOptions(next);
    // A re-seed gives the fish new identities, so the cached markings and ramps
    // are dead weight; clearing keeps a long session's memory flat.
    if (this.renderer.markingCache) this.renderer.markingCache.clear();
    this.measureContent();
    return applied;
  }

  /** Current pond settings, for a settings control to render. */
  getOptions() {
    return this.world.getOptions();
  }

  destroy() {
    super.destroy();
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  setTheme(isLight) {
    if (this.isLight === isLight) return;
    this.isLight = isLight;
    this.renderer.setTheme(isLight);
    if (this.reducedMotion.matches) this.drawStill();
  }

  resize() {
    try {
      this.resizeNow();
    } catch (error) {
      console.error('[koi-pond] resize failed:', error && (error.stack || error.message));
    }
  }

  resizeNow() {
    const rect = this.measureCanvas();
    if (rect.width < 1 || rect.height < 1) return;
    this.renderer.resize(rect.width, rect.height, Math.min(window.devicePixelRatio || 1, 2));
    this.world.resize(rect.width, rect.height);
    this.measureContent();
    this.report();
    if (this.reducedMotion.matches) this.drawStill();
  }

  // Only call back when a count changes, so the host doesn't re-render every frame.
  report() {
    if (!this.onStats) return;
    const koi = this.world.koi.length;
    const pellets = this.world.pellets.length;
    if (koi === this.reported.koi && pellets === this.reported.pellets) return;
    this.reported = { koi, pellets };
    this.onStats(this.reported);
  }

  schedule = () => {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.disposed || !this.visible || this.hidden) return;
    // A user who asked the OS for less transparency gets the paper, not a pond.
    if (this.reducedTransparency.matches) {
      this.renderer.clear();
      return;
    }
    if (this.reducedMotion.matches) {
      this.drawStill();
      return;
    }
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  };

  measureContent() {
    const { avoid, groups } = this.contentBoxes();
    this.world.avoid = avoid;
    this.renderer.setDimBoxes(groups);
  }

  frame = (now) => {
    if (this.disposed) return;
    // A frame that throws must not end the pond.
    //
    // This used to be an unguarded body: one bad value anywhere in the
    // rasteriser threw before `requestAnimationFrame` was re-armed, the loop
    // stopped for good, and the only cure was toggling the plugin off and on.
    // The pond now survives a bad frame, reports it once, and keeps drawing —
    // the next frame usually succeeds, and a persistent fault is visible in the
    // console instead of looking like "the theme disappeared".
    try {
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      this.acc += dt;
      let steps = 0;
      while (this.acc >= STEP && steps < MAX_STEPS) {
        this.world.step(STEP);
        this.acc -= STEP;
        steps++;
      }
      if (steps === MAX_STEPS) this.acc = 0;
      if (now - (this.lastMeasure ?? 0) >= MEASURE_MS) {
        this.lastMeasure = now;
        this.measureContent();
      }
      this.pendingDt = (this.pendingDt ?? 0) + dt;
      const budget = now < (this.scrollingUntil ?? 0) ? SCROLL_RENDER_MS : RENDER_MS;
      if (now - (this.lastRender ?? 0) >= budget - 1) {
        this.lastRender = now;
        this.renderer.render(this.world, this.pendingDt);
        this.pendingDt = 0;
        this.report();
      }
      this.frameFaults = 0;
    } catch (error) {
      this.frameFaults = (this.frameFaults ?? 0) + 1;
      // Report the first fault with a stack, then stay quiet: a per-frame
      // console.error would flood the log at 60 Hz.
      if (this.frameFaults === 1) {
        console.error('[koi-pond] frame failed:', error && (error.stack || error.message));
      }
      if (this.frameFaults > 240) {
        // Four seconds of continuous failure: stop rather than spin.
        console.error('[koi-pond] pond stopped after repeated frame failures');
        return;
      }
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  // Reduced motion: let the koi spread out, then hold a single frame.
  drawStill() {
    if (this.world.time < 4) {
      for (let i = 0; i < 240; i++) this.world.step(STEP);
    }
    try {
      this.measureContent();
      this.renderer.render(this.world, STEP);
      this.report();
    } catch (error) {
      console.error('[koi-pond] still frame failed:', error && (error.stack || error.message));
    }
  }

  scrolled() {
    this.scrollingUntil = performance.now() + SCROLL_SETTLE_MS;
  }

  pointerMoved({ x, y, inside }, e) {
    const p = this.world.pointer;
    const elapsed = Math.max(1, e.timeStamp - this.lastPointerTime) / 1000;
    const speed = Math.hypot(x - p.x, y - p.y) / elapsed;
    p.speed += (Math.min(speed, 5000) - p.speed) * 0.5;
    this.lastPointerTime = e.timeStamp;
    p.x = x;
    p.y = y;
    p.active = inside && e.pointerType !== 'touch';
  }

  pointerLeft() {
    this.world.pointer.active = false;
    this.world.pointer.speed = 0;
  }

  feed(x, y) {
    this.world.feed(x, y);
    this.report();
  }

  splash(box) {
    this.world.splash(box);
  }

  writing(box) {
    this.world.writing(box);
  }

  /** Exposed for the smoke test: step the simulation without a browser clock. */
  static step(world, seconds) {
    const steps = Math.round(seconds / STEP);
    for (let i = 0; i < steps; i++) world.step(STEP);
    return clamp(steps, 0, Infinity);
  }
}
return { PondEngine, PondSurface, MEASURE_MS, SCROLL_SETTLE_MS };
})();
const { PondEngine } = __m_engine;

/* ── worker ─────────────────────────────────────────────────────────────── */
/**
 * The pond drawn off the main thread.
 *
 * Rasterising the school costs about 5 ms a frame. On a 240 Hz display a frame
 * is 4.2 ms, so on the main thread every paint pushed scrolling and typing past
 * its deadline. Here the world and the renderer live in a dedicated worker that
 * draws into an OffscreenCanvas; the main thread only measures the content boxes
 * every 250 ms and forwards input, which is what needs the DOM.
 *
 * `workerMain` runs inside the worker, so it must not touch anything outside
 * its own body: it receives the library and talks only through messages.
 */
function workerMain(lib) {
  const { World, KoiRenderer } = lib;
  const STEP = 1 / 60;
  const MAX_STEPS = 4;
  const RENDER_MS = 1000 / 60;
  const SCROLL_RENDER_MS = 1000 / 24;
  const tick = typeof self.requestAnimationFrame === 'function'
    ? (fn) => self.requestAnimationFrame(fn)
    : (fn) => setTimeout(() => fn(performance.now()), 16);
  let world = null;
  let renderer = null;
  let mode = 'off';
  let scheduled = false;
  let last = 0;
  let acc = 0;
  let pending = 0;
  let lastRender = 0;
  let scrollingUntil = 0;
  let lastPointer = 0;
  let reported = '';
  let faults = 0;

  const report = (force) => {
    if (!world) return;
    const koi = world.koi.map((k) => ({ id: k.id, variety: k.variety, accent: k.accent }));
    const message = { type: 'stats', koi, options: world.getOptions() };
    const key = JSON.stringify(message);
    if (!force && key === reported) return;
    reported = key;
    self.postMessage(message);
  };
  const still = () => {
    if (world.time < 4) for (let i = 0; i < 240; i++) world.step(STEP);
    renderer.render(world, STEP);
    report(false);
  };
  const frame = (now) => {
    scheduled = false;
    if (mode !== 'run' || !world) return;
    try {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += dt;
      let steps = 0;
      while (acc >= STEP && steps < MAX_STEPS) { world.step(STEP); acc -= STEP; steps++; }
      if (steps === MAX_STEPS) acc = 0;
      pending += dt;
      const budget = now < scrollingUntil ? SCROLL_RENDER_MS : RENDER_MS;
      if (now - lastRender >= budget - 1) {
        lastRender = now;
        renderer.render(world, pending);
        pending = 0;
      }
      faults = 0;
    } catch (error) {
      faults += 1;
      if (faults === 1) self.postMessage({ type: 'error', message: String(error && (error.stack || error.message)) });
      if (faults > 240) return;
    }
    scheduled = true;
    tick(frame);
  };
  const start = () => {
    if (scheduled) return;
    scheduled = true;
    last = performance.now();
    tick(frame);
  };
  setInterval(() => report(false), 500);

  self.onmessage = (event) => {
    const m = event.data;
    try {
      switch (m.type) {
        case 'init':
          world = new World(m.options);
          renderer = new KoiRenderer(m.canvas, { maxCells: m.maxCells, isLight: m.isLight });
          renderer.setTheme(m.isLight);
          self.postMessage({ type: 'ready' });
          report(true);
          break;
        case 'resize':
          renderer.resize(m.width, m.height, m.dpr);
          world.resize(m.width, m.height);
          if (mode === 'still') still();
          report(false);
          break;
        case 'boxes':
          world.avoid = m.avoid;
          renderer.setDimBoxes(m.groups);
          if (mode === 'still') still();
          break;
        case 'theme':
          renderer.setTheme(m.isLight);
          if (mode === 'still') still();
          break;
        case 'mode':
          mode = m.mode;
          if (mode === 'run') start();
          else if (mode === 'still') still();
          else if (mode === 'clear') renderer.clear();
          break;
        case 'pointer': {
          const p = world.pointer;
          const elapsed = Math.max(1, m.t - lastPointer) / 1000;
          const speed = Math.hypot(m.x - p.x, m.y - p.y) / elapsed;
          p.speed += (Math.min(speed, 5000) - p.speed) * 0.5;
          lastPointer = m.t;
          p.x = m.x;
          p.y = m.y;
          p.active = m.active;
          break;
        }
        case 'leave':
          world.pointer.active = false;
          world.pointer.speed = 0;
          break;
        case 'feed':
          world.feed(m.x, m.y);
          report(false);
          break;
        case 'splash':
          world.splash(m.box);
          break;
        case 'writing':
          world.writing(m.box);
          break;
        case 'scroll':
          scrollingUntil = performance.now() + m.settle;
          break;
        case 'options':
          world.setOptions(m.next);
          if (renderer.markingCache) renderer.markingCache.clear();
          if (mode === 'still') still();
          report(true);
          break;
      }
    } catch (error) {
      self.postMessage({ type: m.type === 'init' ? 'fatal' : 'error', message: String(error && (error.stack || error.message)) });
    }
  };
}

const { PondSurface, MEASURE_MS, SCROLL_SETTLE_MS } = __m_engine;

/**
 * The main-thread half: the page side of PondSurface, with drawing in the worker. Options
 * are answered here at once; the fish list arrives from the worker a message later.
 */
class WorkerPond extends PondSurface {
  constructor(canvas, options = {}) {
    const source = `(${workerMain.toString()})((${pondLibrary.toString()})());`;
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    let worker;
    try {
      worker = new Worker(url, { name: 'koi-pond' });
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
    super(canvas);
    // Nothing past this point may throw before the transfer: a transferred canvas
    // cannot be handed back to the main-thread engine. A worker that fails after it is
    // asks for a replacement canvas through onFail instead.
    this.url = url;
    this.worker = worker;
    this.world = { koi: [] };
    this.options = { fish: options.fish, young: options.young, palette: options.palette };
    this.onFail = options.onFail ?? null;
    this.ready = false;
    this.mode = '';
    this.measureTimer = 0;
    this.pointerTimer = 0;
    this.pendingPointer = null;
    this.lastScrollPost = 0;
    this.faulted = false;
    this.worker.onmessage = (event) => {
      const m = event.data;
      if (m.type === 'stats') {
        this.world.koi = m.koi;
        this.options = m.options;
      } else if (m.type === 'ready') {
        this.ready = true;
      } else if (m.type === 'fatal') {
        this.fail(m.message);
      } else if (m.type === 'error' && !this.faulted) {
        this.faulted = true;
        console.error('[koi-pond] worker frame failed:', m.message);
      }
    };
    this.worker.onerror = (event) => this.fail(event.message);

    const offscreen = canvas.transferControlToOffscreen();
    this.worker.postMessage({
      type: 'init',
      canvas: offscreen,
      options: { budget: options.budget ?? 0.7, fish: options.fish, young: options.young, palette: options.palette },
      maxCells: options.maxCells ?? 26000,
      isLight: this.readIsLight(),
    }, [offscreen]);
    this.attach();
  }

  fail(message) {
    console.error('[koi-pond] worker failed:', message);
    if (!this.ready && !this.disposed) this.onFail?.();
  }

  setTheme(isLight) {
    this.worker.postMessage({ type: 'theme', isLight });
  }

  setOptions(next = {}) {
    this.options = { ...this.options, ...next };
    this.worker.postMessage({ type: 'options', next });
    return this.options;
  }

  getOptions() {
    return this.options;
  }

  resize() {
    const rect = this.measureCanvas();
    if (rect.width < 1 || rect.height < 1) return;
    this.worker.postMessage({ type: 'resize', width: rect.width, height: rect.height, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    this.measure();
  }

  schedule = () => {
    const mode = this.disposed || !this.visible || this.hidden
      ? 'off'
      : this.reducedTransparency.matches ? 'clear' : this.reducedMotion.matches ? 'still' : 'run';
    if (mode === this.mode) return;
    this.mode = mode;
    this.worker.postMessage({ type: 'mode', mode });
    clearInterval(this.measureTimer);
    this.measureTimer = mode === 'run' ? setInterval(() => this.measure(), MEASURE_MS) : 0;
    if (mode === 'run' || mode === 'still') this.measure();
  };

  measure() {
    if (this.disposed) return;
    this.worker.postMessage({ type: 'boxes', ...this.contentBoxes() });
  }

  // A 1000 Hz mouse would post a thousand messages a second; one per 8 ms is plenty.
  pointerMoved({ x, y, inside }, e) {
    this.pendingPointer = { type: 'pointer', x, y, t: e.timeStamp, active: inside && e.pointerType !== 'touch' };
    if (this.pointerTimer) return;
    this.pointerTimer = setTimeout(() => {
      this.pointerTimer = 0;
      if (this.pendingPointer && !this.disposed) this.worker.postMessage(this.pendingPointer);
      this.pendingPointer = null;
    }, 8);
  }

  feed(x, y) {
    this.worker.postMessage({ type: 'feed', x, y });
  }

  splash(box) {
    this.worker.postMessage({ type: 'splash', box });
  }

  writing(box) {
    this.worker.postMessage({ type: 'writing', box });
  }

  scrolled() {
    const now = performance.now();
    if (now - this.lastScrollPost < 50) return;
    this.lastScrollPost = now;
    this.worker.postMessage({ type: 'scroll', settle: SCROLL_SETTLE_MS });
  }

  pointerLeft() {
    this.worker.postMessage({ type: 'leave' });
  }

  destroy() {
    super.destroy();
    clearInterval(this.measureTimer);
    clearTimeout(this.pointerTimer);
    this.worker.terminate();
    URL.revokeObjectURL(this.url);
  }
}

/** Off the main thread when the browser allows it, otherwise the original engine. */
function createPondEngine(canvas, options) {
  if (typeof Worker === 'function' && typeof OffscreenCanvas === 'function' && typeof canvas.transferControlToOffscreen === 'function') {
    try {
      return new WorkerPond(canvas, options);
    } catch (error) {
      console.warn('[koi-pond] worker unavailable, drawing on the main thread:', error && error.message);
    }
  }
  return new PondEngine(canvas, options);
}

/* ── styles ─────────────────────────────────────────────────────────────── */
/**
 * Only what the canvas itself needs. The transparent shell, glass panels and
 * palette belong to the active theme; this bundle must stay removable.
 *
 * The body is an isolated stacking context, so the canvas sits at z-index 0 and
 * the theme lifts the shell frame to z-index 1. The top mask fades the water out
 * under the window caption so glyphs never collide with the menu labels.
 */
function buildStyles() {
  return `
#cngtn-pond-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  display: block;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, transparent 34px, #000 76px);
  mask-image: linear-gradient(to bottom, transparent 0, transparent 34px, #000 76px);
}
@media (prefers-reduced-transparency: reduce), (forced-colors: active), print {
  #cngtn-pond-canvas { display: none; }
}
`;
}

/* ── apply ──────────────────────────────────────────────────────────────── */
/**
 * apply.js — the Client plugin body.
 *
 * Three effects, in the order the site layers itself: the pond first (so its
 * canvas exists before anything is measured), then the token layer, then the
 * stylesheet.
 *
 * `ctx.effect` runs its callback synchronously and takes the returned disposer,
 * so a failure inside one of them is caught here and reported with a real stack
 * instead of taking the whole web boot down as "entry failed". The theme is
 * allowed to be the only thing that works: if the canvas cannot be created, the
 * paper palette still applies.
 */

/** Layer identity for the token override; also the plugin's display id. */
const ID = '@tal-shin/dsh-koi-pond';

/** Required Client services: the theme registry owns the token layer. */
const inject = ['theme'];

/**
 * Pond settings.
 *
 * Three sources, in increasing priority:
 *
 *  1. the defaults below;
 *  2. the bundle's own \`config\` in \`cordis.patch.yml\`, so a profile can ship a
 *     house style;
 *  3. what the user picked in the Pond panel, kept in \`localStorage\` so it
 *     survives a restart without any host write.
 *
 * The values are validated here rather than trusted: a config file is just
 * text, and an out-of-range count would either empty the pond or flood it.
 */
const STORAGE_KEY = 'cngtn-pond:settings';
const DEFAULTS = { fish: null, young: true, palette: 'mixed' };

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw === null ? {} : JSON.parse(raw);
    return parsed !== null && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeSettings(raw) {
  const source = raw !== null && typeof raw === 'object' ? raw : {};
  const fish = Number.isFinite(source.fish) ? Math.min(12, Math.max(3, Math.round(source.fish))) : null;
  const palette = PALETTE_PRESETS.includes(source.palette) ? source.palette : DEFAULTS.palette;
  const young = typeof source.young === 'boolean' ? source.young : DEFAULTS.young;
  return { fish, young, palette };
}

function persistSettings(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // A blocked storage API must not stop the pond from changing.
  }
}

/** The live engine, so the panel and the console API can retune it in place. */
let activeEngine = null;

/**
 * The Host-backed config scope for this bundle, when one is reachable. It is the
 * source of truth: the plugin page's form writes here, and the pond follows it.
 * `localStorage` remains a cache and the fallback when no Host scope exists.
 */
let hostScope = null;

/** The settings the engine is currently drawing, so folds can skip no-ops. */
let appliedSettings = null;

/** What the settings wiring managed to reach; surfaced by `koiPond.diag()`. */
const diag = {
  slots: false,
  configForms: false,
  primitives: false,
  formModel: false,
  bundleConfigRegistered: false,
  injectCalled: false,
  hostScope: false,
  injectCallbackRan: false,
  settingsButtonRegistered: false,
  notes: [],
};

/**
 * Apply a settings patch.
 *
 * Two rules, and both were learned the hard way:
 *
 * 1. **The engine follows the user immediately.** A slider drag must not wait
 *    for a Host round-trip, and the panel must never show a value the pond is
 *    not drawing.
 * 2. **The Host write is debounced and latest-wins.** Firing one write per
 *    keystroke queued revisions that collided, and the fold from a superseded
 *    write could land last — a rapid palette cycle used to end on whichever
 *    value happened to win the race.
 *
 * The fold still applies an incoming value, but only when it differs from what
 * the engine already draws, so a debounced write echoing back is a no-op instead
 * of a re-seed.
 */
let hostWriteTimer = 0;

function scheduleHostWrite() {
  if (hostScope === null) return;
  if (hostWriteTimer !== 0) clearTimeout(hostWriteTimer);
  hostWriteTimer = setTimeout(() => {
    hostWriteTimer = 0;
    if (hostScope === null) return;
    const latest = normalizeSettings(readStored());
    try {
      const snapshot = hostScope.getSnapshot();
      if (!snapshot || !snapshot.writable) return;
      // Only the fields that actually differ, so an unchanged document is not
      // rewritten on every interaction.
      for (const field of ['fish', 'young', 'palette']) {
        const current = snapshot.value ? snapshot.value[field] : undefined;
        if (current !== latest[field]) hostScope.set(field, latest[field]);
      }
    } catch (error) {
      console.warn('[koi-pond] host write failed:', error && error.message);
    }
  }, 250);
}

function applySettings(patch) {
  const next = normalizeSettings({ ...readStored(), ...patch });
  persistSettings(next);
  applyToEngine(next);
  scheduleHostWrite();
  refreshPanel();
  return next;
}

/** Push a normalized settings object into the live engine. */
function applyToEngine(next) {
  // `setOptions` re-seeds the school, so an identical value must not be applied
  // twice: a fold that echoes what we just wrote would otherwise restart the
  // pond on every keystroke.
  if (
    appliedSettings !== null &&
    appliedSettings.fish === next.fish &&
    appliedSettings.young === next.young &&
    appliedSettings.palette === next.palette
  ) {
    return;
  }
  appliedSettings = { fish: next.fish, young: next.young, palette: next.palette };
  if (activeEngine === null) return;
  try {
    activeEngine.setOptions(next);
  } catch (error) {
    console.error('[koi-pond] settings failed:', error && error.message);
  }
}

/**
 * Follow the Host config scope.
 *
 * The plugin page's form saves through the Host, which is what the config
 * document is for; without this subscription the save would be recorded and the
 * pond would keep drawing the old school until a restart. Every ready snapshot
 * is folded into the cache and applied, so the form, the panel and the console
 * API all describe the same pond.
 */
function connectHostSettings(ctx) {
  let configForms;
  try {
    configForms = typeof ctx.get === 'function' ? ctx.get('configForms') : undefined;
  } catch {
    return;
  }
  if (!configForms || typeof configForms.get !== 'function') return;

  try {
    const scope = configForms.get('koi-pond');
    hostScope = scope;
    diag.hostScope = true;

    const fold = () => {
      try {
        const snapshot = scope.getSnapshot();
        if (!snapshot || snapshot.status !== 'ready' || !snapshot.value) return;
        const next = normalizeSettings({ ...readStored(), ...snapshot.value });
        persistSettings(next);
        applyToEngine(next);
        refreshPanel();
      } catch (error) {
        diag.notes.push('fold: ' + (error && error.message));
      }
    };

    ctx.effect(() => scope.subscribe(fold), 'koi-pond: host config');
    fold();
  } catch (error) {
    diag.notes.push('host scope: ' + (error && error.message));
    console.warn('[koi-pond] host config unavailable:', error && error.message);
  }
}

/**
 * Mount the pond behind the shell.
 *
 * The canvas is the body's first child and carries `z-index: -1`. That places it
 * above the body's own background (which is the paper) and below every in-flow
 * descendant, so the shell's panels paint over the water and only the regions
 * the stylesheet made transparent let it show. Appending it last would put it on
 * top of the sidebar instead — a positioned element at `z-index: 0` beats static
 * content.
 */
function mountPond(settings) {
  try {
    if (typeof document === 'undefined' || document.body === null) return () => {};

    // One canvas per document, even across a hot reload of this plugin.
    const stale = document.querySelector('#cngtn-pond-canvas');
    if (stale !== null) stale.remove();

    const makeCanvas = () => {
      const element = document.createElement('canvas');
      element.id = 'cngtn-pond-canvas';
      element.setAttribute('aria-hidden', 'true');
      // The canvas never takes input, so a click anywhere still reaches the
      // control under it.
      element.style.pointerEvents = 'none';
      document.body.insertBefore(element, document.body.firstChild);
      return element;
    };
    let canvas = makeCanvas();
    let engine = null;
    const options = {
      // The shell has less open water than a full-screen page: fewer fish, and
      // a cap on the grid so a very large window stays cheap.
      budget: 0.7,
      maxCells: 26000,
      fish: settings.fish,
      young: settings.young,
      palette: settings.palette,
    };
    // A worker can fail after it has taken the canvas, which cannot be handed back, so the
    // main-thread engine starts on a new one with whatever the school is now.
    const fallBack = () => {
      const current = engine.getOptions();
      engine.destroy();
      canvas.remove();
      canvas = makeCanvas();
      try {
        engine = new PondEngine(canvas, { ...options, ...current });
        activeEngine = engine;
        diag.engine = 'main';
      } catch (error) {
        canvas.remove();
        activeEngine = null;
        console.error('[koi-pond] engine unavailable:', error && error.message);
      }
    };
    try {
      engine = createPondEngine(canvas, { ...options, onFail: fallBack });
      activeEngine = engine;
      diag.engine = engine instanceof WorkerPond ? 'worker' : 'main';
    } catch (error) {
      canvas.remove();
      console.error('[koi-pond] engine unavailable:', error && error.message);
      return () => {};
    }

    // The shell swaps the palette by toggling an attribute on the body, not by
    // remounting anything, so the pond follows it with an observer.
    const paletteObserver = new MutationObserver(() => engine.setTheme(engine.readIsLight()));
    paletteObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });

    return () => {
      paletteObserver.disconnect();
      engine.destroy();
      canvas.remove();
      if (activeEngine === engine) activeEngine = null;
    };
  } catch (error) {
    console.error('[koi-pond] mount failed:', error && (error.stack || error.message));
    return () => {};
  }
}

/** Insert the stylesheet once; the returned disposer removes it. */
function injectStyles() {
  try {
    if (typeof document === 'undefined' || document.head === null) return () => {};
    const tagId = ID + '/styles';
    const existing = document.querySelector('style[data-plugin-css="' + tagId + '"]');
    if (existing !== null) return () => existing.remove();
    const tag = document.createElement('style');
    tag.dataset.plugin = ID;
    tag.dataset.pluginCss = tagId;
    tag.textContent = buildStyles();
    document.head.appendChild(tag);
    return () => tag.remove();
  } catch (error) {
    console.error('[koi-pond] styles failed:', error && (error.stack || error.message));
    return () => {};
  }
}

/**
 * The Pond panel: three controls, no host form API.
 *
 * DSH's bundle-config slot hands a plugin a host-owned form whose shape is not
 * part of the published contract, so this panel is plain DOM instead: it renders
 * with the theme's own tokens, works whether or not the slot exists, and cannot
 * break the settings page if it fails.
 */
let panel = null;

function panelStyles() {
  return {
    position: 'fixed',
    top: '96px',
    right: '24px',
    width: '268px',
    zIndex: '60',
    padding: '14px 16px 12px',
    borderRadius: 'var(--dsw-radius-md, 12px)',
    border: '0.5px solid var(--dsw-alias-border-l2)',
    backgroundColor: 'color-mix(in srgb, var(--dsw-alias-bg-overlay, #ffffff) 86%, transparent)',
    backdropFilter: 'blur(20px) saturate(150%)',
    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    boxShadow: 'var(--dsw-shadow-lv3)',
    color: 'var(--dsw-alias-label-primary)',
    font: 'var(--dsw-font-xs-13, 13px/20px var(--dsw-font-family))',
  };
}

function row() {
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:10px';
  return el;
}

function label(text) {
  const el = document.createElement('span');
  el.textContent = text;
  el.style.cssText = 'flex:0 0 58px;color:var(--dsw-alias-label-secondary)';
  return el;
}

/** The count the pond is actually drawing, so the slider never lies. */
function liveFishCount(fallback) {
  if (activeEngine !== null) {
    try {
      return activeEngine.world.koi.length;
    } catch {
      // fall through to the stored value
    }
  }
  return fallback;
}

function openPanel() {
  if (panel !== null && panel.isConnected) {
    panel.remove();
    panel = null;
    return;
  }
  if (typeof document === 'undefined' || document.body === null) return;

  const current = normalizeSettings(readStored());
  const card = document.createElement('div');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Pond settings');
  Object.assign(card.style, panelStyles());

  const head = row();
  head.style.marginTop = '0';
  const title = document.createElement('strong');
  title.textContent = 'Pond';
  title.style.cssText = 'flex:1;font-weight:600';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Close');
  close.style.cssText =
    'border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:16px;line-height:1;cursor:pointer;padding:2px 4px';
  close.addEventListener('click', () => openPanel());
  head.append(title, close);

  // Fish count.
  const fishRow = row();
  const fishLabel = label('Fish');
  const fish = document.createElement('input');
  fish.type = 'range';
  fish.min = '3';
  fish.max = '12';
  fish.step = '1';
  fish.value = String(current.fish ?? liveFishCount(5));
  fish.style.cssText = 'flex:1;accent-color:var(--dsw-alias-brand-primary)';
  const fishValue = document.createElement('span');
  fishValue.textContent = fish.value;
  fishValue.style.cssText = 'flex:0 0 18px;text-align:right;font-variant-numeric:tabular-nums';
  fish.addEventListener('input', () => {
    fishValue.textContent = fish.value;
    applySettings({ fish: Number(fish.value) });
  });
  fishRow.append(fishLabel, fish, fishValue);

  // Palette.
  const paletteRow = row();
  const paletteLabel = label('Colour');
  const palette = document.createElement('select');
  palette.style.cssText =
    'flex:1;min-width:0;padding:3px 6px;border-radius:var(--dsw-radius-xs, 6px);border:0.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit';
  for (const [value, text] of [
    ['mixed', 'Mixed'],
    ['warm', 'Warm (red, gold)'],
    ['cool', 'Cool (blue, silver)'],
    ['mono', 'Ink only'],
  ]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    palette.append(option);
  }
  palette.value = current.palette;
  palette.addEventListener('change', () => applySettings({ palette: palette.value }));
  paletteRow.append(paletteLabel, palette);

  // Young koi.
  const youngRow = row();
  const youngLabel = document.createElement('label');
  youngLabel.style.cssText = 'display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary);cursor:pointer';
  const young = document.createElement('input');
  young.type = 'checkbox';
  young.checked = current.young;
  young.style.accentColor = 'var(--dsw-alias-brand-primary)';
  young.addEventListener('change', () => applySettings({ young: young.checked }));
  youngLabel.append(young, document.createTextNode('Two young koi'));
  youngRow.append(youngLabel);

  card.append(head, fishRow, paletteRow, youngRow);
  document.body.append(card);
  panel = card;
}

/** Re-read the stored values into an open panel, after a console-API change. */
function refreshPanel() {
  if (panel === null || !panel.isConnected) return;
  const current = normalizeSettings(readStored());
  const [fish, palette, young] = panel.querySelectorAll('input[type="range"], select, input[type="checkbox"]');
  if (fish) {
    fish.value = String(current.fish ?? liveFishCount(Number(fish.value)));
    const value = fish.nextElementSibling;
    if (value) value.textContent = fish.value;
  }
  if (palette) palette.value = current.palette;
  if (young) young.checked = current.young;
}

/** A console and script handle, so the pond can be retuned without the panel. */
function exposeApi() {
  if (typeof window === 'undefined') return;
  window.koiPond = {
    get: () => (activeEngine !== null ? activeEngine.getOptions() : normalizeSettings(readStored())),
    set: (patch) => applySettings(patch ?? {}),
    open: () => openPanel(),
    reset: () => applySettings(DEFAULTS),
    palettes: PALETTE_PRESETS,
    varieties: VARIETIES,
    /** What the settings wiring reached, for support and for the tests. */
    diag: () => ({ ...diag, notes: [...diag.notes] }),
    /** The live school, for checking what the pond actually drew. */
    list: () =>
      activeEngine === null
        ? []
        : activeEngine.world.koi.map((k) => ({ id: k.id, variety: k.variety, accent: k.accent })),
  };
}

/**
 * The bundle's own settings page.
 *
 * The Plugins page dispatches \`plugins.bundle.config\` with the bundle's package
 * name as the key, and renders whatever is registered there between the bundle's
 * description and its rows. Registering is what makes the pond settings appear
 * on the marketplace/plugins page rather than only in a floating panel.
 *
 * The form is the shell's own \`SettingsFormModel\`, driven by the Host-backed
 * config scope (\`configForms.get('koi-pond')\`), so Save, Discard, the dirty
 * flag and the write path behave like the shipped bundle forms.
 *
 * Services are reached through \`ctx.get\`, not \`ctx.inject\`: a dynamic client
 * package's ctx facade exposes optional lookup by name, while \`inject\` is a
 * framework verb it deliberately withholds. Everything is optional — if either
 * service is missing, the theme keeps working and the floating Pond panel plus
 * the console API remain.
 */
function registerBundleConfig(ctx) {
  let slots;
  let configForms;
  try {
    slots = typeof ctx.get === 'function' ? ctx.get('slots') : undefined;
    configForms = typeof ctx.get === 'function' ? ctx.get('configForms') : undefined;
  } catch (error) {
    console.warn('[koi-pond] settings services unavailable:', error && error.message);
    return;
  }
  diag.slots = !!slots && typeof slots.register === 'function';
  diag.configForms = !!configForms && typeof configForms.get === 'function';
  if (!diag.slots) {
    diag.notes.push('no slots service');
    console.warn('[koi-pond] no slots service; pond settings stay in the floating panel');
    return;
  }
  if (!diag.configForms) {
    diag.notes.push('no configForms service');
    console.warn('[koi-pond] no configForms service; pond settings stay in the floating panel');
    return;
  }

  let React;
  let primitives;
  try {
    React = require('react');
    primitives = require('@deepseek-ai/dsh-client-ui-primitives');
  } catch (error) {
    diag.notes.push('primitives: ' + (error && error.message));
    console.warn('[koi-pond] settings form unavailable:', error && error.message);
    return;
  }
  diag.primitives = true;
  const { SettingsForm, SettingsFormModel, SettingsValueField, settingsNumberField, settingsTextField } = primitives;
  if (!SettingsForm || !SettingsFormModel || !SettingsValueField || !settingsNumberField || !settingsTextField) {
    diag.notes.push('settings primitives incomplete');
    console.warn('[koi-pond] settings primitives missing; using the floating panel only');
    return;
  }

  try {
    const scope = configForms.get('koi-pond');
    const model = new SettingsFormModel(scope, [
      {
        ...settingsNumberField('fish'),
        parse: (text) => {
          const value = Number(text.trim());
          return Number.isInteger(value) && value >= 3 && value <= 12
            ? { kind: 'set', value }
            : undefined;
        },
      },
      {
        ...settingsTextField('palette'),
        parse: (text) => {
          const value = text.trim();
          return PALETTE_PRESETS.includes(value) ? { kind: 'set', value } : undefined;
        },
      },
    ]);

    // The bound snapshot carries the shell flags *and* one entry per field, which
    // is exactly what \`SettingsForm\` and \`SettingsValueField\` read.
    const state = model.bind(() => ({
      ...model.shell(),
      fish: model.field('fish'),
      palette: model.field('palette'),
    }));

    diag.formModel = true;
    ctx.effect(() => () => model.dispose(), 'koi-pond: config form');

    const LABELS = {
      title: 'Pond',
      description: 'How many koi swim behind the shell, and which colours they carry.',
      save: 'Save',
      saving: 'Saving…',
      saveFailed: 'Could not save. Try again.',
      unavailable: 'Settings are unavailable right now.',
      readOnly: 'This profile is read-only.',
      discard: 'Discard',
      reset: 'Reset',
      overridden: 'Overridden',
    };

    function PondConfig(props) {
      const view = props && props.view;
      const snapshot = props.usePondForm((value) => value);

      if (view === 'summary') {
        return React.createElement(
          'span',
          null,
          (snapshot.fish && snapshot.fish.text ? snapshot.fish.text : '—') +
            ' fish · ' +
            (snapshot.palette && snapshot.palette.text ? snapshot.palette.text : 'mixed')
        );
      }

      const disabled = !snapshot.writable || snapshot.saving;

      return React.createElement(
        SettingsForm,
        {
          labels: LABELS,
          state: snapshot,
          onSave: props.save,
          onDiscard: props.discard,
        },
        React.createElement(SettingsValueField, {
          id: 'cngtn-pond-fish',
          label: 'Fish (3–12)',
          text: snapshot.fish ? snapshot.fish.text : '',
          numeric: true,
          invalid: snapshot.fish ? snapshot.fish.invalid : false,
          invalidLabel: 'Enter a whole number between 3 and 12.',
          disabled,
          onEdit: (value) => props.edit('fish', value),
        }),
        React.createElement(SettingsValueField, {
          id: 'cngtn-pond-palette',
          label: 'Colour',
          text: snapshot.palette ? snapshot.palette.text : '',
          hint: 'mixed · warm · cool · mono',
          invalid: snapshot.palette ? snapshot.palette.invalid : false,
          invalidLabel: 'Use one of: mixed, warm, cool, mono.',
          disabled,
          onEdit: (value) => props.edit('palette', value),
        })
      );
    }

    diag.injectCalled = true;
    slots.inject('plugins.bundle.config', () => {
      diag.injectCallbackRan = true;
      try {
        const dispose = slots.register(
          {
            name: 'plugins.bundle.config',
            key: '@tal-shin/dsh-koi-pond',
            // The framework turns each hook into a \`useXxx\` prop and spreads the
            // actions alongside it — the same face the shipped bundle forms use.
            inject: () => ({ hooks: { pondForm: state }, ...model.actions() }),
          },
          PondConfig
        );
        diag.bundleConfigRegistered = true;
        return dispose;
      } catch (error) {
        diag.notes.push('register threw: ' + (error && error.message));
        console.warn('[koi-pond] slot register failed:', error && error.message);
        return () => {};
      }
    });
  } catch (error) {
    diag.notes.push('register: ' + (error && error.message));
    console.warn('[koi-pond] bundle config registration failed:', error && error.message);
  }
}

/**
 * A "Pond" button in the Settings header, for the floating panel.
 *
 * Same service rule as the config form: \`ctx.get\`, never \`ctx.inject\`. Optional
 * throughout — if the slot is missing, the console API and the bundle's own
 * settings page still work.
 */
function installSettingsButton(ctx) {
  let slots;
  try {
    slots = typeof ctx.get === 'function' ? ctx.get('slots') : undefined;
  } catch {
    return;
  }
  if (!slots || typeof slots.register !== 'function') return;

  let React;
  try {
    React = require('react');
  } catch {
    return;
  }

  function PondButton() {
    return React.createElement(
      'button',
      {
        type: 'button',
        title: 'Pond settings',
        onClick: () => openPanel(),
        style: {
          height: '28px',
          padding: '0 10px',
          border: '0.5px solid var(--dsw-alias-border-l2)',
          borderRadius: 'var(--dsw-radius-sm, 10px)',
          background: 'transparent',
          color: 'var(--dsw-alias-label-secondary)',
          font: 'var(--dsw-font-xs-13, 13px/20px var(--dsw-font-family))',
          cursor: 'pointer',
        },
      },
      String(navigator.language || '').toLowerCase().startsWith('zh') ? '锦鲤' : 'Pond'
    );
  }

  try {
    slots.inject('settings.action', () =>
      slots.register({ name: 'settings.action', id: 'koi-pond', order: 20 }, PondButton)
    );
  } catch (error) {
    console.warn('[koi-pond] settings button unavailable:', error && error.message);
  }
}

/** Client plugin body: the pond, the token layer, then the stylesheet. */
function apply(ctx, config) {
  try {
    // The Host config is the source of truth; the cache and the patch defaults
    // are only fallbacks. Connecting first means the very first seed already
    // uses the saved school.
    connectHostSettings(ctx);
    const settings = normalizeSettings({ ...(config ?? {}), ...readStored() });
    ctx.effect(() => mountPond(settings), 'koi-pond: koi pond');
    ctx.effect(() => injectStyles(), 'koi-pond: stylesheet');
    exposeApi();
    registerBundleConfig(ctx);
    installSettingsButton(ctx);
  } catch (error) {
    console.error('[koi-pond] apply failed:', error && (error.stack || error.message));
    throw error;
  }
}

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
