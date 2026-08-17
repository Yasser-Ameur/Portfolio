"use client";

/**
 * The living room, authored for the camera's actual projection.
 *
 * THE PROJECTION METHOD — use this for every environment from here on.
 *
 * The earlier mistake was painting a *perspective view* of a room into one
 * billboard. Its painted floor receded at one angle while the world's ground
 * plane receded at another, and no amount of grading hides that.
 *
 * The fix is to never paint perspective at all:
 *
 *   • FLOOR textures are painted **top-down** (plan view) and applied to a
 *     horizontal plane. The camera foreshortens them correctly, for free.
 *   • WALL textures are painted as **flat elevation** and applied to a vertical
 *     plane. Same deal.
 *   • OBJECTS are painted as flat elevations on upright quads.
 *
 * Every surface is axis-aligned in world space, so one camera governs
 * everything and there is no seam between "painted" and "real".
 *
 * No baked vignettes anywhere in here — the global grade owns vignetting.
 * Local light and shadow are painted; global falloff is not.
 */

import * as THREE from "three";

const rng = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};

function canvas(w: number, h: number) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  return { cv, ctx: cv.getContext("2d")! };
}

function tex(cv: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.anisotropy = 8;
  return t;
}

function grainPass(ctx: CanvasRenderingContext2D, w: number, h: number, n: number, seed: number, a = 0.05) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = r() > 0.5 ? `rgba(255,244,224,${a})` : `rgba(58,44,30,${a})`;
    const s = 1 + r() * 3;
    ctx.fillRect(r() * w, r() * h, s, s);
  }
}

// ---------------------------------------------------------------------------
// FLOOR — painted top-down, laid on a horizontal plane
// ---------------------------------------------------------------------------

/** Room is 7 m wide × 5 m deep. Painted in plan; the camera does the rest. */
export const ROOM_W = 7;
export const ROOM_D = 5;
export const ROOM_H = 3;

export function paintFloorPlan(): THREE.CanvasTexture {
  const W = 1400;
  const H = 1000;
  const { cv, ctx } = canvas(W, H);
  const r = rng(404);

  // tiled floor, seen from directly above
  ctx.fillStyle = "#6d5237";
  ctx.fillRect(0, 0, W, H);
  const tile = 92;
  for (let y = 0; y < H; y += tile) {
    for (let x = 0; x < W; x += tile) {
      const v = r();
      ctx.fillStyle = v > 0.5 ? "#75593c" : "#6a4f35";
      ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
      ctx.fillStyle = `rgba(255,238,208,${0.03 + r() * 0.05})`;
      ctx.fillRect(x + 2, y + 2, tile - 4, 5);
    }
  }

  // the rug, in plan — it will recede correctly because the plane is horizontal
  const rx = W * 0.2;
  const ry = H * 0.28;
  const rw = W * 0.6;
  const rh = H * 0.5;
  ctx.fillStyle = "#8a4038";
  ctx.fillRect(rx, ry, rw, rh);
  ctx.fillStyle = "#7a3730";
  ctx.fillRect(rx + 16, ry + 16, rw - 32, rh - 32);
  ctx.strokeStyle = "rgba(230,200,156,0.4)";
  ctx.lineWidth = 5;
  ctx.strokeRect(rx + 30, ry + 30, rw - 60, rh - 60);
  // a simple repeating motif
  ctx.fillStyle = "rgba(232,204,160,0.32)";
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 4; j++) {
      const cx = rx + 70 + i * ((rw - 140) / 6);
      const cy = ry + 70 + j * ((rh - 140) / 3);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx + 16, cy);
      ctx.lineTo(cx, cy + 16);
      ctx.lineTo(cx - 16, cy);
      ctx.fill();
    }
  }
  // worn nap toward the middle
  const wear = ctx.createRadialGradient(W / 2, H * 0.55, 20, W / 2, H * 0.55, 320);
  wear.addColorStop(0, "rgba(160,110,86,0.22)");
  wear.addColorStop(1, "rgba(160,110,86,0)");
  ctx.fillStyle = wear;
  ctx.fillRect(0, 0, W, H);

  // ---- painted LIGHT, in plan ----
  // the CRT pool, spilling from the wall side toward the middle of the room
  const crt = ctx.createRadialGradient(W * 0.34, H * 0.3, 20, W * 0.34, H * 0.3, 520);
  crt.addColorStop(0, "rgba(126,214,232,0.4)");
  crt.addColorStop(0.5, "rgba(96,178,200,0.13)");
  crt.addColorStop(1, "rgba(96,178,200,0)");
  ctx.fillStyle = crt;
  ctx.fillRect(0, 0, W, H);
  // her lamp pool, warm, on the other side — the two never overlap
  const lamp = ctx.createRadialGradient(W * 0.79, H * 0.4, 20, W * 0.79, H * 0.4, 430);
  lamp.addColorStop(0, "rgba(255,206,142,0.4)");
  lamp.addColorStop(1, "rgba(255,206,142,0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, W, H);

  grainPass(ctx, W, H, 2600, 71, 0.04);
  return tex(cv);
}

// ---------------------------------------------------------------------------
// WALL — painted as flat elevation, stood upright
// ---------------------------------------------------------------------------

export function paintRoomWall(): THREE.CanvasTexture {
  const W = 1400;
  const H = 600;
  const { cv, ctx } = canvas(W, H);
  const r = rng(808);

  // plaster, warmer near the lamp side, cooler near the CRT side
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "#5e5145");
  g.addColorStop(0.35, "#6b5a4a");
  g.addColorStop(0.78, "#7a6450");
  g.addColorStop(1, "#6a5745");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // ceiling darkening — real, from a room with one lamp
  const top = ctx.createLinearGradient(0, 0, 0, H * 0.34);
  top.addColorStop(0, "rgba(28,22,16,0.42)");
  top.addColorStop(1, "rgba(28,22,16,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H * 0.34);

  // skirting
  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(0, H - 34, W, 34);
  ctx.fillStyle = "rgba(255,236,200,0.1)";
  ctx.fillRect(0, H - 34, W, 4);

  // balcony door, evening light behind
  ctx.fillStyle = "#2a2018";
  ctx.fillRect(W * 0.03, H * 0.14, W * 0.15, H * 0.72);
  const dl = ctx.createLinearGradient(0, H * 0.14, 0, H * 0.86);
  dl.addColorStop(0, "#e0bb85");
  dl.addColorStop(1, "#93795a");
  ctx.fillStyle = dl;
  ctx.fillRect(W * 0.04, H * 0.16, W * 0.13, H * 0.68);
  ctx.fillStyle = "#2a2018";
  ctx.fillRect(W * 0.103, H * 0.16, 7, H * 0.68);

  // framed photographs, with real drop shadows
  for (let i = 0; i < 4; i++) {
    const x = W * (0.24 + i * 0.055);
    const y = H * (0.18 + (i % 2) * 0.08);
    const w = 54;
    const h = 68;
    ctx.fillStyle = "rgba(20,14,8,0.35)";
    ctx.fillRect(x + 5, y + 6, w, h);
    ctx.fillStyle = "#3d2c1f";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#8f7458";
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
    ctx.fillStyle = "rgba(255,240,210,0.14)";
    ctx.fillRect(x, y, w, 3);
  }

  // shelf with small objects, with a cast shadow beneath
  const sy = H * 0.34;
  ctx.fillStyle = "rgba(20,14,8,0.3)";
  ctx.fillRect(W * 0.6, sy + 14, W * 0.3, 12);
  ctx.fillStyle = "#54402e";
  ctx.fillRect(W * 0.6, sy, W * 0.3, 13);
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = ["#a4834f", "#7d8d6d", "#8d5c4b", "#a8977a"][i % 4];
    const h = 20 + r() * 26;
    ctx.fillRect(W * 0.615 + i * 40, sy - h, 21, h);
    ctx.fillStyle = "rgba(255,232,190,0.16)";
    ctx.fillRect(W * 0.615 + i * 40, sy - h, 21, 3);
  }

  grainPass(ctx, W, H, 2400, 33, 0.045);
  return tex(cv);
}

// ---------------------------------------------------------------------------
// Objects — flat elevations on upright quads
// ---------------------------------------------------------------------------

/** The television. Its own emissive face; the spill is painted into floor/wall. */
export function paintTV(): THREE.CanvasTexture {
  const W = 420;
  const H = 340;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  // cabinet
  ctx.fillStyle = "#3a342c";
  ctx.fillRect(20, 10, W - 40, H - 90);
  ctx.fillStyle = "#4a4238";
  ctx.fillRect(20, 10, W - 40, 10);
  // screen recess
  ctx.fillStyle = "#12161a";
  ctx.fillRect(38, 26, W - 76, H - 128);
  const s = ctx.createLinearGradient(38, 26, W - 38, H - 102);
  s.addColorStop(0, "#84dcef");
  s.addColorStop(0.45, "#43a67e");
  s.addColorStop(1, "#2b6a55");
  ctx.fillStyle = s;
  ctx.fillRect(46, 34, W - 92, H - 144);
  // a football match on it
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillRect(120, 140, 16, 22);
  ctx.fillRect(220, 128, 15, 24);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(46, 108, W - 92, 3);
  // scanlines
  ctx.fillStyle = "rgba(0,0,0,0.09)";
  for (let y = 34; y < H - 110; y += 5) ctx.fillRect(46, y, W - 92, 2);
  // glass curvature highlight
  const gl = ctx.createLinearGradient(46, 34, 200, 180);
  gl.addColorStop(0, "rgba(255,255,255,0.2)");
  gl.addColorStop(0.5, "rgba(255,255,255,0)");
  ctx.fillStyle = gl;
  ctx.fillRect(46, 34, W - 92, H - 144);
  // wooden unit
  ctx.fillStyle = "#5c4028";
  ctx.fillRect(6, H - 78, W - 12, 34);
  ctx.fillStyle = "#6b4c30";
  ctx.fillRect(6, H - 78, W - 12, 6);
  ctx.fillStyle = "rgba(16,10,6,0.4)";
  ctx.fillRect(10, H - 44, W - 20, 12);
  return tex(cv);
}

/** Armchair and standard lamp — her corner. */
export function paintArmchairLamp(): THREE.CanvasTexture {
  const W = 460;
  const H = 620;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);

  // lamp
  ctx.fillStyle = "#3a2c20";
  ctx.fillRect(W - 62, 150, 9, H - 250);
  ctx.fillStyle = "#33281e";
  ctx.beginPath();
  ctx.ellipse(W - 57, H - 96, 34, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  const shade = ctx.createLinearGradient(W - 110, 70, W - 10, 150);
  shade.addColorStop(0, "#f3d3a0");
  shade.addColorStop(1, "#c8a374");
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.moveTo(W - 108, 152);
  ctx.lineTo(W - 8, 152);
  ctx.lineTo(W - 22, 76);
  ctx.lineTo(W - 92, 76);
  ctx.fill();
  ctx.fillStyle = "rgba(255,222,168,0.55)";
  ctx.fillRect(W - 106, 146, 98, 8);

  // armchair, with volume: back, seat, two arms, cast shadow
  ctx.fillStyle = "rgba(18,12,8,0.34)";
  ctx.beginPath();
  ctx.ellipse(200, H - 40, 168, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  const back = ctx.createLinearGradient(60, 180, 330, 420);
  back.addColorStop(0, "#8a6148");
  back.addColorStop(0.55, "#74503a");
  back.addColorStop(1, "#5b3d2c");
  ctx.fillStyle = back;
  ctx.beginPath();
  ctx.moveTo(70, 420);
  ctx.lineTo(78, 210);
  ctx.quadraticCurveTo(200, 172, 322, 210);
  ctx.lineTo(330, 420);
  ctx.fill();
  // seat cushion
  ctx.fillStyle = "#7d5740";
  ctx.beginPath();
  ctx.moveTo(60, 430);
  ctx.quadraticCurveTo(200, 404, 340, 430);
  ctx.lineTo(346, 500);
  ctx.quadraticCurveTo(200, 480, 54, 500);
  ctx.fill();
  // arms
  ctx.fillStyle = "#6b4a36";
  ctx.beginPath();
  ctx.ellipse(60, 462, 34, 66, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(342, 462, 34, 66, 0, 0, Math.PI * 2);
  ctx.fill();
  // skirt
  ctx.fillStyle = "#553827";
  ctx.fillRect(58, 496, 290, 92);
  // lamp light catching the top-right of the chair
  const lit = ctx.createLinearGradient(330, 180, 180, 460);
  lit.addColorStop(0, "rgba(255,214,156,0.34)");
  lit.addColorStop(1, "rgba(255,214,156,0)");
  ctx.fillStyle = lit;
  ctx.fillRect(0, 150, W, 460);
  return tex(cv);
}

// ---------------------------------------------------------------------------
// The mother — a hero character, not decoration
// ---------------------------------------------------------------------------

/**
 * Seated, in a warm robe, lit from her right by the standard lamp.
 * `looking` is the whole performance: she turns her head and a small,
 * genuine smile appears. Nothing else moves.
 */
export function paintMother(looking: boolean): THREE.CanvasTexture {
  const W = 460;
  const H = 760;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  const cx = W * 0.5;

  const KEY = "rgba(255,214,158,";
  const skin = "#d9a077";
  const skinLit = "#efc196";
  const skinShade = "#a9744f";

  // ---- cast shadow on the floor ----
  ctx.fillStyle = "rgba(20,12,6,0.32)";
  ctx.beginPath();
  ctx.ellipse(cx - 6, H - 26, 132, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- legs, folded to the side on the chair ----
  ctx.fillStyle = "#7c3b52";
  ctx.beginPath();
  ctx.moveTo(cx - 78, H - 246);
  ctx.quadraticCurveTo(cx - 30, H - 150, cx + 96, H - 128);
  ctx.lineTo(cx + 96, H - 62);
  ctx.quadraticCurveTo(cx - 40, H - 84, cx - 96, H - 190);
  ctx.fill();
  // knee highlight
  ctx.fillStyle = "rgba(255,196,150,0.16)";
  ctx.beginPath();
  ctx.ellipse(cx + 40, H - 132, 56, 22, -0.16, 0, Math.PI * 2);
  ctx.fill();

  // ---- torso: real volume, lit from the right ----
  const robe = ctx.createLinearGradient(cx - 110, 260, cx + 120, 470);
  robe.addColorStop(0, "#8e4460");
  robe.addColorStop(0.5, "#a85570");
  robe.addColorStop(1, "#c76d84");
  ctx.fillStyle = robe;
  ctx.beginPath();
  ctx.moveTo(cx - 92, H - 236);
  ctx.quadraticCurveTo(cx - 104, 350, cx - 64, 286);
  ctx.quadraticCurveTo(cx, 258, cx + 62, 288);
  ctx.quadraticCurveTo(cx + 104, 352, cx + 96, H - 232);
  ctx.fill();

  // clothing folds — a few, following the body
  ctx.strokeStyle = "rgba(96,40,58,0.42)";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  for (const [x0, y0, x1, y1] of [
    [cx - 52, 356, cx - 34, 470],
    [cx - 8, 344, cx + 4, 486],
    [cx + 44, 360, cx + 52, 452],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2 + 10, (y0 + y1) / 2, x1, y1);
    ctx.stroke();
  }
  // rim of lamp light down her right edge
  ctx.strokeStyle = `${KEY}0.5)`;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(cx + 62, 292);
  ctx.quadraticCurveTo(cx + 104, 352, cx + 96, H - 240);
  ctx.stroke();

  // ---- arms: near one resting on the chair arm ----
  ctx.strokeStyle = "#a85570";
  ctx.lineWidth = 42;
  ctx.beginPath();
  ctx.moveTo(cx + 62, 330);
  ctx.quadraticCurveTo(cx + 104, 400, cx + 84, 470);
  ctx.stroke();
  ctx.strokeStyle = "#8e4460";
  ctx.lineWidth = 40;
  ctx.beginPath();
  ctx.moveTo(cx - 62, 332);
  ctx.quadraticCurveTo(cx - 96, 402, cx - 58, 456);
  ctx.stroke();
  // hands
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(cx + 80, 486, 20, 16, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - 52, 470, 19, 15, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // ---- neck ----
  ctx.fillStyle = skinShade;
  ctx.fillRect(cx - 22, 246, 44, 52);

  // ---- head ----
  const hx = cx + (looking ? -16 : 6);
  const hy = 196;
  // hair volume behind
  ctx.fillStyle = "#1d1512";
  ctx.beginPath();
  ctx.ellipse(hx + 4, hy - 6, 66, 72, 0, 0, Math.PI * 2);
  ctx.fill();
  // face
  const face = ctx.createLinearGradient(hx - 46, hy - 50, hx + 50, hy + 50);
  face.addColorStop(0, skinShade);
  face.addColorStop(0.45, skin);
  face.addColorStop(1, skinLit);
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(hx, hy, 46, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  // jaw/chin
  ctx.beginPath();
  ctx.ellipse(hx + 2, hy + 30, 34, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  // hair over the crown, with a parting
  ctx.fillStyle = "#241a16";
  ctx.beginPath();
  ctx.ellipse(hx + 2, hy - 34, 50, 34, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx - 44, hy + 4, 20, 42, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + 48, hy + 2, 18, 40, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // hair sheen from the lamp
  ctx.fillStyle = "rgba(214,166,120,0.28)";
  ctx.beginPath();
  ctx.ellipse(hx + 24, hy - 44, 22, 10, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // brow, eye, nose, mouth — small, structured
  ctx.strokeStyle = "#241a16";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(hx - 26, hy - 12);
  ctx.quadraticCurveTo(hx - 14, hy - 20, hx - 2, hy - 14);
  ctx.stroke();
  ctx.fillStyle = "#fbf7f2";
  ctx.beginPath();
  ctx.ellipse(hx - 15, hy - 1, 9, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b1e18";
  ctx.beginPath();
  ctx.arc(hx - 13, hy - 1, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = skinShade;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(hx + 4, hy - 4);
  ctx.quadraticCurveTo(hx + 12, hy + 10, hx + 2, hy + 14);
  ctx.stroke();
  // the mouth: a small genuine smile only when she looks
  ctx.strokeStyle = "#9a5b4c";
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  if (looking) {
    ctx.moveTo(hx - 16, hy + 32);
    ctx.quadraticCurveTo(hx - 4, hy + 41, hx + 10, hy + 30);
  } else {
    ctx.moveTo(hx - 14, hy + 34);
    ctx.quadraticCurveTo(hx - 2, hy + 37, hx + 10, hy + 33);
  }
  ctx.stroke();
  // lamp rim on her cheek and jaw
  ctx.strokeStyle = `${KEY}0.42)`;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(hx + 40, hy - 30);
  ctx.quadraticCurveTo(hx + 52, hy + 8, hx + 26, hy + 46);
  ctx.stroke();

  return tex(cv);
}

// ---------------------------------------------------------------------------
// The seated child — a scene-specific pose, matching the canonical design
// ---------------------------------------------------------------------------

/**
 * Seated cross-legged on the floor, controller in both hands, looking up at the
 * CRT. Painted to match the supplied childhood sprite: curly black hair, light
 * skin, red Morocco jersey with green trim, green shorts.
 *
 * This is an addition, not a replacement — the walk/run/idle sheets are
 * untouched.
 */
export function paintSeatedChild(): THREE.CanvasTexture {
  const W = 420;
  const H = 420;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  const cx = W * 0.5;
  const floor = H - 34;

  const skin = "#e9b98f";
  const skinLit = "#f7d3ab";
  const skinShade = "#bd8a61";
  const RED = "#c8352f";
  const RED_D = "#9c2622";
  const GRN = "#1f6b3a";
  const GRN_D = "#17512c";
  const CRT = "rgba(140,220,240,";

  // cast shadow
  ctx.fillStyle = "rgba(18,12,6,0.34)";
  ctx.beginPath();
  ctx.ellipse(cx, floor + 6, 116, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- crossed legs ----
  ctx.fillStyle = GRN_D;
  ctx.beginPath();
  ctx.ellipse(cx - 56, floor - 26, 60, 30, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = GRN;
  ctx.beginPath();
  ctx.ellipse(cx + 50, floor - 30, 64, 32, 0.14, 0, Math.PI * 2);
  ctx.fill();
  // shins crossing in front
  ctx.strokeStyle = skinShade;
  ctx.lineWidth = 30;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 74, floor - 20);
  ctx.quadraticCurveTo(cx, floor - 2, cx + 66, floor - 24);
  ctx.stroke();
  ctx.strokeStyle = skin;
  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.moveTo(cx + 74, floor - 26);
  ctx.quadraticCurveTo(cx + 6, floor - 6, cx - 62, floor - 30);
  ctx.stroke();
  // feet
  ctx.fillStyle = "#2a2b2f";
  ctx.beginPath();
  ctx.ellipse(cx - 80, floor - 26, 22, 13, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 84, floor - 30, 22, 13, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // ---- torso, leaning very slightly forward ----
  const jersey = ctx.createLinearGradient(cx - 62, 150, cx + 66, 300);
  jersey.addColorStop(0, RED_D);
  jersey.addColorStop(0.45, RED);
  jersey.addColorStop(1, "#d8433a");
  ctx.fillStyle = jersey;
  ctx.beginPath();
  ctx.moveTo(cx - 62, floor - 48);
  ctx.quadraticCurveTo(cx - 70, 210, cx - 48, 178);
  ctx.quadraticCurveTo(cx, 162, cx + 48, 178);
  ctx.quadraticCurveTo(cx + 70, 210, cx + 62, floor - 48);
  ctx.fill();
  // green collar + sleeve trim, from the canonical kit
  ctx.fillStyle = GRN;
  ctx.beginPath();
  ctx.moveTo(cx - 26, 176);
  ctx.quadraticCurveTo(cx, 196, cx + 26, 176);
  ctx.lineTo(cx + 20, 166);
  ctx.quadraticCurveTo(cx, 182, cx - 20, 166);
  ctx.fill();
  // small crest
  ctx.fillStyle = GRN;
  ctx.beginPath();
  ctx.arc(cx + 30, 214, 8, 0, Math.PI * 2);
  ctx.fill();

  // ---- arms forward, holding a controller ----
  ctx.strokeStyle = skinShade;
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(cx - 54, 214);
  ctx.quadraticCurveTo(cx - 52, 266, cx - 18, 282);
  ctx.stroke();
  ctx.strokeStyle = skin;
  ctx.beginPath();
  ctx.moveTo(cx + 54, 212);
  ctx.quadraticCurveTo(cx + 54, 264, cx + 20, 282);
  ctx.stroke();
  // sleeves
  ctx.fillStyle = GRN;
  ctx.beginPath();
  ctx.ellipse(cx - 56, 218, 17, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 56, 216, 17, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // controller — visible but subtle
  ctx.fillStyle = "#4a4d55";
  ctx.beginPath();
  ctx.ellipse(cx, 288, 30, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#33363c";
  ctx.fillRect(cx - 8, 280, 16, 10);
  ctx.fillStyle = "#8f939b";
  ctx.beginPath();
  ctx.arc(cx + 18, 285, 3, 0, Math.PI * 2);
  ctx.fill();
  // hands over it
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(cx - 22, 285, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 22, 285, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- head, tipped up toward the screen ----
  const hx = cx - 2;
  const hy = 122;
  ctx.fillStyle = "#150f14";
  ctx.beginPath();
  ctx.ellipse(hx, hy - 6, 56, 54, 0, 0, Math.PI * 2);
  ctx.fill();
  const face = ctx.createLinearGradient(hx - 40, hy - 40, hx + 40, hy + 44);
  face.addColorStop(0, skinLit);
  face.addColorStop(0.55, skin);
  face.addColorStop(1, skinShade);
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(hx, hy + 4, 40, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  // curly hair mass — overlapping blobs, like the canonical sprite
  ctx.fillStyle = "#150f14";
  const curls: [number, number, number][] = [
    [-40, -34, 22], [-14, -48, 25], [16, -44, 22], [40, -26, 19],
    [-50, -6, 19], [48, -2, 17], [-28, -50, 20], [4, -56, 21],
  ];
  for (const [ox, oy, rr] of curls) {
    ctx.beginPath();
    ctx.arc(hx + ox, hy + oy, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#2e2333";
  ctx.beginPath();
  ctx.arc(hx - 6, hy - 50, 16, 0, Math.PI * 2);
  ctx.fill();

  // eyes looking up at the screen
  ctx.fillStyle = "#fbf7f2";
  ctx.beginPath();
  ctx.ellipse(hx - 15, hy + 2, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + 15, hy + 2, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#241a16";
  ctx.beginPath();
  ctx.arc(hx - 14, hy - 1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx + 16, hy - 1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(hx - 12, hy - 3, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx + 18, hy - 3, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // brows, mouth — absorbed, faintly pleased
  ctx.strokeStyle = "#1c1418";
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(hx - 24, hy - 13);
  ctx.quadraticCurveTo(hx - 14, hy - 18, hx - 5, hy - 14);
  ctx.moveTo(hx + 6, hy - 14);
  ctx.quadraticCurveTo(hx + 15, hy - 18, hx + 25, hy - 13);
  ctx.stroke();
  ctx.strokeStyle = "#a2604f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(hx - 10, hy + 26);
  ctx.quadraticCurveTo(hx, hy + 32, hx + 11, hy + 25);
  ctx.stroke();

  // ---- the CRT keying him from screen-left ----
  ctx.strokeStyle = `${CRT}0.55)`;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(hx - 38, hy - 22);
  ctx.quadraticCurveTo(hx - 50, hy + 14, hx - 26, hy + 40);
  ctx.stroke();
  ctx.strokeStyle = `${CRT}0.4)`;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(cx - 60, 200);
  ctx.quadraticCurveTo(cx - 74, 250, cx - 60, floor - 54);
  ctx.stroke();
  // cool bounce on the near knee
  ctx.fillStyle = `${CRT}0.2)`;
  ctx.beginPath();
  ctx.ellipse(cx - 56, floor - 34, 44, 18, -0.12, 0, Math.PI * 2);
  ctx.fill();

  return tex(cv);
}
