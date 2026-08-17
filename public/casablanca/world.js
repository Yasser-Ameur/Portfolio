// Casablanca — sequence painter.
// Everything here is a pure function of timeline progress t ∈ [0,1].
// No triggers, no side effects: scrolling backward runs the film backward.
import { createChapter2, BEATS2 } from './chapter2.js';

// where chapter one ends on the master timeline
export const CH1 = 0.42;

export const P = {
  warmWhite: '#F2EDE4', sand: '#E0C9A6', beige: '#D9BE95', fadedPink: '#C98B90',
  mutedYellow: '#E8C879', seaBlue: '#3E7C8C', skyBlue: '#A9CFE0', sage: '#8CA57A',
  bougain: '#9E2B4E', concrete: '#A9A49B', asphalt: '#3A3A38', darkGreen: '#2F4A2E',
  wood: '#7A4A26', iron: '#4A4A4A'
};

export const BEATS = [
  { id: 'first-light',    label: 'First light',    t0: 0.000, t1: 0.050 },
  { id: 'the-building',   label: 'The building',   t0: 0.050, t1: 0.110 },
  { id: 'casablanca',     label: 'Casablanca',     t0: 0.110, t1: 0.175 },
  { id: 'the-room',       label: 'The room',       t0: 0.175, t1: 0.250 },
  { id: 'the-glance',     label: 'The glance',     t0: 0.250, t1: 0.285, star: true },
  { id: 'out',            label: 'Out',            t0: 0.285, t1: 0.330 },
  { id: 'the-stairwell',  label: 'The stairwell',  t0: 0.330, t1: 0.400 },
  { id: 'the-street',     label: 'The street',     t0: 0.400, t1: 0.470 },
  { id: 'friends',        label: 'Friends',        t0: 0.470, t1: 0.535 },
  { id: 'street-football',label: 'Street football',t0: 0.535, t1: 0.615 },
  { id: 'the-field',      label: 'The field',      t0: 0.615, t1: 0.680 },
  { id: 'the-climb',      label: 'The climb',      t0: 0.680, t1: 0.760 },
  { id: 'the-reveal',     label: 'The reveal',     t0: 0.760, t1: 0.840, star: true },
  { id: 'hold',           label: 'Hold',           t0: 0.840, t1: 0.880, star: true },
  { id: 'home',           label: 'Home',           t0: 0.880, t1: 0.940 },
  { id: 'the-room-again', label: 'The room again', t0: 0.940, t1: 0.985 },
  { id: 'curiosity',      label: 'Curiosity',      t0: 0.985, t1: 1.000, star: true }
];

/* ---------- math ---------- */
const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = k => k * k * (3 - 2 * k);
const inv = (a, b, v) => b === a ? 0 : cl((v - a) / (b - a));
const ease = (a, b, v) => smooth(inv(a, b, v));

function track(keys, t, easing = true) {
  if (t <= keys[0].t) return keys[0];
  const last = keys[keys.length - 1];
  if (t >= last.t) return last;
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].t < t) i++;
  const a = keys[i], b = keys[i + 1];
  let k = inv(a.t, b.t, t);
  if (easing && a.hold !== true) k = smooth(k);
  const out = {};
  for (const key in a) {
    if (key === 't' || key === 'hold') continue;
    out[key] = typeof a[key] === 'number' ? lerp(a[key], b[key] ?? a[key], k) : a[key];
  }
  return out;
}

function parseC(c) {
  if (Array.isArray(c)) return c;
  if (c.charCodeAt(0) === 35) {
    if (c.length === 4) return [parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16)];
    return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  }
  const m = c.match(/-?\d*\.?\d+/g);
  return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
}
function mix(c1, c2, k) {
  const a = parseC(c1), b = parseC(c2);
  return `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;
}
const rgba = (c, a) => { const p = parseC(c); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; };
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/* ---------- camera / character tracks ----------
   F = frustum: world units across the frame at the character plane.
   Character screen height = 1.5 * W / F  ·  small F = tight shot.
   horizon = fraction of viewport height   ·  camH = camera height in world units. */

const CAM = [
  { t: 0.000, x: 128.0, F: 5.0,  horizon: 0.30, camH: 3.0, pitch: 0.52 },
  { t: 0.050, x: 128.0, F: 5.0,  horizon: 0.30, camH: 3.0, pitch: 0.52 },
  { t: 0.110, x: 127.0, F: 11.0, horizon: 0.22, camH: 3.0, pitch: 0.24 },
  { t: 0.145, x: 126.0, F: 16.0, horizon: 0.17, camH: 3.2, pitch: 0.04 },
  { t: 0.175, x: 127.4, F: 9.0,  horizon: 0.20, camH: 3.1, pitch: 0 },
  { t: 0.250, x: 127.4, F: 3.4,  horizon: 0.20, camH: 3.1, pitch: 0 },
  { t: 0.285, x: 127.4, F: 3.4,  horizon: 0.20, camH: 3.1, pitch: 0, hold: true },
  { t: 0.330, x: 127.4, F: 5.0,  horizon: 0.24, camH: 3.1, pitch: 0 },
  { t: 0.400, x: 127.4, F: 5.0,  horizon: 0.24, camH: 3.1, pitch: 0 },
  { t: 0.470, x: 130.0, F: 8.5,  horizon: 0.21, camH: 3.0, pitch: 0 },
  { t: 0.535, x: 143.0, F: 8.5,  horizon: 0.21, camH: 3.0, pitch: 0 },
  { t: 0.615, x: 150.0, F: 11.0, horizon: 0.23, camH: 3.0, pitch: 0 },
  { t: 0.680, x: 168.0, F: 11.0, horizon: 0.26, camH: 3.0, pitch: 0 },
  { t: 0.760, x: 196.0, F: 11.0, horizon: 0.36, camH: 2.7, pitch: 0 },
  { t: 0.815, x: 203.0, F: 22.0, horizon: 0.50, camH: 2.2, pitch: 0 },
  { t: 0.840, x: 204.0, F: 26.0, horizon: 0.53, camH: 2.0, pitch: 0 },
  { t: 0.880, x: 204.0, F: 26.0, horizon: 0.53, camH: 2.0, pitch: 0, hold: true },
  { t: 0.898, x: 139.0, F: 9.0,  horizon: 0.22, camH: 3.0, pitch: 0 },
  { t: 0.940, x: 133.0, F: 8.0,  horizon: 0.22, camH: 3.0, pitch: 0 },
  { t: 0.985, x: 133.0, F: 3.2,  horizon: 0.22, camH: 3.0, pitch: 0 },
  { t: 1.000, x: 133.0, F: 1.9,  horizon: 0.22, camH: 3.0, pitch: 0 }
];

// x = world position, dir: 1 right(west, toward the sea) / -1 left, look: 0 profile … 1 toward camera
const CHAR = [
  { t: 0.000, x: 128.0, vis: 0, look: 0.5, dir: 1 },
  { t: 0.392, x: 127.2, vis: 0, look: 0.5, dir: 1 },
  { t: 0.408, x: 127.3, vis: 1, look: 0.7, dir: 1 },
  { t: 0.425, x: 127.4, vis: 1, look: 0.9, dir: 1 },
  { t: 0.470, x: 128.4, vis: 1, look: 0.35, dir: 1 },
  { t: 0.500, x: 133.0, vis: 1, look: 0.15, dir: 1 },
  { t: 0.535, x: 141.4, vis: 1, look: 0.2, dir: 1 },
  { t: 0.615, x: 146.5, vis: 1, look: 0.3, dir: 1 },
  { t: 0.680, x: 164.0, vis: 1, look: 0.2, dir: 1 },
  { t: 0.745, x: 198.0, vis: 1, look: 0.1, dir: 1 },
  { t: 0.790, x: 202.4, vis: 1, look: 0.0, dir: 1 },
  { t: 0.880, x: 202.4, vis: 1, look: 0.0, dir: 1, hold: true },
  { t: 0.898, x: 140.5, vis: 1, look: 0.45, dir: -1 },
  { t: 0.940, x: 134.6, vis: 1, look: 0.45, dir: -1 },
  { t: 1.000, x: 133.6, vis: 0, look: 0.45, dir: -1 }
];

// 0 = near-black room-tone night · 1 = full late afternoon
const LIGHT = [
  { t: 0.000, day: 0.00, evening: 0 },
  { t: 0.060, day: 0.06, evening: 0 },
  { t: 0.110, day: 0.42, evening: 0 },
  { t: 0.170, day: 1.00, evening: 0 },
  { t: 0.760, day: 1.00, evening: 0 },
  { t: 0.880, day: 1.00, evening: 0.28 },
  { t: 0.912, day: 0.99, evening: 0.60 },
  { t: 0.940, day: 0.96, evening: 0.78 },
  { t: 1.000, day: 0.92, evening: 0.86 }
];

/* ---------- scene weights: the world dissolves, it never cuts ---------- */
function weights(t) {
  const w = { street: 0, room: 0, hall: 0, stair: 0, reveal: 0, bedroom: 0 };
  const roomIn = ease(0.178, 0.215, t);            // push through the glass
  const hallIn = ease(0.292, 0.318, t);            // new angle, hallway beyond
  const stairIn = ease(0.336, 0.360, t);
  const streetBack = ease(0.398, 0.424, t);        // door opens, light floods
  const revealIn = ease(0.742, 0.800, t);
  const homeBack = ease(0.878, 0.898, t);
  const bedIn = ease(0.936, 0.958, t);

  w.street = 1;
  w.room = roomIn;
  w.hall = hallIn;
  w.stair = stairIn;
  w.street = Math.max(1 - Math.max(roomIn, hallIn, stairIn), streetBack);
  w.room *= 1 - hallIn;
  w.hall *= 1 - stairIn;
  w.stair *= 1 - streetBack;
  w.reveal = revealIn * (1 - homeBack);
  w.street *= (1 - revealIn * (1 - homeBack));
  w.bedroom = bedIn;
  w.street *= 1 - bedIn;
  w.reveal *= 1 - bedIn;
  return w;
}

export function sample(t) {
  t = cl(t);
  let bi = 0;
  for (let i = 0; i < BEATS.length; i++) if (t >= BEATS[i].t0) bi = i;
  const cam = track(CAM, t), ch = track(CHAR, t), li = track(LIGHT, t);
  const prev = t - 0.0016, nx = track(CHAR, Math.max(0, prev));
  const speed = Math.abs(ch.x - nx.x) / 0.0016;
  return {
    t, beat: BEATS[bi], index: bi, cam, ch, li, w: weights(t), speed,
    caption: t > 0.112 && t < 0.163 ? 'Casablanca' : null,
    line: t > 0.556 && t < 0.604 ? 1 : t > 0.986 ? 2 : 0
  };
}

export const ALL_BEATS = [
  ...BEATS.map(b => ({ ...b, t0: b.t0 * CH1, t1: b.t1 * CH1, ch: 1 })),
  ...BEATS2.map(b => ({ ...b, t0: CH1 + b.t0 * (1 - CH1), t1: CH1 + b.t1 * (1 - CH1), ch: 2 }))
];

export function masterBeat(t) {
  let bi = 0;
  for (let i = 0; i < ALL_BEATS.length; i++) if (t >= ALL_BEATS[i].t0) bi = i;
  return bi;
}

/* ---------- the world, generated once, deterministically ---------- */
function makeCity() {
  const r = rng(20040711);
  const rows = { far: [], mid: [] };
  const faces = [P.sand, P.beige, P.warmWhite, '#CBB08A', '#DCC7A4', '#C9B79C', '#D8C3B2', '#CFC2A6', '#E2CDAA', '#BFAE95'];
  for (const key of ['far', 'mid']) {
    let x = 60;
    const end = 320;
    while (x < end) {
      const w = key === 'far' ? 6 + r() * 9 : 7 + r() * 7;
      const floors = key === 'far' ? 2 + Math.floor(r() * 4) : 3 + Math.floor(r() * 3);
      rows[key].push({
        x, w, floors,
        face: faces[Math.floor(r() * faces.length)],
        shop: r() > 0.42,
        awning: r() > 0.55 ? (r() > 0.5 ? P.seaBlue : P.bougain) : null,
        seed: Math.floor(r() * 9999),
        terraces: r() > 0.6
      });
      x += w + (key === 'far' ? 0.6 + r() * 1.2 : 1.5 + r() * 2.8);
    }
  }
  const cars = [];
  let side = 0;
  for (let x = 62; x < 300; x += 3.4 + r() * 3.6) {
    if (x > 137.5 && x < 177) continue;                 // the pitch stays clear
    side = r() > 0.42 ? 1 - side : side;
    cars.push({ x, side, col: ['#8E2F2A', '#3F4C5C', '#B8B3A8', '#2E3436', '#6E7A84', '#A8A093', '#7A6A55', '#C4BCA8'][Math.floor(r() * 8)], seed: Math.floor(r() * 999) });
  }
  // near kerb: the things a street actually has on it
  const props = [];
  for (let x = 60; x < 310; x += 2.6 + r() * 4.2) {
    const k = r();
    props.push({ x, seed: Math.floor(r() * 999), kind: k > 0.76 ? 'moped' : k > 0.58 ? 'bin' : k > 0.34 ? 'plant' : 'bollard' });
  }
  const trees = [];
  for (let x = 64; x < 310; x += 9 + r() * 14) trees.push({ x, s: 0.8 + r() * 0.5, seed: Math.floor(r() * 999) });
  const lamps = [];
  for (let x = 66; x < 310; x += 16) lamps.push({ x });
  // the window the film opens on — third floor, world x 128.4
  let hero = rows.mid.find(b => 128.4 >= b.x && 128.4 <= b.x + b.w);
  if (hero) { hero.x = 124.0; hero.w = 9.0; hero.floors = 5; hero.face = P.sand; hero.shop = true; hero.awning = P.seaBlue; }
  else { hero = { x: 124.0, w: 9.0, floors: 5, face: P.sand, shop: true, awning: P.seaBlue, seed: 4242, terraces: true }; rows.mid.push(hero); }
  rows.mid = rows.mid.filter(b => b === hero || b.x + b.w <= 124.0 || b.x >= 133.0);
  rows.mid.sort((a, b) => a.x - b.x);
  const kids = [
    { x: 139.5, z: 0.50, kit: [P.bougain, '#1F3A5F'], seed: 3, role: 'wait' },
    { x: 143.2, z: 0.36, kit: ['#E8E3D8', P.darkGreen], seed: 8, role: 'run' },
    { x: 147.0, z: 0.55, kit: ['#2F6E8F', '#22303A'], seed: 12, role: 'wait' },
    { x: 151.6, z: 0.40, kit: [P.mutedYellow, '#3A3A38'], seed: 21, role: 'kick' },
    { x: 155.0, z: 0.52, kit: ['#B23A3A', '#E8E3D8'], seed: 30, role: 'wait' }
  ];
  return { rows, cars, trees, lamps, kids, hero, props };
}
const CITY = makeCity();

/* ---------- painter ---------- */
export function createWorld(canvas, A) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let W = 0, H = 0, DPR = 1;
  const bloomC = document.createElement('canvas'); bloomC.width = 320; bloomC.height = 180;
  const bctx = bloomC.getContext('2d');
  const sprC = document.createElement('canvas'); const sctx = sprC.getContext('2d');
  const grainC = document.createElement('canvas'); grainC.width = 180; grainC.height = 180;
  (() => {
    const g = grainC.getContext('2d'), d = g.createImageData(180, 180), r = rng(7);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 118 + r() * 74;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
  })();

  const api = {
    get ctx() { return ctx; }, get W() { return W; }, get H() { return H; },
    A, mix, rgba, lerp, cl, ease, smooth, rng, sprite, pool, push, P
  };
  const ch2 = createChapter2(api);

  function setSize(w, h, dpr) {
    DPR = dpr; W = w; H = h;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  }

  // geometry helpers, rebuilt per frame from the sampled camera
  let G = null;
  function geom(s) {
    const F = s.cam.F, aspectK = cl((H / W) / 0.78, 0.70, 2.30);
    const scaleK = cl(aspectK, 0.85, 1.45);
    const zoom = (W / F) * scaleK;
    const vK = aspectK / scaleK;
    const hz = (s.cam.horizon + (s.cam.pitch || 0)) * H;
    const S = z => 0.18 + 0.82 * Math.pow(1 - z, 1.7);
    const s0 = S(0.44);
    const sn = z => S(z) / s0;
    return {
      zoom, hz, sn,
      gy: z => hz + s.cam.camH * zoom * vK * sn(z),
      sx: (wx, z) => W * 0.5 + (wx - s.cam.x) * sn(z) * zoom
    };
  }

  /* ---- sky ---- */
  function sky(s) {
    const day = s.li.day, ev = s.li.evening;
    const top = mix(mix('#0B0E14', '#5E96B8', day), '#2E4A68', ev);
    const midC = mix(mix('#12161C', '#A9CFE0', day), '#8A7C96', ev);
    const low = mix(mix('#1A1712', '#F2E0BE', day), '#E8A46A', ev);
    const g = ctx.createLinearGradient(0, 0, 0, G.hz + 40);
    g.addColorStop(0, top); g.addColorStop(0.55, midC); g.addColorStop(1, low);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, G.hz + 42);

    // low sun to the west — screen right, ahead of him
    const sunX = W * 0.80, sunY = G.hz - H * 0.05;
    const a = day * (0.5 + ev * 0.4);
    if (a > 0.01) {
      const gl = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.42);
      gl.addColorStop(0, `rgba(255,236,196,${0.5 * a})`);
      gl.addColorStop(0.35, `rgba(255,206,150,${0.19 * a})`);
      gl.addColorStop(1, 'rgba(255,190,140,0)');
      ctx.fillStyle = gl; ctx.fillRect(0, 0, W, G.hz + 60);
    }
    // haze bed sitting on the horizon
    const hg = ctx.createLinearGradient(0, G.hz - H * 0.14, 0, G.hz + 20);
    hg.addColorStop(0, rgba('#F2E0BE', 0)); hg.addColorStop(1, rgba('#F2E0BE', 0.36 * day));
    ctx.fillStyle = hg; ctx.fillRect(0, G.hz - H * 0.14, W, H * 0.14 + 20);
  }

  const hazeOf = (z, day) => cl(Math.pow(z, 2.1) * (0.20 + 0.62 * day) * 0.95, 0, 0.86);
  const hazeCol = (day, ev) => mix(mix('#16191F', '#EBD9BA', day), '#E5A97A', ev);

  /* ---- one façade ---- */
  function facade(b, z, s, opts) {
    const day = s.li.day, ev = s.li.evening;
    const x0 = G.sx(b.x, z), x1 = G.sx(b.x + b.w, z);
    if (x1 < -60 || x0 > W + 60) return;
    const base = G.gy(z);
    const fh = b.floors * 1.95 + 1.5;
    const top = base - fh * G.zoom * G.sn(z);
    const wdt = x1 - x0;
    const hz = hazeOf(z, day), hc = hazeCol(day, ev);
    const lit = mix(b.face, '#FFE6BE', 0.20 * day + 0.24 * ev);
    const shade = mix(b.face, '#2A2F3C', 0.42 - 0.10 * day);

    // body, warm on the sun side
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, mix(shade, lit, 0.16)); g.addColorStop(0.34, mix(shade, lit, 0.78)); g.addColorStop(1, lit);
    ctx.fillStyle = g; ctx.fillRect(x0, top, wdt, base - top);
    // the neighbour to the west blocks the low sun off this wall's left edge
    const shw = wdt * 0.14;
    const sg2 = ctx.createLinearGradient(x0, 0, x0 + shw, 0);
    sg2.addColorStop(0, 'rgba(28,26,38,0.34)'); sg2.addColorStop(1, 'rgba(28,26,38,0)');
    ctx.fillStyle = sg2; ctx.fillRect(x0, top, shw, base - top);

    // parapet
    ctx.fillStyle = mix(lit, '#FFFFFF', 0.12);
    ctx.fillRect(x0, top, wdt, Math.max(2, 0.28 * G.zoom * G.sn(z)));

    const cols = Math.max(2, Math.round(b.w / 2.6));
    const cw = wdt / cols;
    const r = rng(b.seed);
    const flH = (fh - 1.5) / b.floors * G.zoom * G.sn(z);
    for (let f = 0; f < b.floors; f++) {
      const fy = base - 1.5 * G.zoom * G.sn(z) - (f + 1) * flH;
      // floor band
      ctx.fillStyle = rgba('#000000', 0.06);
      ctx.fillRect(x0, fy + flH - Math.max(1, flH * 0.05), wdt, Math.max(1, flH * 0.05));
      for (let c = 0; c < cols; c++) {
        const wx = x0 + c * cw + cw * 0.24, ww = cw * 0.52;
        const wy = fy + flH * 0.20, wh = flH * 0.52;
        if (ww < 1.2 || wh < 1.2) continue;
        const dark = 0.82 - r() * 0.2;
        const nightLit = day < 0.5 && r() > 0.86;
        const glow = ev * (r() > 0.55 ? 1 : 0);
        // reveal: the opening is cut into the wall
        ctx.fillStyle = rgba('#2E2A26', 0.42);
        ctx.fillRect(wx - Math.max(0.5, ww * 0.05), wy - Math.max(0.5, wh * 0.05), ww * 1.1, wh * 1.08);
        ctx.fillStyle = nightLit || glow > 0.2
          ? mix('#20232A', '#FFC97A', cl(0.78 * Math.max(nightLit ? 1 : 0, glow)))
          : mix('#141A24', hc, hz * 0.30 + 0.06 * day * dark);
        ctx.fillRect(wx, wy, ww, wh);
        // lintel shadow inside the opening
        ctx.fillStyle = 'rgba(6,8,12,0.34)';
        ctx.fillRect(wx, wy, ww, Math.max(0.5, wh * 0.16));
        // shutter, half down on some
        if (r() > 0.62) {
          ctx.fillStyle = rgba('#6E7A82', 0.62 + 0.16 * day);
          ctx.fillRect(wx, wy, ww, wh * (0.28 + r() * 0.36));
        }
        // balcony rail
        if (opts.detail && flH > 16 && r() > 0.42) {
          const by = wy + wh;
          ctx.fillStyle = 'rgba(20,18,26,0.22)';
          ctx.fillRect(wx - cw * 0.06, by + flH * 0.17, ww + cw * 0.12, Math.max(0.5, flH * 0.06));
          ctx.strokeStyle = rgba('#2A2A28', 0.72); ctx.lineWidth = Math.max(0.6, flH * 0.028);
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) { const px = wx - cw * 0.05 + (ww + cw * 0.1) * i / 6; ctx.moveTo(px, by); ctx.lineTo(px, by + flH * 0.17); }
          ctx.moveTo(wx - cw * 0.05, by + flH * 0.17); ctx.lineTo(wx + ww + cw * 0.05, by + flH * 0.17);
          ctx.stroke();
        }
      }
    }
    // ground floor: shop front, awning, doorway
    const gy0 = base - 1.5 * G.zoom * G.sn(z);
    const gfl = mix(mix(b.face, '#FFE8C4', 0.10 * day), '#3A3630', 0.30 - 0.14 * day);
    ctx.fillStyle = mix(gfl, hc, hz * 0.5);
    ctx.fillRect(x0, gy0, wdt, base - gy0);
    ctx.fillStyle = rgba('#241F1A', 0.26);
    ctx.fillRect(x0, gy0, wdt, Math.max(1, (base - gy0) * 0.09));
    if (b.shop) {
      const sw = wdt * 0.62, sx = x0 + wdt * 0.19;
      ctx.fillStyle = mix(r() > 0.5 ? '#8E9AA2' : '#9AA0A0', hc, hz * 0.55);
      ctx.fillRect(sx, gy0 + (base - gy0) * 0.12, sw, (base - gy0) * 0.88);
      if (opts.detail && sw > 8) {
        ctx.strokeStyle = rgba('#000000', 0.16); ctx.lineWidth = 1;
        for (let i = 1; i < 7; i++) { const yy = gy0 + (base - gy0) * (0.12 + 0.88 * i / 7); ctx.beginPath(); ctx.moveTo(sx, yy); ctx.lineTo(sx + sw, yy); ctx.stroke(); }
      }
      if (b.awning) {
        ctx.fillStyle = mix(b.awning, hc, hz * 0.6);
        ctx.beginPath();
        ctx.moveTo(sx - wdt * 0.04, gy0 + (base - gy0) * 0.1);
        ctx.lineTo(sx + sw + wdt * 0.04, gy0 + (base - gy0) * 0.1);
        ctx.lineTo(sx + sw + wdt * 0.02, gy0 + (base - gy0) * 0.3);
        ctx.lineTo(sx - wdt * 0.02, gy0 + (base - gy0) * 0.3);
        ctx.closePath(); ctx.fill();
      }
    }
    // atmospheric veil
    if (hz > 0.01) { ctx.fillStyle = rgba(day > 0.5 ? '#EBD9BA' : '#12161C', hz); ctx.fillRect(x0 - 1, top - 1, wdt + 2, base - top + 2); }
  }

  // sprite + rim light, composited on its own layer so the light lands on him,
  // not on his bounding box
  function sprite(img, cx, yBase, hpx, flip, rim, shadow, day) {
    const w = hpx * (img.width / img.height);
    const iw = Math.max(2, Math.round(w)), ih = Math.max(2, Math.round(hpx));
    if (sprC.width !== iw || sprC.height !== ih) { sprC.width = iw; sprC.height = ih; }
    else sctx.clearRect(0, 0, iw, ih);
    sctx.globalCompositeOperation = 'source-over';
    sctx.drawImage(img, 0, 0, iw, ih);
    if (rim > 0.01) {
      sctx.globalCompositeOperation = 'source-atop';
      const g = sctx.createLinearGradient(0, 0, iw, 0);
      g.addColorStop(0, `rgba(58,78,124,${0.16 * rim})`);
      g.addColorStop(0.5, 'rgba(255,220,170,0)');
      g.addColorStop(1, `rgba(255,226,178,${0.42 * rim})`);
      sctx.fillStyle = g; sctx.fillRect(0, 0, iw, ih);
      sctx.globalCompositeOperation = 'source-over';
    }
    if (shadow > 0.01) {
      ctx.save();
      ctx.globalAlpha = ctx.globalAlpha * shadow;
      ctx.fillStyle = rgba('#150F04', 0.34 * day);
      ctx.beginPath(); ctx.ellipse(cx, yBase, w * 0.42, hpx * 0.035, 0, 0, 6.3); ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(cx, yBase);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(sprC, -w * 0.5, -hpx, w, hpx);
    ctx.restore();
    return w;
  }

  function figure(px, py, hpx, kit, phase, role, day) {
    const w = hpx * 0.30;
    ctx.save();
    ctx.translate(px, py);
    const bob = role === 'run' ? Math.sin(phase * 7) * hpx * 0.03 : Math.sin(phase * 1.6) * hpx * 0.008;
    ctx.translate(0, bob);
    // shadow
    ctx.fillStyle = rgba('#1A1508', 0.30 * day);
    ctx.beginPath(); ctx.ellipse(hpx * 0.10, 0, w * 0.85, hpx * 0.045, 0, 0, 6.3); ctx.fill();
    // legs
    ctx.fillStyle = mix('#8A5A38', '#000000', 0.1);
    const sp = role === 'run' ? Math.sin(phase * 7) * hpx * 0.11 : hpx * 0.02;
    ctx.fillRect(-w * 0.30 - sp * 0.5, -hpx * 0.33, w * 0.24, hpx * 0.33);
    ctx.fillRect(w * 0.08 + sp * 0.5, -hpx * 0.33, w * 0.24, hpx * 0.33);
    // shorts
    ctx.fillStyle = kit[1]; ctx.fillRect(-w * 0.36, -hpx * 0.50, w * 0.72, hpx * 0.19);
    // shirt
    ctx.fillStyle = kit[0]; ctx.fillRect(-w * 0.40, -hpx * 0.79, w * 0.80, hpx * 0.31);
    // arms
    ctx.fillStyle = mix('#8A5A38', '#000000', 0.05);
    const aw = role === 'run' ? Math.sin(phase * 7 + 3.1) * hpx * 0.07 : 0;
    ctx.fillRect(-w * 0.53, -hpx * 0.76 + aw, w * 0.14, hpx * 0.26);
    ctx.fillRect(w * 0.39, -hpx * 0.76 - aw, w * 0.14, hpx * 0.26);
    // head + hair
    ctx.fillStyle = '#8A5A38';
    ctx.beginPath(); ctx.arc(0, -hpx * 0.865, hpx * 0.092, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#1B1410';
    ctx.beginPath(); ctx.arc(0, -hpx * 0.905, hpx * 0.094, Math.PI * 1.04, Math.PI * 2.0); ctx.fill();
    if (hpx > 84) {
      ctx.fillStyle = 'rgba(28,20,16,0.72)';
      const er = Math.max(1, hpx * 0.011);
      ctx.beginPath(); ctx.arc(-hpx * 0.030, -hpx * 0.862, er, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.arc(hpx * 0.030, -hpx * 0.862, er, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(90,52,32,0.30)';
      ctx.beginPath(); ctx.arc(0, -hpx * 0.828, hpx * 0.020, 0, Math.PI); ctx.fill();
    }
    ctx.restore();
  }

  function streetProp(p, z, s) {
    const day = s.li.day, x = G.sx(p.x, z), sc = G.sn(z) * G.zoom, y = G.gy(z);
    if (x < -sc * 3 || x > W + sc * 3) return;
    const hc = hazeCol(day, s.li.evening), hz = hazeOf(z, day);
    const sh = (w2, h2) => { ctx.fillStyle = rgba('#150F04', 0.30 * day); ctx.beginPath(); ctx.ellipse(x - sc * 0.06, y, w2, h2, 0, 0, 6.3); ctx.fill(); };
    if (p.kind === 'bollard') {
      sh(sc * 0.13, sc * 0.04);
      ctx.fillStyle = mix('#5A5248', hc, hz * 0.5);
      ctx.fillRect(x - sc * 0.055, y - sc * 0.62, sc * 0.11, sc * 0.62);
      ctx.fillStyle = rgba('#FFE2AE', 0.34 * day);
      ctx.fillRect(x + sc * 0.02, y - sc * 0.62, sc * 0.035, sc * 0.62);
    } else if (p.kind === 'bin') {
      sh(sc * 0.3, sc * 0.07);
      ctx.fillStyle = mix(P.darkGreen, hc, hz * 0.45);
      ctx.fillRect(x - sc * 0.26, y - sc * 0.92, sc * 0.52, sc * 0.92);
      ctx.fillStyle = rgba('#FFE2AE', 0.20 * day);
      ctx.fillRect(x + sc * 0.10, y - sc * 0.92, sc * 0.16, sc * 0.92);
      ctx.fillStyle = mix('#2A2E28', hc, hz * 0.4);
      ctx.fillRect(x - sc * 0.30, y - sc * 1.02, sc * 0.60, sc * 0.12);
    } else if (p.kind === 'plant') {
      sh(sc * 0.26, sc * 0.06);
      ctx.fillStyle = mix('#9A6A48', hc, hz * 0.45);
      ctx.beginPath();
      ctx.moveTo(x - sc * 0.20, y - sc * 0.44); ctx.lineTo(x + sc * 0.20, y - sc * 0.44);
      ctx.lineTo(x + sc * 0.14, y); ctx.lineTo(x - sc * 0.14, y); ctx.closePath(); ctx.fill();
      const r2 = rng(p.seed);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = mix(mix(P.darkGreen, P.sage, r2()), hc, hz * 0.4);
        ctx.beginPath();
        ctx.ellipse(x + (r2() - 0.5) * sc * 0.42, y - sc * (0.52 + r2() * 0.42), sc * 0.13, sc * 0.19, (r2() - 0.5) * 1.2, 0, 6.3);
        ctx.fill();
      }
    } else {
      sh(sc * 0.42, sc * 0.06);
      ctx.fillStyle = mix('#3A3E44', hc, hz * 0.4);
      ctx.fillRect(x - sc * 0.40, y - sc * 0.60, sc * 0.62, sc * 0.20);
      ctx.fillStyle = mix('#8E2F2A', hc, hz * 0.4);
      ctx.fillRect(x - sc * 0.16, y - sc * 0.78, sc * 0.34, sc * 0.24);
      ctx.strokeStyle = mix('#2A2C30', hc, hz * 0.4); ctx.lineWidth = Math.max(1, sc * 0.05);
      ctx.beginPath(); ctx.moveTo(x - sc * 0.34, y - sc * 0.74); ctx.lineTo(x + sc * 0.16, y - sc * 0.86); ctx.stroke();
      ctx.fillStyle = '#16130F';
      for (const wx of [x - sc * 0.36, x + sc * 0.18]) { ctx.beginPath(); ctx.ellipse(wx, y - sc * 0.16, sc * 0.17, sc * 0.17, 0, 0, 6.3); ctx.fill(); }
    }
  }

  function car(c, z, s) {
    const day = s.li.day;
    const x = G.sx(c.x, z), sc = G.sn(z) * G.zoom;
    const y = G.gy(z);
    const L = sc * 4.1, Hh = sc * 1.25;
    if (x + L < -40 || x - L > W + 40) return;
    const hz = hazeOf(z, day), hc = hazeCol(day, s.li.evening);
    ctx.fillStyle = rgba('#150F04', 0.34 * day);
    ctx.beginPath(); ctx.ellipse(x, y, L * 0.52, Hh * 0.17, 0, 0, 6.3); ctx.fill();
    const body = mix(c.col, hc, hz * 0.7);
    ctx.fillStyle = body;
    const rr = Hh * 0.22;
    ctx.beginPath();
    ctx.moveTo(x - L / 2 + rr, y - Hh * 0.42); ctx.lineTo(x + L / 2 - rr, y - Hh * 0.42);
    ctx.quadraticCurveTo(x + L / 2, y - Hh * 0.42, x + L / 2, y - Hh * 0.2);
    ctx.lineTo(x + L / 2, y - Hh * 0.06); ctx.lineTo(x - L / 2, y - Hh * 0.06);
    ctx.lineTo(x - L / 2, y - Hh * 0.2);
    ctx.quadraticCurveTo(x - L / 2, y - Hh * 0.42, x - L / 2 + rr, y - Hh * 0.42);
    ctx.closePath(); ctx.fill();
    // cabin
    ctx.fillStyle = mix(body, '#000000', 0.12);
    ctx.beginPath();
    ctx.moveTo(x - L * 0.24, y - Hh * 0.42); ctx.lineTo(x - L * 0.13, y - Hh * 0.98);
    ctx.lineTo(x + L * 0.16, y - Hh * 0.98); ctx.lineTo(x + L * 0.29, y - Hh * 0.42);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = mix('#95AEBC', hc, hz * 0.6);
    ctx.beginPath();
    ctx.moveTo(x - L * 0.21, y - Hh * 0.46); ctx.lineTo(x - L * 0.115, y - Hh * 0.92);
    ctx.lineTo(x + L * 0.145, y - Hh * 0.92); ctx.lineTo(x + L * 0.25, y - Hh * 0.46);
    ctx.closePath(); ctx.fill();
    // top highlight
    ctx.fillStyle = rgba('#FFE9C4', 0.16 * day);
    ctx.fillRect(x - L * 0.13, y - Hh * 1.0, L * 0.29, Math.max(1, Hh * 0.05));
    ctx.fillStyle = '#14100C';
    for (const wx of [x - L * 0.29, x + L * 0.30]) { ctx.beginPath(); ctx.ellipse(wx, y - Hh * 0.07, L * 0.075, Hh * 0.14, 0, 0, 6.3); ctx.fill(); }
  }

  function tree(tr, z, s) {
    const day = s.li.day, x = G.sx(tr.x, z), sc = G.sn(z) * G.zoom, y = G.gy(z);
    if (x < -80 || x > W + 80) return;
    const h = sc * 4.4 * tr.s;
    const hz = hazeOf(z, day), hc = hazeCol(day, s.li.evening);
    ctx.fillStyle = rgba('#150F04', 0.26 * day);
    ctx.beginPath(); ctx.ellipse(x - h * 0.1, y, h * 0.24, h * 0.035, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = mix(P.wood, hc, hz * 0.7);
    ctx.fillRect(x - sc * 0.09, y - h * 0.55, sc * 0.18, h * 0.55);
    const r = rng(tr.seed);
    for (let i = 0; i < 6; i++) {
      const cx = x + (r() - 0.5) * h * 0.42, cy = y - h * (0.60 + r() * 0.30), rad = h * (0.14 + r() * 0.11);
      ctx.fillStyle = mix(mix(P.darkGreen, P.sage, r() * 0.8), hc, hz * 0.62);
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.3); ctx.fill();
    }
    ctx.fillStyle = rgba('#FFE2A8', 0.11 * day);
    for (let i = 0; i < 3; i++) { const cx = x + h * (0.06 + r() * 0.18), cy = y - h * (0.72 + r() * 0.16); ctx.beginPath(); ctx.arc(cx, cy, h * 0.05, 0, 6.3); ctx.fill(); }
  }

  function lamp(l, z, s) {
    const x = G.sx(l.x, z), sc = G.sn(z) * G.zoom, y = G.gy(z), day = s.li.day;
    if (x < -30 || x > W + 30) return;
    const h = sc * 5.4;
    ctx.strokeStyle = mix('#2E3234', hazeCol(day, s.li.evening), hazeOf(z, day) * 0.6);
    ctx.lineWidth = Math.max(1, sc * 0.09);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.lineTo(x + sc * 0.5, y - h); ctx.stroke();
    if (s.li.evening > 0.25 || day < 0.4) {
      const a = Math.max(s.li.evening, 1 - day) * 0.5;
      const g = ctx.createRadialGradient(x + sc * 0.5, y - h, 0, x + sc * 0.5, y - h, sc * 2.6);
      g.addColorStop(0, `rgba(255,214,150,${a})`); g.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + sc * 0.5, y - h, sc * 2.6, 0, 6.3); ctx.fill();
    }
  }

  /* ---- the street: beats 01-03, 08-12, 15 ---- */
  function street(s, alpha) {
    const day = s.li.day, ev = s.li.evening;
    ctx.save(); ctx.globalAlpha = alpha;
    sky(s);

    // distant skyline matte
    if (A.skyline && day > 0.05) {
      const z = 0.95, sc = G.sn(z) * G.zoom;
      const h = sc * 9, w = h * (A.skyline.width / A.skyline.height);
      const y = G.gy(z);
      ctx.save(); ctx.globalAlpha = alpha * (0.30 + 0.3 * day); ctx.filter = 'blur(2px)';
      for (let i = -1; i < 3; i++) ctx.drawImage(A.skyline, G.sx(40, z) + i * w * 0.98, y - h * 0.92, w, h);
      ctx.restore();
      ctx.fillStyle = rgba(hazeCol(day, ev), 0.5 * day); ctx.fillRect(0, y - h, W, h);
    }

    // far row across the street
    for (const b of CITY.rows.far) facade(b, 0.80, s, { detail: false });
    // opposite pavement, meeting the kerb
    const pz = 0.72, py = G.gy(pz), pyEnd = G.gy(0.62);
    const pgr = ctx.createLinearGradient(0, py, 0, pyEnd);
    pgr.addColorStop(0, mix('#C6BCA8', hazeCol(day, ev), hazeOf(pz, day) * 0.7));
    pgr.addColorStop(1, mix('#A79C87', hazeCol(day, ev), 0.2 * day));
    ctx.fillStyle = pgr; ctx.fillRect(0, py - 2, W, pyEnd - py + 3);
    for (const b of CITY.rows.mid) facade(b, 0.66, s, { detail: true });
    for (const l of CITY.lamps) lamp(l, 0.64, s);
    for (const tr of CITY.trees) if (tr.seed % 2 === 0) tree(tr, 0.64, s);

    // road
    const ry0 = pyEnd;
    const sunlit = mix('#5E574C', '#8C7C63', day);
    const shadowed = mix('#26262A', '#3A3733', day);
    const rg = ctx.createLinearGradient(0, ry0, 0, H);
    rg.addColorStop(0, mix(shadowed, hazeCol(day, ev), 0.22 * day));
    rg.addColorStop(0.34, sunlit);
    rg.addColorStop(1, mix(sunlit, '#332C24', 0.5));
    ctx.fillStyle = rg; ctx.fillRect(0, ry0 - 1, W, H - ry0 + 2);
    // kerb
    ctx.fillStyle = mix('#D2C8B2', hazeCol(day, ev), 0.18 * day);
    ctx.fillRect(0, ry0 - Math.max(1, G.zoom * 0.055), W, Math.max(1, G.zoom * 0.055));
    ctx.fillStyle = rgba('#1E1C18', 0.34);
    ctx.fillRect(0, ry0, W, Math.max(1, G.zoom * 0.035));

    // the far row throws long shadows across the tarmac — the light is low and west
    ctx.save();
    ctx.globalAlpha = alpha * 0.46 * day;
    for (const b of CITY.rows.mid) {
      const bx0 = G.sx(b.x, 0.66), bx1 = G.sx(b.x + b.w, 0.66);
      if (bx1 < -W || bx0 > W * 2) continue;
      const bh = b.floors * 1.95 + 1.5;
      const zBot = Math.max(0.08, 0.62 - bh * 0.048 - (b.seed % 7) * 0.012);
      const y0 = G.gy(0.62), y1 = G.gy(zBot);
      const dx = -bh * 0.50 * G.zoom * G.sn(0.4);
      const sg = ctx.createLinearGradient(0, y0, 0, y1);
      sg.addColorStop(0, 'rgba(26,22,30,0.90)');
      sg.addColorStop(0.5, 'rgba(28,24,32,0.66)');
      sg.addColorStop(0.82, 'rgba(32,26,34,0.24)');
      sg.addColorStop(1, 'rgba(34,28,36,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(bx0, y0); ctx.lineTo(bx1, y0);
      ctx.lineTo(bx1 + dx, y1); ctx.lineTo(bx0 + dx, y1);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // parked on the far kerb
    for (const c of CITY.cars) if (c.side === 1) car(c, 0.56, s);

    // centre line, dashed in world space
    ctx.fillStyle = rgba('#E4D9BC', 0.16 * day);
    for (let wx = Math.floor(s.cam.x) - 40; wx < s.cam.x + 40; wx += 3.4) {
      const x = G.sx(wx, 0.40), w2 = G.sn(0.40) * G.zoom * 1.5;
      ctx.fillRect(x, G.gy(0.40), w2, Math.max(1, G.zoom * 0.045));
    }

    // the pitch: rocks for goals, world x 138-176
    const pitchIn = ease(0.50, 0.56, s.t) * (1 - ease(0.66, 0.70, s.t));
    if (pitchIn > 0.01) {
      ctx.save(); ctx.globalAlpha = alpha * pitchIn;
      for (const [rx, rz] of [[139.4, 0.30], [139.4, 0.56], [156.6, 0.30], [156.6, 0.56]]) {
        const x = G.sx(rx, rz), y = G.gy(rz), sc = G.sn(rz) * G.zoom;
        ctx.fillStyle = rgba('#120E06', 0.34 * day);
        ctx.beginPath(); ctx.ellipse(x, y, sc * 0.24, sc * 0.06, 0, 0, 6.3); ctx.fill();
        ctx.fillStyle = mix('#A9A49B', '#FFE6BE', 0.3 * day);
        ctx.beginPath(); ctx.moveTo(x - sc * 0.2, y); ctx.lineTo(x - sc * 0.08, y - sc * 0.26); ctx.lineTo(x + sc * 0.13, y - sc * 0.22); ctx.lineTo(x + sc * 0.2, y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = rgba('#3A3A38', 0.4); ctx.beginPath(); ctx.moveTo(x - sc * 0.2, y); ctx.lineTo(x - sc * 0.08, y - sc * 0.26); ctx.lineTo(x - sc * 0.02, y - sc * 0.24); ctx.lineTo(x - sc * 0.04, y); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // friends
    const kidsIn = ease(0.452, 0.500, s.t) * (1 - ease(0.655, 0.700, s.t));
    if (kidsIn > 0.01) {
      ctx.save(); ctx.globalAlpha = alpha * kidsIn;
      const ordered = [...CITY.kids].sort((a, b) => b.z - a.z);
      for (const k of ordered) {
        const hpx = 1.42 * G.sn(k.z) * G.zoom;
        figure(G.sx(k.x, k.z), G.gy(k.z), hpx, k.kit, s.t * 40 + k.seed, k.role, day);
      }
      // the ball
      const bt = s.t;
      const bx = lerp(151.0, 144.0, ease(0.50, 0.545, bt)), bz = 0.44;
      const bhop = Math.abs(Math.sin(ease(0.50, 0.545, bt) * 9)) * (1 - ease(0.50, 0.60, bt));
      const bpx = G.sx(bx, bz), bsc = G.sn(bz) * G.zoom;
      const by = G.gy(bz) - bsc * 0.11 - bhop * bsc * 0.6;
      ctx.fillStyle = rgba('#120E06', 0.32 * day);
      ctx.beginPath(); ctx.ellipse(bpx, G.gy(bz), bsc * 0.13, bsc * 0.04, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#F2EDE4'; ctx.beginPath(); ctx.arc(bpx, by, bsc * 0.11, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#26262B';
      ctx.beginPath(); ctx.arc(bpx - bsc * 0.03, by - bsc * 0.02, bsc * 0.032, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.arc(bpx + bsc * 0.045, by + bsc * 0.035, bsc * 0.026, 0, 6.3); ctx.fill();
      ctx.restore();
    }

    character(s, alpha * (1 - ease(0.748, 0.792, s.t)));

    // near side: parked cars, then the near kerb and what stands on it
    for (const c of CITY.cars) if (c.side === 0) car(c, 0.30, s);
    const nz = 0.075, ny = G.gy(nz);
    const pg = ctx.createLinearGradient(0, ny - 6, 0, H);
    pg.addColorStop(0, mix('#B4A88F', hazeCol(day, ev), 0.10 * day));
    pg.addColorStop(0.4, mix('#8C8069', '#4A4133', 0.35));
    pg.addColorStop(1, mix('#5A5040', '#1A1610', 0.62));
    ctx.fillStyle = pg; ctx.fillRect(0, ny - 4, W, H - ny + 4);
    ctx.fillStyle = mix('#E2D8C0', hazeCol(day, ev), 0.1 * day);
    ctx.fillRect(0, ny - Math.max(1, G.zoom * 0.05), W, Math.max(1, G.zoom * 0.05));
    ctx.fillStyle = rgba('#1E1C18', 0.30);
    ctx.fillRect(0, ny, W, Math.max(1, G.zoom * 0.03));
    for (const p of CITY.props) streetProp(p, 0.045, s);

    // out-of-focus foreground: a wall edge on the left, wires above
    // overhead wires
    ctx.save();
    ctx.globalAlpha = alpha * (0.30 + 0.25 * day); ctx.strokeStyle = '#1C1A18';
    ctx.lineWidth = Math.max(1, H * 0.0018);
    for (let i = 0; i < 3; i++) {
      const yy = G.hz - H * (0.13 + i * 0.035);
      ctx.beginPath(); ctx.moveTo(-10, yy - 8); ctx.quadraticCurveTo(W * 0.5, yy + H * 0.022 + i * 5, W + 10, yy - 14); ctx.stroke();
    }
    ctx.restore();

    // night: the world is there, unlit. One window is not.
    const night = Math.pow(1 - day, 0.85);
    if (night > 0.01) {
      ctx.fillStyle = rgba('#05070E', night * 0.965);
      ctx.fillRect(0, 0, W, H);
      heroWindow(s, alpha, night);
    }
    ctx.restore();
  }

  // the third-floor window: the shape the sequence opens and closes on
  function heroWindow(s, alpha, night) {
    const b = CITY.hero, z = 0.66;
    const x0 = G.sx(b.x, z), x1 = G.sx(b.x + b.w, z);
    const base = G.gy(z), sn = G.sn(z);
    const fh = b.floors * 1.95 + 1.5;
    const cols = Math.max(2, Math.round(b.w / 2.6));
    const cw = (x1 - x0) / cols;
    const flH = (fh - 1.5) / b.floors * G.zoom * sn;
    const fy = base - 1.5 * G.zoom * sn - 3 * flH;
    const col = Math.min(cols - 1, 1);
    const wx = x0 + col * cw + cw * 0.24, ww = cw * 0.52;
    const wy = fy + flH * 0.20, wh = flH * 0.52;
    if (ww < 1 || wh < 1) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 0, wx + ww / 2, wy + wh / 2, Math.max(ww, wh) * 4.2);
    g.addColorStop(0, `rgba(255,196,118,${0.34 * night})`);
    g.addColorStop(0.4, `rgba(255,178,102,${0.10 * night})`);
    g.addColorStop(1, 'rgba(255,170,100,0)');
    ctx.fillStyle = g;
    ctx.fillRect(wx + ww / 2 - ww * 4.2, wy + wh / 2 - wh * 4.6, ww * 8.4, wh * 9.2);
    const wg = ctx.createLinearGradient(0, wy, 0, wy + wh);
    wg.addColorStop(0, `rgba(255,214,150,${0.92 * night})`);
    wg.addColorStop(1, `rgba(232,164,88,${0.80 * night})`);
    ctx.fillStyle = wg;
    ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = `rgba(60,34,18,${0.5 * night})`;
    ctx.fillRect(wx + ww * 0.48, wy, Math.max(1, ww * 0.035), wh);
    ctx.fillRect(wx, wy + wh * 0.42, ww, Math.max(1, wh * 0.04));
    ctx.restore();
  }

  /* ---- the character ---- */
  function character(s, alpha) {
    if (s.ch.vis < 0.02) return;
    const day = s.li.day;
    const look = s.ch.look, speed = s.speed;
    let img = A.side;
    if (look > 0.75) img = A.front;
    else if (look > 0.42) img = A.threeQuarter;
    else if (look < 0.06 && speed < 2) img = A.back;
    if (speed > 26) img = A.run;
    else if (speed > 2.5) img = A.walk;
    else if (look > 0.3 && speed < 2) img = A.idle;
    if (!img) return;

    const z = 0.44;
    const hpx = 1.5 * G.zoom;
    const w = hpx * (img.width / img.height);
    const x = G.sx(s.ch.x, z), y = G.gy(z);
    const moving = cl(speed / 18);
    const stride = s.ch.x * 2.1;
    const bob = Math.sin(stride) * hpx * 0.012 * moving + Math.sin(s.t * 90) * hpx * 0.0022 * (1 - moving);
    const tilt = Math.sin(stride) * 0.012 * moving;

    ctx.save(); ctx.globalAlpha = alpha * s.ch.vis;
    // long shadow raked away from the low western sun
    ctx.save();
    ctx.globalAlpha = alpha * s.ch.vis * 0.26 * day;
    ctx.transform(1, 0, -1.6, 1, x + hpx * 0.52, y);
    ctx.fillStyle = '#1A1408';
    ctx.beginPath(); ctx.ellipse(0, -hpx * 0.16, w * 0.30, hpx * 0.17, 0, 0, 6.3); ctx.fill();
    ctx.restore();
    ctx.translate(0, bob); ctx.rotate(tilt);
    sprite(img, x, y, hpx, s.ch.dir < 0, day, 1, day);
    ctx.restore();
  }

  /* ---- painted-set beats: a slow move over real artwork ---- */
  function plate(img, s, alpha, opt) {
    if (!img) return;
    ctx.save(); ctx.globalAlpha = alpha;
    const k = opt.k;
    const zoomK = lerp(opt.z0, opt.z1, k), panX = lerp(opt.x0, opt.x1, k), panY = lerp(opt.y0, opt.y1, k);
    const cover = Math.max(W / img.width, H / img.height) * zoomK;
    const dw = img.width * cover, dh = img.height * cover;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, W * 0.5 - dw * (0.5 + panX), H * 0.5 - dh * (0.5 + panY), dw, dh);
    // grade the plate into the film
    if (opt.warm) { ctx.fillStyle = rgba('#E8A45E', opt.warm); ctx.globalCompositeOperation = 'soft-light'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
    if (opt.dark) { ctx.fillStyle = rgba('#0A0C12', opt.dark); ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }

  function pool(x, y, r, col, a, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(col, a * alpha)); g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill();
  }

  // a camera push, about a point
  function push(cx, cy, z) { ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); }

  function frame(x, y, w, h, col) {
    ctx.fillStyle = mix('#4A3524', col, 0.25);
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = col;
    ctx.fillRect(x + w * 0.09, y + h * 0.09, w * 0.82, h * 0.82);
    ctx.fillStyle = 'rgba(255,236,200,0.10)';
    ctx.fillRect(x, y, w, h * 0.06);
  }

  /* ---- 04 The room · 05 The glance ---- */
  function room(s, alpha) {
    const k = smooth(ease(0.175, 0.262, s.t));
    const gl = ease(0.250, 0.262, s.t) * (1 - ease(0.276, 0.286, s.t));
    const flick = 0.86 + 0.14 * Math.sin(s.t * 900) * Math.sin(s.t * 331);
    ctx.save(); ctx.globalAlpha = alpha;
    push(W * 0.54, H * 0.54, lerp(1.34, 1.06, k));

    const floorY = H * 0.735;
    // wall
    const wg = ctx.createLinearGradient(0, 0, W, floorY);
    wg.addColorStop(0, '#6E5A3E'); wg.addColorStop(0.45, '#8A7050'); wg.addColorStop(1, '#5E4A34');
    ctx.fillStyle = wg; ctx.fillRect(-W, -H, W * 3, floorY + H);
    ctx.fillStyle = 'rgba(38,26,16,0.30)';
    ctx.fillRect(-W, floorY - H * 0.10, W * 3, H * 0.10);
    // floor
    const fg = ctx.createLinearGradient(0, floorY, 0, H * 1.2);
    fg.addColorStop(0, '#6A4E33'); fg.addColorStop(1, '#3A2A1C');
    ctx.fillStyle = fg; ctx.fillRect(-W, floorY, W * 3, H);
    ctx.fillStyle = 'rgba(20,12,8,0.22)';
    ctx.fillRect(-W, floorY, W * 3, H * 0.012);
    // rug
    ctx.fillStyle = '#7A3A34';
    ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.90, W * 0.46, H * 0.14, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(214,170,110,0.16)';
    ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.90, W * 0.36, H * 0.105, 0, 0, 6.3); ctx.fill();

    // balcony door, the warm source
    const dx = W * 0.035, dw = W * 0.175, dy = H * 0.145, dh = H * 0.60;
    ctx.fillStyle = '#4A3520'; ctx.fillRect(dx - W * 0.012, dy - H * 0.02, dw + W * 0.024, dh + H * 0.02);
    const dg = ctx.createLinearGradient(0, dy, 0, dy + dh);
    dg.addColorStop(0, '#FFEBC4'); dg.addColorStop(0.6, '#F3D49C'); dg.addColorStop(1, '#D9AE74');
    ctx.fillStyle = dg; ctx.fillRect(dx, dy, dw, dh);
    ctx.fillStyle = 'rgba(74,53,32,0.85)';
    ctx.fillRect(dx + dw * 0.48, dy, Math.max(1, dw * 0.035), dh);
    for (let i = 1; i < 4; i++) ctx.fillRect(dx, dy + dh * i / 4, dw, Math.max(1, H * 0.004));
    ctx.fillStyle = 'rgba(196,150,96,0.55)';
    ctx.fillRect(dx + dw, dy - H * 0.03, W * 0.055, dh + H * 0.03);
    // light thrown on the floor
    const lp = ctx.createLinearGradient(dx, floorY, dx + W * 0.4, H);
    lp.addColorStop(0, 'rgba(255,224,166,0.30)'); lp.addColorStop(1, 'rgba(255,224,166,0)');
    ctx.fillStyle = lp;
    ctx.beginPath(); ctx.moveTo(dx, floorY); ctx.lineTo(dx + dw, floorY);
    ctx.lineTo(dx + dw + W * 0.30, H); ctx.lineTo(dx - W * 0.05, H); ctx.closePath(); ctx.fill();

    // wall things
    frame(W * 0.315, H * 0.135, W * 0.115, H * 0.155, '#8E7A52');
    frame(W * 0.465, H * 0.175, W * 0.085, H * 0.115, '#6E7A62');
    ctx.fillStyle = '#4E3A26';
    ctx.fillRect(W * 0.615, H * 0.155, W * 0.24, Math.max(2, H * 0.012));
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = ['#9A7A4E', '#7E8A6E', '#8E6A5A', '#A08A62'][i];
      ctx.fillRect(W * (0.635 + i * 0.055), H * 0.115, W * 0.026, H * 0.04);
    }

    // sofa
    ctx.fillStyle = '#4E4030';
    ctx.fillRect(W * 0.215, H * 0.505, W * 0.245, H * 0.155);
    ctx.fillStyle = '#5C4C38';
    ctx.fillRect(W * 0.205, H * 0.605, W * 0.265, H * 0.115);
    ctx.fillStyle = 'rgba(255,226,170,0.10)';
    ctx.fillRect(W * 0.215, H * 0.505, W * 0.245, H * 0.014);
    ctx.fillStyle = '#6A5A44';
    ctx.fillRect(W * 0.195, H * 0.545, W * 0.028, H * 0.175);
    ctx.fillRect(W * 0.452, H * 0.545, W * 0.028, H * 0.175);

    // the mother, in her armchair, behind him and a little soft
    ctx.save();
    ctx.filter = 'blur(' + Math.max(0.5, H * 0.0014).toFixed(1) + 'px)';
    const ax = W * 0.205, ay = H * 0.735;
    ctx.fillStyle = 'rgba(18,10,6,0.30)';
    ctx.beginPath(); ctx.ellipse(ax, ay + H * 0.012, W * 0.10, H * 0.022, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#5A3A32';
    ctx.fillRect(ax - W * 0.085, ay - H * 0.285, W * 0.17, H * 0.285);
    ctx.fillStyle = 'rgba(255,220,170,0.08)';
    ctx.fillRect(ax - W * 0.085, ay - H * 0.285, W * 0.17, H * 0.012);
    ctx.fillStyle = '#6B4740';
    ctx.fillRect(ax - W * 0.112, ay - H * 0.165, W * 0.040, H * 0.165);
    ctx.fillRect(ax + W * 0.072, ay - H * 0.165, W * 0.040, H * 0.165);
    ctx.fillStyle = P.fadedPink;
    ctx.fillRect(ax - W * 0.050, ay - H * 0.238, W * 0.100, H * 0.170);
    ctx.fillStyle = mix(P.fadedPink, '#000000', 0.20);
    ctx.fillRect(ax - W * 0.054, ay - H * 0.085, W * 0.108, H * 0.070);
    ctx.fillStyle = mix(P.fadedPink, '#000000', 0.34);
    ctx.fillRect(ax - W * 0.050, ay - H * 0.238, W * 0.022, H * 0.170);
    const hx = ax + gl * W * 0.016;
    ctx.fillStyle = '#9A6A48';
    ctx.beginPath(); ctx.arc(hx, ay - H * 0.272, H * 0.042, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#1E1512';
    ctx.beginPath(); ctx.arc(hx, ay - H * 0.283, H * 0.044, Math.PI * 0.94, Math.PI * 2.08); ctx.fill();
    ctx.beginPath(); ctx.arc(hx - H * 0.036, ay - H * 0.284, H * 0.022, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(30,21,18,0.85)';
    ctx.beginPath(); ctx.arc(hx + H * 0.010 + gl * H * 0.006, ay - H * 0.274, H * 0.005, 0, 6.3); ctx.fill();
    if (gl > 0.02) {
      ctx.strokeStyle = `rgba(52,30,22,${0.6 * gl})`;
      ctx.lineWidth = Math.max(1, H * 0.0035);
      ctx.beginPath(); ctx.arc(hx + H * 0.014, ay - H * 0.258, H * 0.012, 0.25, Math.PI - 0.25); ctx.stroke();
    }
    ctx.restore();
    pool(ax + W * 0.02, ay - H * 0.33, W * 0.20, '#FFC375', 0.22, alpha);

    // the television, and the boy in front of it
    const tvx = W * 0.665, tvy = H * 0.375, tvw = W * 0.215, tvh = H * 0.185;
    ctx.fillStyle = '#3A2E22';
    ctx.fillRect(tvx - W * 0.02, tvy + tvh, tvw + W * 0.04, H * 0.185);
    ctx.fillStyle = '#4A3B2C';
    ctx.fillRect(tvx - W * 0.02, tvy + tvh, tvw + W * 0.04, H * 0.016);
    ctx.fillStyle = '#2A241E';
    ctx.fillRect(tvx - W * 0.016, tvy - H * 0.016, tvw + W * 0.032, tvh + H * 0.03);
    const sg = ctx.createLinearGradient(0, tvy, 0, tvy + tvh);
    sg.addColorStop(0, mix('#BFE6F6', '#7FC7E8', 0.2)); sg.addColorStop(1, '#4E9EC4');
    ctx.globalAlpha = alpha * flick;
    ctx.fillStyle = sg; ctx.fillRect(tvx, tvy, tvw, tvh);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(tvx, tvy, tvw, tvh * 0.30);
    ctx.fillStyle = 'rgba(46,72,40,0.5)';
    ctx.fillRect(tvx, tvy + tvh * 0.62, tvw, tvh * 0.38);
    ctx.globalAlpha = alpha;
    pool(tvx + tvw * 0.5, tvy + tvh * 0.5, W * 0.34, '#8FD4F0', 0.24 * flick, alpha);

    if (A.back) {
      const hp = H * 0.44, bx = W * 0.485, seatY = H * 0.880;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(18,10,6,0.30)';
      ctx.beginPath(); ctx.ellipse(bx, seatY + hp * 0.085, hp * 0.32, hp * 0.055, 0, 0, 6.3); ctx.fill();
      // clipped at the hips: he is sitting on the floor
      ctx.beginPath(); ctx.rect(0, 0, W, seatY); ctx.clip();
      sprite(A.back, bx, seatY + hp * 0.40, hp, false, 0, 0, 0);
      ctx.restore();
      // folded legs and the cushion under him
      ctx.fillStyle = '#8A5A38';
      ctx.beginPath(); ctx.ellipse(bx, seatY + hp * 0.030, hp * 0.285, hp * 0.072, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(40,24,14,0.35)';
      ctx.beginPath(); ctx.ellipse(bx, seatY + hp * 0.052, hp * 0.285, hp * 0.048, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#2E6B4A';
      ctx.beginPath(); ctx.ellipse(bx, seatY - hp * 0.012, hp * 0.20, hp * 0.052, 0, 0, 6.3); ctx.fill();
      // screen light rimming his shoulders
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha * 0.30 * flick;
      const rl = ctx.createRadialGradient(W * 0.55, H * 0.66, 0, W * 0.55, H * 0.66, hp * 0.60);
      rl.addColorStop(0, 'rgba(150,214,244,0.55)'); rl.addColorStop(1, 'rgba(150,214,244,0)');
      ctx.fillStyle = rl; ctx.fillRect(W * 0.32, H * 0.44, W * 0.42, H * 0.46);
      ctx.restore();
    }

    ctx.restore();
    ctx.save(); ctx.globalAlpha = alpha;
    const v = ctx.createRadialGradient(W * 0.5, H * 0.55, H * 0.26, W * 0.5, H * 0.54, H * 0.92);
    v.addColorStop(0, 'rgba(6,8,14,0)'); v.addColorStop(1, 'rgba(6,8,14,0.66)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ---- 06 Out ---- */
  function hall(s, alpha) {
    const k = smooth(ease(0.285, 0.332, s.t));
    ctx.save(); ctx.globalAlpha = alpha;
    push(W * 0.62, H * 0.55, lerp(1.02, 1.16, k));

    const floorY = H * 0.715;
    const wg = ctx.createLinearGradient(0, 0, W, floorY);
    wg.addColorStop(0, '#7A6446'); wg.addColorStop(0.5, '#8E7452'); wg.addColorStop(1, '#4E3E2C');
    ctx.fillStyle = wg; ctx.fillRect(-W, -H, W * 3, floorY + H);
    const fg = ctx.createLinearGradient(0, floorY, 0, H * 1.15);
    fg.addColorStop(0, '#6A4E33'); fg.addColorStop(1, '#33251A');
    ctx.fillStyle = fg; ctx.fillRect(-W, floorY, W * 3, H);
    ctx.fillStyle = 'rgba(20,12,8,0.24)'; ctx.fillRect(-W, floorY, W * 3, H * 0.012);

    // the doorway out, and the hall beyond it
    const dx = W * 0.60, dw = W * 0.235, dy = H * 0.165, dh = floorY - dy;
    ctx.fillStyle = '#3A2A1A'; ctx.fillRect(dx - W * 0.02, dy - H * 0.022, dw + W * 0.04, dh + H * 0.022);
    const hg = ctx.createLinearGradient(0, dy, 0, floorY);
    hg.addColorStop(0, '#3E3226'); hg.addColorStop(0.55, '#6E5C42'); hg.addColorStop(1, '#241A12');
    ctx.fillStyle = hg; ctx.fillRect(dx, dy, dw, dh);
    ctx.fillStyle = 'rgba(255,214,150,0.22)';
    ctx.fillRect(dx + dw * 0.30, dy + dh * 0.18, dw * 0.42, dh * 0.30);
    // the door itself, swung open against the near wall
    ctx.fillStyle = '#5A3A22';
    ctx.beginPath();
    ctx.moveTo(dx - W * 0.02, dy - H * 0.022); ctx.lineTo(dx - W * 0.115, dy + H * 0.03);
    ctx.lineTo(dx - W * 0.115, floorY + H * 0.03); ctx.lineTo(dx - W * 0.02, floorY);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,224,170,0.10)';
    ctx.fillRect(dx - W * 0.11, dy + H * 0.05, W * 0.085, H * 0.16);
    pool(dx + dw * 0.5, dy + dh * 0.34, W * 0.24, '#FFD79A', 0.26, alpha);
    // light spilling onto the floor from the hall
    const sp = ctx.createLinearGradient(0, floorY, 0, H);
    sp.addColorStop(0, 'rgba(255,220,164,0.24)'); sp.addColorStop(1, 'rgba(255,220,164,0)');
    ctx.fillStyle = sp;
    ctx.beginPath(); ctx.moveTo(dx, floorY); ctx.lineTo(dx + dw, floorY);
    ctx.lineTo(dx + dw + W * 0.12, H); ctx.lineTo(dx - W * 0.14, H); ctx.closePath(); ctx.fill();

    // the sofa he has just left, and the controller on the floor
    ctx.fillStyle = '#4E4030'; ctx.fillRect(-W * 0.06, H * 0.475, W * 0.30, H * 0.16);
    ctx.fillStyle = '#5C4C38'; ctx.fillRect(-W * 0.07, H * 0.58, W * 0.32, H * 0.125);
    ctx.fillStyle = '#2E2A26';
    ctx.beginPath(); ctx.ellipse(W * 0.30, H * 0.845, W * 0.028, H * 0.014, 0.2, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(18,10,6,0.30)';
    ctx.beginPath(); ctx.ellipse(W * 0.305, H * 0.858, W * 0.034, H * 0.010, 0, 0, 6.3); ctx.fill();

    // him, crossing to the door
    const img = k > 0.06 ? (A.walk || A.side) : (A.side || A.walk);
    if (img) {
      const hp = H * 0.40;
      const gone = 1 - ease(0.328, 0.350, s.t);
      const bx = W * lerp(0.315, 0.575, smooth(k));
      const by = H * lerp(0.905, 0.845, k);
      const bob = Math.sin(k * 26) * hp * 0.012 * (k > 0.06 ? 1 : 0);
      ctx.save();
      ctx.globalAlpha = alpha * gone;
      ctx.fillStyle = 'rgba(18,10,6,0.32)';
      ctx.beginPath(); ctx.ellipse(bx, by, hp * 0.26, hp * 0.035, 0, 0, 6.3); ctx.fill();
      sprite(img, bx, by + bob, hp * lerp(1, 0.92, k), false, 0.35, 0, 1);
      ctx.restore();
    }

    ctx.restore();
    ctx.save(); ctx.globalAlpha = alpha;
    const v = ctx.createRadialGradient(W * 0.6, H * 0.5, H * 0.24, W * 0.6, H * 0.5, H * 0.9);
    v.addColorStop(0, 'rgba(6,8,14,0)'); v.addColorStop(1, 'rgba(6,8,14,0.62)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ---- 07 The stairwell: three landings, descending with him ---- */
  function stair(s, alpha) {
    const k = ease(0.330, 0.400, s.t);
    ctx.save(); ctx.globalAlpha = alpha;
    const FH = H * 0.68;                       // one flight
    const off = k * FH * 3;

    ctx.fillStyle = '#3A3A30'; ctx.fillRect(0, 0, W, H);
    let boyPos = null;

    for (let i = -1; i <= 3; i++) {
      const y0 = i * FH - off + H * 0.06;
      if (y0 > H + FH || y0 < -FH * 1.4) continue;
      const flip = (((i % 2) + 2) % 2) === 1;
      ctx.save();
      if (flip) { ctx.translate(W, 0); ctx.scale(-1, 1); }

      // wall: cream above, green wainscot below
      const wgg = ctx.createLinearGradient(0, y0 - FH * 0.1, W, y0 + FH);
      wgg.addColorStop(0, '#B8AE94'); wgg.addColorStop(0.5, '#9E9880'); wgg.addColorStop(1, '#6E6A58');
      ctx.fillStyle = wgg; ctx.fillRect(0, y0 - FH * 0.12, W, FH * 1.16);
      ctx.fillStyle = '#4C6250';
      ctx.fillRect(0, y0 + FH * 0.40, W, FH * 0.64);
      ctx.fillStyle = 'rgba(255,240,208,0.16)';
      ctx.fillRect(0, y0 + FH * 0.40, W, Math.max(1, H * 0.004));

      // window on the half-landing, throwing light across
      const wx = W * 0.055, wy = y0 + FH * 0.10, ww = W * 0.155, wh = FH * 0.26;
      ctx.fillStyle = '#4A4438'; ctx.fillRect(wx - W * 0.012, wy - FH * 0.02, ww + W * 0.024, wh + FH * 0.04);
      const wgr = ctx.createLinearGradient(0, wy, 0, wy + wh);
      wgr.addColorStop(0, '#FFF0CE'); wgr.addColorStop(1, '#E6C48E');
      ctx.fillStyle = wgr; ctx.fillRect(wx, wy, ww, wh);
      ctx.fillStyle = 'rgba(74,68,56,0.8)';
      ctx.fillRect(wx + ww * 0.47, wy, Math.max(1, ww * 0.05), wh);
      ctx.fillRect(wx, wy + wh * 0.46, ww, Math.max(1, wh * 0.06));
      const beam = ctx.createLinearGradient(wx, wy, wx + W * 0.55, wy + FH * 0.62);
      beam.addColorStop(0, 'rgba(255,232,178,0.30)'); beam.addColorStop(1, 'rgba(255,232,178,0)');
      ctx.fillStyle = beam;
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + ww, wy);
      ctx.lineTo(wx + ww + W * 0.42, wy + FH * 0.66); ctx.lineTo(wx + W * 0.10, wy + FH * 0.70);
      ctx.closePath(); ctx.fill();

      // the flight: terrazzo treads stepping down to the right
      const sx0 = W * 0.20, sy0 = y0 + FH * 0.44, steps = 9;
      const sw = W * 0.075, sh = FH * 0.052;
      for (let n = 0; n < steps; n++) {
        const tx = sx0 + n * sw * 0.78, ty = sy0 + n * sh;
        ctx.fillStyle = '#8C8272';
        ctx.fillRect(tx, ty, W - tx, sh * 0.55);
        ctx.fillStyle = '#B6AC98';
        ctx.fillRect(tx, ty, W - tx, Math.max(1.5, sh * 0.22));
        ctx.fillStyle = 'rgba(30,26,20,0.30)';
        ctx.fillRect(tx, ty + sh * 0.55, W - tx, sh * 0.45);
      }
      // landing slab
      const ly = sy0 + steps * sh;
      ctx.fillStyle = '#9A9080'; ctx.fillRect(0, ly, W, FH * 0.09);
      ctx.fillStyle = '#BEB4A0'; ctx.fillRect(0, ly, W, Math.max(1.5, FH * 0.014));
      ctx.fillStyle = 'rgba(28,24,18,0.34)'; ctx.fillRect(0, ly + FH * 0.09, W, FH * 0.05);

      // iron balustrade following the run
      ctx.strokeStyle = 'rgba(32,32,30,0.78)';
      ctx.lineWidth = Math.max(1, W * 0.0032);
      for (let n = 0; n <= steps; n += 1) {
        const tx = sx0 + n * sw * 0.78, ty = sy0 + n * sh;
        ctx.beginPath(); ctx.moveTo(tx + sw * 0.1, ty); ctx.lineTo(tx + sw * 0.1, ty - FH * 0.135); ctx.stroke();
      }
      ctx.lineWidth = Math.max(1.5, W * 0.006);
      ctx.beginPath();
      ctx.moveTo(sx0 + sw * 0.1, sy0 - FH * 0.135);
      ctx.lineTo(sx0 + steps * sw * 0.78 + sw * 0.1, sy0 + steps * sh - FH * 0.135);
      ctx.stroke();
      // which tread is at his eyeline? that is where he is
      const nn = cl((H * 0.44 - sy0) / sh, 0, steps);
      const tx = sx0 + nn * sw * 0.78, ty = sy0 + nn * sh;
      const dist = Math.abs(ty - H * 0.44);
      if (!boyPos || dist < boyPos.d) {
        boyPos = { x: flip ? W - (tx + sw * 0.45) : tx + sw * 0.45, y: ty + sh * 0.16, flip, d: dist };
      }
      ctx.restore();
    }

    // him, on the stairs
    const img = A.walk || A.side;
    if (img && boyPos) {
      const hp = H * 0.28;
      const fadeIn = ease(0.334, 0.358, s.t);
      const bob = Math.sin(k * 190) * hp * 0.012;
      ctx.save();
      ctx.globalAlpha = alpha * fadeIn;
      ctx.fillStyle = 'rgba(16,14,10,0.34)';
      ctx.beginPath(); ctx.ellipse(boyPos.x, boyPos.y, hp * 0.22, hp * 0.028, 0, 0, 6.3); ctx.fill();
      sprite(img, boyPos.x, boyPos.y + bob, hp, boyPos.flip, 0.18, 0, 1);
      ctx.restore();
    }

    ctx.save(); ctx.globalAlpha = alpha;
    const v = ctx.createRadialGradient(W * 0.46, H * 0.48, H * 0.20, W * 0.5, H * 0.5, H * 0.86);
    v.addColorStop(0, 'rgba(4,6,10,0)'); v.addColorStop(1, 'rgba(4,6,10,0.72)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    ctx.restore();
  }

  /* ---- 13/14 the reveal ----
     The distance is the painted plate, held far away and hazed.
     Everything near — terrace, parapet, boy — is drawn crisp on top of it.
     The parapet descends through frame and uncovers the view. */
  function reveal(s, alpha) {
    const day = s.li.day, ev = s.li.evening;
    const k = smooth(ease(0.760, 0.848, s.t));
    ctx.save(); ctx.globalAlpha = alpha;

    const par = H * lerp(0.545, 0.855, k);
    const warm = mix('#F6E6C4', '#F2C795', ev);

    const g = ctx.createLinearGradient(0, 0, 0, H * 0.72);
    const skyStops = [[0, mix('#4F7EA6', '#375780', ev)], [0.40, mix('#9CBCCE', '#8B90AC', ev)], [0.76, mix('#E2CEAC', '#E6B285', ev)], [1, warm]];
    for (const [p2, c2] of skyStops) g.addColorStop(p2, c2);
    const skyAt = (f) => {
      f = cl(f);
      for (let i = 1; i < skyStops.length; i++) {
        if (f <= skyStops[i][0]) return mix(skyStops[i - 1][1], skyStops[i][1], inv(skyStops[i - 1][0], skyStops[i][0], f));
      }
      return warm;
    };
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const sunX = W * 0.775, sunY = H * 0.17;
    const gl = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.46);
    gl.addColorStop(0, 'rgba(255,240,206,0.58)');
    gl.addColorStop(0.32, 'rgba(255,216,162,0.18)');
    gl.addColorStop(1, 'rgba(255,202,152,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H * 0.6);

    // the city, the Atlantic, and off-centre the Hassan II mosque
    if (A.seaview) {
      const img = A.seaview;
      const sc2 = (W * 1.08) / img.width;
      const dw = img.width * sc2, dh = img.height * sc2;
      const plateBottom = H * 0.88;
      const py = plateBottom - dh;
      ctx.save();
      ctx.globalAlpha = alpha * lerp(0.12, 1, ease(0.760, 0.806, s.t));
      ctx.filter = 'blur(0.7px)';
      ctx.drawImage(img, W * 0.5 - dw * 0.52, py, dw, dh);
      ctx.filter = 'none';
      // aerial perspective: the far half sinks into the light
      const hz = ctx.createLinearGradient(0, py, 0, py + dh * 0.72);
      hz.addColorStop(0, rgba(warm, 0.62));
      hz.addColorStop(0.42, rgba(warm, 0.28));
      hz.addColorStop(1, rgba(warm, 0.06));
      ctx.fillStyle = hz; ctx.fillRect(0, py, W, dh * 0.72);
      // and blends into the sky at its top edge
      const seam = skyAt(py / (H * 0.72));
      const fade = ctx.createLinearGradient(0, py - H * 0.014, 0, py + H * 0.085);
      fade.addColorStop(0, seam); fade.addColorStop(0.35, rgba(seam, 0.55)); fade.addColorStop(1, rgba(seam, 0));
      ctx.fillStyle = fade; ctx.fillRect(0, py - H * 0.014, W, H * 0.10);
      // sun path on the water
      const wl = py + dh * 0.42;
      const gs = ctx.createRadialGradient(sunX, wl, 0, sunX, wl, W * 0.30);
      gs.addColorStop(0, 'rgba(255,238,200,0.34)');
      gs.addColorStop(0.45, 'rgba(255,232,190,0.12)');
      gs.addColorStop(1, 'rgba(255,232,190,0)');
      ctx.fillStyle = gs;
      ctx.beginPath(); ctx.ellipse(sunX, wl, W * 0.30, dh * 0.22, 0, 0, 6.3); ctx.fill();
      ctx.restore();
    }

    // him, planted on the terrace, small against all of it
    const hpx = H * 0.185;
    if (A.back) sprite(A.back, W * 0.335, par + H * 0.012, hpx, false, 0.85, 1, day);

    // the terrace, and its parapet lip
    const tg = ctx.createLinearGradient(0, par, 0, H);
    tg.addColorStop(0, mix('#EFE0C2', '#E4C295', 0.45));
    tg.addColorStop(0.20, mix('#D6C4A2', '#C2A57F', 0.5));
    tg.addColorStop(1, mix('#A08D6E', '#665640', 0.42));
    ctx.fillStyle = tg; ctx.fillRect(0, par, W, H - par);
    ctx.fillStyle = rgba('#FFF6E0', 0.70);
    ctx.fillRect(0, par, W, Math.max(1.5, H * 0.010));
    ctx.fillStyle = rgba('#6E5C42', 0.24);
    ctx.fillRect(0, par + H * 0.010, W, H * 0.014);
    // a second lip nearer camera, so the terrace has depth
    const par2 = par + H * 0.16;
    if (par2 < H) {
      ctx.fillStyle = rgba('#4A3E2C', 0.10);
      ctx.fillRect(0, par2, W, H - par2);
      ctx.fillStyle = rgba('#FFF2D8', 0.18);
      ctx.fillRect(0, par2, W, Math.max(1, H * 0.004));
    }
    ctx.restore();
    return;
  }

  function bedroom(s, alpha) {
    const k = ease(0.940, 1.0, s.t);
    // the same room chapter two opens in — drawn, not a photograph
    ch2.machineAt(0.030 * inv(0.940, 1.0, s.t), alpha);
    ctx.save(); ctx.globalAlpha = alpha;
    const scr = ease(0.982, 1.0, s.t);
    pool(W * (0.62 + 0.02 * k), H * (0.44 - 0.04 * k), W * (0.16 + 0.34 * scr), '#8FD0F0', 0.26 + 0.34 * scr, 1);
    const v = ctx.createRadialGradient(W * 0.54, H * 0.44, H * 0.16, W * 0.54, H * 0.44, H * 0.82);
    v.addColorStop(0, 'rgba(4,6,12,0)'); v.addColorStop(1, `rgba(4,6,12,${0.30 + 0.34 * scr})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    // the rectangle of light is owned by the seam now, not by this beat
    ctx.restore();
  }

  // The monitor's light swells across the chapter join and then recedes into
  // the room — one continuous move, no cut, no blowout.
  function seamLight(t, alpha) {
    const e = cl(ease(CH1 * 0.982, CH1 - 0.002, t) * (1 - ease(CH1 + 0.003, CH1 + 0.034, t)));
    if (e < 0.004) return;
    const rw = W * lerp(0.30, 0.62, e), rh = rw * 0.66;
    const cx = W * lerp(0.535, 0.512, e), cy = H * lerp(0.445, 0.462, e);
    ctx.save(); ctx.globalAlpha = alpha;
    const gl = ctx.createRadialGradient(cx, cy, rw * 0.16, cx, cy, rw * 1.15);
    gl.addColorStop(0, `rgba(150,204,238,${0.20 * e})`);
    gl.addColorStop(1, 'rgba(130,186,226,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.filter = 'blur(' + Math.max(1, H * 0.014).toFixed(1) + 'px)';
    const rg2 = ctx.createLinearGradient(0, cy - rh / 2, 0, cy + rh / 2);
    rg2.addColorStop(0, `rgba(190,226,246,${0.26 * e})`);
    rg2.addColorStop(1, `rgba(126,184,222,${0.22 * e})`);
    ctx.fillStyle = rg2;
    ctx.fillRect(cx - rw / 2, cy - rh / 2, rw, rh);
    ctx.restore();
    ctx.restore();
  }

  /* ---- grade ---- */
  function grade(s, cfg) {
    const day = s.li.day, ev = s.li.evening;
    // bloom
    if (cfg.bloom > 0.01) {
      bctx.clearRect(0, 0, 320, 180);
      bctx.filter = 'blur(5px)';
      bctx.drawImage(canvas, 0, 0, 320, 180);
      bctx.filter = 'none';
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = cfg.bloom * (0.16 + 0.14 * day);
      ctx.drawImage(bloomC, 0, 0, W, H);
      ctx.restore();
    }
    // warm/cool split-tone
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const g = ctx.createLinearGradient(W, 0, 0, H);
    g.addColorStop(0, rgba('#FFC98A', 0.40 * (0.4 + day * 0.6)));
    g.addColorStop(1, rgba('#3E5C90', 0.44));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // deepen the shadow side so the frame has a real value range
    const gk = s.ch === 2 ? 0.42 : 1;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const m = ctx.createLinearGradient(W, H * 0.1, W * 0.05, H);
    m.addColorStop(0, 'rgba(255,250,242,1)');
    m.addColorStop(0.55, `rgba(226,214,200,${1})`);
    m.addColorStop(1, 'rgba(158,146,140,1)');
    ctx.fillStyle = m; ctx.globalAlpha = 0.55 * (0.35 + 0.65 * day) * gk;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // vignette
    const v = ctx.createRadialGradient(W * 0.5, H * 0.48, H * 0.34, W * 0.5, H * 0.5, H * 0.95);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(8,6,10,${(0.34 + 0.2 * (1 - day)) * gk})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    // grain
    if (cfg.grain > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = cfg.grain * 0.28;
      const ox = (Math.random() * 180) | 0, oy = (Math.random() * 180) | 0;
      const step = 180;
      for (let x = -ox; x < W; x += step) for (let y = -oy; y < H; y += step) ctx.drawImage(grainC, x, y, step, step);
      ctx.restore();
    }
    // letterbox breathing: subtle, only on the two held beats
    const still = s.ch === 2 ? 0 : Math.max(ease(0.845, 0.862, s.t) * (1 - ease(0.874, 0.884, s.t)), 0);
    if (still > 0.01) {
      ctx.fillStyle = `rgba(4,4,6,${still})`;
      ctx.fillRect(0, 0, W, H * 0.055 * still); ctx.fillRect(0, H - H * 0.055 * still, W, H * 0.055 * still);
    }
  }

  function render(t, cfg) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#07080C'; ctx.fillRect(0, 0, W, H);
    // the chapter join is a weighted crossfade like every other boundary
    const seam = cl((t - (CH1 - 0.015)) / 0.030);
    let s = null;
    if (seam < 0.999) {
      const m = 1 - seam;
      s = sample(cl(t / CH1));
      G = geom(s);
      const w = s.w;
      if (w.street * m > 0.004) street(s, w.street * m);
      if (w.reveal * m > 0.004) reveal(s, w.reveal * m);
      if (w.room * m > 0.004) room(s, w.room * m);
      if (w.hall * m > 0.004) hall(s, w.hall * m);
      if (w.stair * m > 0.004) stair(s, w.stair * m);
      if (w.bedroom * m > 0.004) bedroom(s, w.bedroom * m);
    }
    if (seam > 0.001) {
      const t2 = cl((t - CH1) / (1 - CH1));
      const li2 = ch2.light(t2);
      const s2 = { t: t2, li: li2, ch: 2 };
      G = geom({ cam: track(CAM, 0.985), li: li2 });
      ch2.render(t2, seam);
      if (!s || seam >= 0.5) s = s2;
    }
    seamLight(t, 1);
    grade(s, cfg);
    const mi = masterBeat(t);
    s.master = t; s.index = mi; s.beat = ALL_BEATS[mi]; s.total = ALL_BEATS.length;
    return s;
  }

  return { setSize, render };
}
