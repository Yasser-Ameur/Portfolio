"use client";

/**
 * Painted Casablanca — every visible surface, drawn as 2D art.
 *
 * Per the corrected doctrine in `.claude/skills/world-2-5d`: buildings,
 * vehicles, trees and street furniture are **painted elevations** placed on
 * quads. Nothing here is modelled. Balconies, shutters, shopfronts, weathering
 * and their shading all live in the texture, which is why one building is one
 * draw call and still carries more detail than a hundred boxes did.
 *
 * Authored against docs/CASABLANCA_REFERENCE.md.
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

function toTexture(cv: HTMLCanvasElement, repeat = false) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  if (repeat) t.wrapS = THREE.RepeatWrapping;
  return t;
}

/** Speckled dirt/tone variation. Used on every painted surface. */
function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, n: number, seed: number, a = 0.06) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = r() > 0.5 ? `rgba(255,245,225,${a})` : `rgba(70,55,40,${a})`;
    const s = 1 + r() * 3;
    ctx.fillRect(r() * w, r() * h, s, s);
  }
}

const shade = (hex: string, d: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + d)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
};

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

export type FacadeOpts = {
  floors: number;
  bays: number;
  tone: string;
  /** Ground floor: shuttered shops, or the residential entrance. */
  ground: "shops" | "entrance";
  seed: number;
};

/** Pixels per metre in painted art. Keeps every asset at one density. */
export const PPM = 64;
const FLOOR_M = 2.85;
const GROUND_M = 3.3;

export function facadeSize(o: FacadeOpts) {
  return {
    wM: o.bays * 2.35,
    hM: GROUND_M + o.floors * FLOOR_M + 0.75,
  };
}

/** A whole apartment elevation, painted. One quad, one draw call. */
export function paintFacade(o: FacadeOpts): THREE.CanvasTexture {
  const { wM, hM } = facadeSize(o);
  const W = Math.round(wM * PPM);
  const H = Math.round(hM * PPM);
  const { cv, ctx } = canvas(W, H);
  const r = rng(o.seed);

  const bayW = W / o.bays;
  const groundH = GROUND_M * PPM;
  const floorH = FLOOR_M * PPM;
  const parapetH = 0.75 * PPM;

  // --- plaster body, lit from the left, weathered toward the base ---
  const g = ctx.createLinearGradient(0, 0, W * 0.75, H);
  g.addColorStop(0, shade(o.tone, 16));
  g.addColorStop(0.45, o.tone);
  g.addColorStop(1, shade(o.tone, -26));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // streaking below sills, damp at the base
  const damp = ctx.createLinearGradient(0, H - groundH * 0.7, 0, H);
  damp.addColorStop(0, "rgba(80,62,42,0)");
  damp.addColorStop(1, "rgba(80,62,42,0.3)");
  ctx.fillStyle = damp;
  ctx.fillRect(0, H - groundH * 0.7, W, groundH * 0.7);
  speckle(ctx, W, H, 2600, o.seed, 0.05);

  // --- parapet + cornice ---
  ctx.fillStyle = shade(o.tone, 30);
  ctx.fillRect(0, 0, W, parapetH);
  ctx.fillStyle = shade(o.tone, -34);
  ctx.fillRect(0, parapetH - 7, W, 7);
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.fillRect(0, parapetH, W, 10);

  // --- floors ---
  for (let f = 0; f < o.floors; f++) {
    const top = parapetH + f * floorH;

    for (let b = 0; b < o.bays; b++) {
      const bx = b * bayW;
      const openW = bayW * 0.52;
      const openX = bx + (bayW - openW) / 2;
      const openY = top + floorH * 0.2;
      const openH = floorH * 0.5;

      // recess + dark interior
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(openX - 5, openY - 5, openW + 10, openH + 10);
      ctx.fillStyle = "#2c363c";
      ctx.fillRect(openX, openY, openW, openH);
      // glass sheen
      const gl = ctx.createLinearGradient(openX, openY, openX + openW, openY + openH);
      gl.addColorStop(0, "rgba(190,214,226,0.5)");
      gl.addColorStop(0.5, "rgba(120,150,166,0.12)");
      gl.addColorStop(1, "rgba(40,54,62,0.1)");
      ctx.fillStyle = gl;
      ctx.fillRect(openX, openY, openW, openH);
      // mullions
      ctx.fillStyle = "rgba(30,34,36,0.7)";
      ctx.fillRect(openX + openW / 2 - 2, openY, 4, openH);

      // shutter, half the time, half-closed
      if (r() > 0.45) {
        const sh = openH * (0.3 + r() * 0.45);
        ctx.fillStyle = "#7d8a86";
        ctx.fillRect(openX, openY, openW, sh);
        ctx.strokeStyle = "rgba(50,60,58,0.5)";
        ctx.lineWidth = 1;
        for (let k = 0; k < sh; k += 5) {
          ctx.beginPath();
          ctx.moveTo(openX, openY + k);
          ctx.lineTo(openX + openW, openY + k);
          ctx.stroke();
        }
      }
      // lintel + sill
      ctx.fillStyle = shade(o.tone, 22);
      ctx.fillRect(openX - 9, openY - 12, openW + 18, 9);
      ctx.fillStyle = shade(o.tone, -18);
      ctx.fillRect(openX - 9, openY + openH, openW + 18, 7);
    }

    // --- balcony: slab + iron railing across the bay row ---
    const balY = top + floorH * 0.76;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(W * 0.05, balY + 12, W * 0.9, 8);
    ctx.fillStyle = shade(o.tone, 24);
    ctx.fillRect(W * 0.05, balY, W * 0.9, 13);

    const railH = floorH * 0.2;
    ctx.strokeStyle = "#33373a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.05, balY);
    ctx.lineTo(W * 0.95, balY);
    ctx.moveTo(W * 0.05, balY - railH);
    ctx.lineTo(W * 0.95, balY - railH);
    ctx.stroke();
    ctx.lineWidth = 2;
    const bal = Math.round(W / 13);
    for (let i = 0; i <= bal; i++) {
      const x = W * 0.05 + (i / bal) * W * 0.9;
      ctx.beginPath();
      ctx.moveTo(x, balY);
      ctx.lineTo(x, balY - railH);
      ctx.stroke();
    }
    // a plant or laundry on some balconies
    if (r() > 0.55) {
      const px = W * 0.1 + r() * W * 0.75;
      ctx.fillStyle = "#7c5230";
      ctx.fillRect(px, balY - 13, 15, 13);
      ctx.fillStyle = r() > 0.5 ? "#4e7a44" : "#3d6b38";
      ctx.beginPath();
      ctx.arc(px + 7, balY - 19, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- ground floor ---
  const gy = H - groundH;
  if (o.ground === "entrance") {
    const dw = bayW * 0.62;
    const dx = (W - dw) / 2;
    const dh = groundH * 0.74;
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(dx - 12, gy + groundH - dh - 12, dw + 24, dh + 12);
    ctx.fillStyle = shade(o.tone, 26);
    ctx.fillRect(dx - 12, gy + groundH - dh - 12, dw + 24, 12);
    // dark wooden double door with ironwork
    ctx.fillStyle = "#5d3f28";
    ctx.fillRect(dx, gy + groundH - dh, dw, dh);
    ctx.fillStyle = "#4a3120";
    ctx.fillRect(dx + dw / 2 - 2, gy + groundH - dh, 4, dh);
    ctx.strokeStyle = "#2a2b2c";
    ctx.lineWidth = 2;
    for (let i = 1; i < 5; i++) {
      const yy = gy + groundH - dh + (dh * i) / 5;
      ctx.beginPath();
      ctx.moveTo(dx + 6, yy);
      ctx.lineTo(dx + dw - 6, yy);
      ctx.stroke();
    }
    // blue tile number plaque
    ctx.fillStyle = "#2f6d8a";
    ctx.fillRect(dx + dw + 16, gy + groundH - dh + 10, 30, 30);
    ctx.fillStyle = "#e8eef0";
    ctx.font = "bold 20px system-ui";
    ctx.fillText("27", dx + dw + 20, gy + groundH - dh + 33);
    // potted plants either side
    for (const s of [-1, 1]) {
      const px = dx + dw / 2 + s * (dw / 2 + 34);
      ctx.fillStyle = "#a5623c";
      ctx.beginPath();
      ctx.moveTo(px - 14, gy + groundH);
      ctx.lineTo(px + 14, gy + groundH);
      ctx.lineTo(px + 10, gy + groundH - 26);
      ctx.lineTo(px - 10, gy + groundH - 26);
      ctx.fill();
      ctx.fillStyle = "#436f3c";
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(px + (r() - 0.5) * 26, gy + groundH - 32 - r() * 20, 8 + r() * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    const shops = Math.max(1, Math.round(o.bays / 1.5));
    for (let i = 0; i < shops; i++) {
      const sw = (W / shops) * 0.86;
      const sx = (i + 0.5) * (W / shops) - sw / 2;
      const sh = groundH * 0.66;
      const sy = gy + groundH - sh;
      // roller shutter, ribbed
      ctx.fillStyle = "#78827e";
      ctx.fillRect(sx, sy, sw, sh);
      ctx.strokeStyle = "rgba(45,52,50,0.45)";
      ctx.lineWidth = 2;
      for (let k = 0; k < sh; k += 8) {
        ctx.beginPath();
        ctx.moveTo(sx, sy + k);
        ctx.lineTo(sx + sw, sy + k);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(sx, sy, sw, 10);
      // awning
      if (r() > 0.4) {
        const aw = sw + 20;
        const ax = sx - 10;
        ctx.fillStyle = r() > 0.5 ? "#8a4a3c" : "#3f6b74";
        ctx.beginPath();
        ctx.moveTo(ax, sy - 6);
        ctx.lineTo(ax + aw, sy - 6);
        ctx.lineTo(ax + aw - 8, sy - 30);
        ctx.lineTo(ax + 8, sy - 30);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        for (let k = 0; k < 6; k++) ctx.fillRect(ax + (k * aw) / 6, sy - 30, aw / 12, 24);
      }
    }
  }

  // final ambient occlusion into the street
  const ao = ctx.createLinearGradient(0, H - 40, 0, H);
  ao.addColorStop(0, "rgba(30,24,18,0)");
  ao.addColorStop(1, "rgba(30,24,18,0.28)");
  ctx.fillStyle = ao;
  ctx.fillRect(0, H - 40, W, 40);

  return toTexture(cv);
}

// ---------------------------------------------------------------------------
// Ground — a painted street cross-section, tiled along its length
// ---------------------------------------------------------------------------

export const STREET_TILE_M = 8;
export const STREET_WIDTH_M = 14;

/** Road, kerbs, pavement and wear, all painted. Repeats along the street. */
export function paintStreet(seed = 5): THREE.CanvasTexture {
  const W = STREET_TILE_M * PPM;
  const H = STREET_WIDTH_M * PPM;
  const { cv, ctx } = canvas(W, H);
  const r = rng(seed);

  const pavM = 2.2;
  const pav = pavM * PPM;
  const kerb = 0.22 * PPM;

  // asphalt — the dark value anchor the whole palette needs
  const road = ctx.createLinearGradient(0, pav, 0, H - pav);
  road.addColorStop(0, "#4e4f53");
  road.addColorStop(0.5, "#585a5e");
  road.addColorStop(1, "#4a4b4f");
  ctx.fillStyle = road;
  ctx.fillRect(0, 0, W, H);

  // worn patches and repairs
  for (let i = 0; i < 90; i++) {
    const x = r() * W;
    const y = pav + r() * (H - pav * 2);
    const rad = 14 + r() * 90;
    const gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
    gg.addColorStop(0, r() > 0.5 ? "rgba(110,112,116,0.3)" : "rgba(52,53,57,0.32)");
    gg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  // cracks
  ctx.strokeStyle = "rgba(38,39,42,0.5)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    let x = r() * W;
    let y = pav + r() * (H - pav * 2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (r() - 0.5) * 70;
      y += (r() - 0.5) * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // faded centre line
  ctx.fillStyle = "rgba(214,206,180,0.2)";
  ctx.fillRect(W * 0.16, H / 2 - 3, W * 0.5, 6);

  // pavements both sides
  for (const top of [true, false]) {
    const y0 = top ? 0 : H - pav;
    const pg = ctx.createLinearGradient(0, y0, 0, y0 + pav);
    pg.addColorStop(top ? 0 : 1, "#a6a49a");
    pg.addColorStop(top ? 1 : 0, "#95938a");
    ctx.fillStyle = pg;
    ctx.fillRect(0, y0, W, pav);
    // slab joints
    ctx.strokeStyle = "rgba(120,118,110,0.55)";
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 0.9 * PPM) {
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y0 + pav);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, y0 + (top ? pav * 0.55 : pav * 0.45));
    ctx.lineTo(W, y0 + (top ? pav * 0.55 : pav * 0.45));
    ctx.stroke();
    // kerb, lit on top
    const ky = top ? pav - kerb : H - pav;
    ctx.fillStyle = "#bab7ac";
    ctx.fillRect(0, ky, W, kerb);
    ctx.fillStyle = "rgba(60,58,52,0.35)";
    ctx.fillRect(0, top ? ky + kerb : ky - 4, W, 4);
    // shadow the buildings throw onto the pavement
    const sg = ctx.createLinearGradient(0, y0, 0, y0 + pav * 0.7);
    sg.addColorStop(top ? 0 : 1, "rgba(40,32,24,0.34)");
    sg.addColorStop(top ? 1 : 0, "rgba(40,32,24,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, y0, W, pav * 0.7);
  }

  speckle(ctx, W, H, 3000, seed + 4, 0.045);
  return toTexture(cv, true);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** A small hatchback in side elevation. */
export function paintCar(body: string, seed = 3): THREE.CanvasTexture {
  const W = 4.2 * PPM;
  const H = 1.7 * PPM;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  const r = rng(seed);
  const bodyTop = H * 0.42;
  const roof = H * 0.1;

  ctx.beginPath();
  ctx.moveTo(W * 0.04, H * 0.82);
  ctx.lineTo(W * 0.06, bodyTop);
  ctx.lineTo(W * 0.26, bodyTop);
  ctx.quadraticCurveTo(W * 0.34, roof, W * 0.5, roof);
  ctx.lineTo(W * 0.68, roof);
  ctx.quadraticCurveTo(W * 0.78, roof + 4, W * 0.82, bodyTop);
  ctx.lineTo(W * 0.96, bodyTop + 6);
  ctx.lineTo(W * 0.96, H * 0.82);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, roof, 0, H * 0.82);
  g.addColorStop(0, shade(body, 34));
  g.addColorStop(0.45, body);
  g.addColorStop(1, shade(body, -46));
  ctx.fillStyle = g;
  ctx.fill();

  // glass
  ctx.fillStyle = "rgba(46,60,68,0.9)";
  ctx.beginPath();
  ctx.moveTo(W * 0.29, bodyTop - 3);
  ctx.quadraticCurveTo(W * 0.36, roof + 6, W * 0.5, roof + 6);
  ctx.lineTo(W * 0.66, roof + 6);
  ctx.quadraticCurveTo(W * 0.74, roof + 8, W * 0.78, bodyTop - 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(200,220,232,0.28)";
  ctx.fillRect(W * 0.31, roof + 8, W * 0.18, H * 0.1);

  // trim, handles, lights
  ctx.fillStyle = "rgba(30,30,32,0.55)";
  ctx.fillRect(W * 0.06, H * 0.62, W * 0.9, 4);
  ctx.fillStyle = "rgba(20,20,22,0.7)";
  ctx.fillRect(W * 0.4, bodyTop + 12, 16, 4);
  ctx.fillRect(W * 0.62, bodyTop + 12, 16, 4);
  ctx.fillStyle = "#e8d9a8";
  ctx.fillRect(W * 0.93, bodyTop + 10, 8, 10);
  ctx.fillStyle = "#a8423a";
  ctx.fillRect(W * 0.045, bodyTop + 10, 8, 10);

  // wheels + arches
  for (const wx of [W * 0.24, W * 0.76]) {
    ctx.fillStyle = "rgba(24,22,22,0.35)";
    ctx.beginPath();
    ctx.arc(wx, H * 0.8, H * 0.24, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#212325";
    ctx.beginPath();
    ctx.arc(wx, H * 0.82, H * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6e7175";
    ctx.beginPath();
    ctx.arc(wx, H * 0.82, H * 0.085, 0, Math.PI * 2);
    ctx.fill();
  }
  // contact shadow
  const sh = ctx.createRadialGradient(W / 2, H * 0.96, 0, W / 2, H * 0.96, W * 0.5);
  sh.addColorStop(0, "rgba(30,22,14,0.4)");
  sh.addColorStop(1, "rgba(30,22,14,0)");
  ctx.fillStyle = sh;
  ctx.fillRect(0, H * 0.86, W, H * 0.14);
  if (r() > 2) speckle(ctx, W, H, 1, seed);
  return toTexture(cv);
}

/** A street tree — painted canopy, not a cluster of spheres. */
export function paintTree(seed = 9): THREE.CanvasTexture {
  const W = 3.4 * PPM;
  const H = 4.6 * PPM;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  const r = rng(seed);

  // trunk
  ctx.strokeStyle = "#5f4830";
  ctx.lineCap = "round";
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(W / 2, H);
  ctx.quadraticCurveTo(W / 2 - 6, H * 0.72, W / 2 - 2, H * 0.56);
  ctx.stroke();
  ctx.lineWidth = 7;
  for (const a of [-0.7, 0.55, -0.2]) {
    ctx.beginPath();
    ctx.moveTo(W / 2 - 2, H * 0.6);
    ctx.lineTo(W / 2 - 2 + Math.sin(a) * W * 0.22, H * 0.6 - Math.cos(a) * H * 0.16);
    ctx.stroke();
  }

  // canopy: many low-alpha stamps, dark underside, lit crown
  const cx = W / 2;
  const cy = H * 0.36;
  for (let i = 0; i < 200; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.pow(r(), 0.55);
    const x = cx + Math.cos(a) * d * W * 0.46;
    const y = cy + Math.sin(a) * d * H * 0.3;
    const lit = (y - cy) / (H * 0.3);
    ctx.fillStyle =
      lit < -0.25
        ? `rgba(104,150,72,${0.5 + r() * 0.4})`
        : lit < 0.3
          ? `rgba(72,120,60,${0.5 + r() * 0.4})`
          : `rgba(40,78,44,${0.55 + r() * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 9 + r() * 15, 7 + r() * 11, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(cv);
}

/** Streetlight, pole and lamp. */
export function paintStreetlight(): THREE.CanvasTexture {
  const W = 1.6 * PPM;
  const H = 5.6 * PPM;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "#3a3d40";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(W * 0.22, H);
  ctx.lineTo(W * 0.22, H * 0.1);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(W * 0.22, H * 0.1);
  ctx.quadraticCurveTo(W * 0.22, H * 0.03, W * 0.62, H * 0.035);
  ctx.stroke();
  ctx.fillStyle = "#4a4d50";
  ctx.beginPath();
  ctx.moveTo(W * 0.5, H * 0.03);
  ctx.lineTo(W * 0.92, H * 0.045);
  ctx.lineTo(W * 0.88, H * 0.085);
  ctx.lineTo(W * 0.54, H * 0.075);
  ctx.fill();
  ctx.fillStyle = "#d8d2be";
  ctx.fillRect(W * 0.56, H * 0.072, W * 0.3, 5);
  ctx.fillStyle = "#2f3234";
  ctx.fillRect(W * 0.12, H * 0.96, W * 0.2, H * 0.04);
  return toTexture(cv);
}

/** A kid, painted. Placeholder-grade boxes are not acceptable next to the hero art. */
export function paintKid(shirt: string, shorts: string, seed = 11): THREE.CanvasTexture {
  const W = 0.9 * PPM;
  const H = 1.25 * PPM;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  const skin = "#c98d63";
  const cx = W / 2;

  // legs
  ctx.strokeStyle = skin;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 5, H * 0.66);
    ctx.lineTo(cx + s * 8, H * 0.95);
    ctx.stroke();
  }
  ctx.fillStyle = shorts;
  ctx.beginPath();
  ctx.moveTo(cx - 12, H * 0.5);
  ctx.lineTo(cx + 12, H * 0.5);
  ctx.lineTo(cx + 11, H * 0.7);
  ctx.lineTo(cx - 11, H * 0.7);
  ctx.fill();
  // shoes
  ctx.fillStyle = "#e6e2d6";
  for (const s of [-1, 1]) ctx.fillRect(cx + s * 8 - 6, H * 0.94, 12, 6);
  // torso
  const g = ctx.createLinearGradient(cx - 14, 0, cx + 14, 0);
  g.addColorStop(0, shade(shirt, 22));
  g.addColorStop(1, shade(shirt, -26));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - 14, H * 0.31);
  ctx.lineTo(cx + 14, H * 0.31);
  ctx.lineTo(cx + 12, H * 0.54);
  ctx.lineTo(cx - 12, H * 0.54);
  ctx.fill();
  // arms
  ctx.strokeStyle = skin;
  ctx.lineWidth = 6;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 13, H * 0.34);
    ctx.lineTo(cx + s * 17, H * 0.56);
    ctx.stroke();
  }
  // head + curly hair
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(cx, H * 0.22, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#241a18";
  const r = rng(seed);
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.arc(cx + (r() - 0.5) * 22, H * 0.15 + (r() - 0.5) * 12, 5 + r() * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(cv);
}

/** Chain-link fence panel — painted mesh, tiled. */
export function paintFence(): THREE.CanvasTexture {
  const W = 2 * PPM;
  const H = 2.6 * PPM;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(150,158,152,0.55)";
  ctx.lineWidth = 1.5;
  for (let i = -H; i < W + H; i += 13) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i + H, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  ctx.strokeStyle = "#42474a";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(W, 4);
  ctx.moveTo(0, H - 3);
  ctx.lineTo(W, H - 3);
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(6, H);
  ctx.stroke();
  return toTexture(cv, true);
}

/** The 5v5 pitch surface, painted with its markings and wear. */
export function paintPitch(): THREE.CanvasTexture {
  const W = 1024;
  const H = 768;
  const { cv, ctx } = canvas(W, H);
  const r = rng(77);
  const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
  g.addColorStop(0, "#587f4c");
  g.addColorStop(0.5, "#4e7345");
  g.addColorStop(1, "#456839");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // mown bands + bare patches
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.035)";
    ctx.fillRect((i * W) / 8, 0, W / 8, H);
  }
  for (let i = 0; i < 60; i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = 20 + r() * 70;
    const gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
    gg.addColorStop(0, "rgba(140,124,80,0.24)");
    gg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  // markings
  ctx.strokeStyle = "rgba(228,232,220,0.72)";
  ctx.lineWidth = 5;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.beginPath();
  ctx.moveTo(W / 2, 28);
  ctx.lineTo(W / 2, H - 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 92, 0, Math.PI * 2);
  ctx.stroke();
  for (const s of [0, 1]) {
    const bw = 130;
    ctx.strokeRect(s ? W - 28 - bw : 28, H / 2 - 120, bw, 240);
  }
  speckle(ctx, W, H, 2200, 91, 0.05);
  return toTexture(cv);
}
