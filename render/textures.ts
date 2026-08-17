"use client";

/**
 * Procedural textures.
 *
 * There is no image-generation capability in this environment and no texture
 * assets, so every surface is painted to a canvas in code. That is not a
 * limitation to work around — it is what lets a whole region recolour from a
 * palette, and it means nothing is downloaded.
 *
 * Rule from the art direction: **no surface is a single flat fill.** Every
 * painter here lays down a gradient, a value break, and grain.
 */

import * as THREE from "three";

const DPR_CAP = 2048;

export function paint(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = Math.min(DPR_CAP, w);
  cv.height = Math.min(DPR_CAP, h);
  const ctx = cv.getContext("2d")!;
  draw(ctx, cv.width, cv.height);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Deterministic noise so a texture never differs between reloads. */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, seed = 7) {
  const r = rng(seed);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

/** Dry packed earth — the surface of the yard and the street. */
export function groundTexture(seed = 11) {
  return paint(1024, 1024, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
    g.addColorStop(0, "#cba873");
    g.addColorStop(0.5, "#c09a63");
    g.addColorStop(1, "#b58c58");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const r = rng(seed);
    // Worn patches where feet and wheels have passed.
    for (let i = 0; i < 220; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 18 + r() * 90;
      const gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() > 0.5;
      gg.addColorStop(0, dark ? "rgba(126,96,58,0.20)" : "rgba(222,196,150,0.18)");
      gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    // Grit.
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = r() > 0.5 ? "rgba(90,68,42,0.30)" : "rgba(236,214,176,0.28)";
      const s = 1 + r() * 2.6;
      ctx.fillRect(r() * w, r() * h, s, s);
    }
    grain(ctx, w, h, 16, seed);
  });
}

/** Hand-rendered plaster over block. The walls that make Morocco intimate. */
export function plasterTexture(base: string, seed = 23) {
  return paint(512, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, base);
    g.addColorStop(1, shade(base, -22));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const r = rng(seed);
    // Trowel mottling.
    for (let i = 0; i < 160; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 30 + r() * 120;
      const gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
      gg.addColorStop(0, `rgba(255,240,215,${0.05 + r() * 0.08})`);
      gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    // Damp and dirt rising from the base — walls are dirtiest at the bottom.
    const damp = ctx.createLinearGradient(0, h * 0.72, 0, h);
    damp.addColorStop(0, "rgba(96,70,44,0)");
    damp.addColorStop(1, "rgba(96,70,44,0.34)");
    ctx.fillStyle = damp;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    // A few chips where the render has come away.
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = `rgba(150,112,70,${0.18 + r() * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(r() * w, h * (0.3 + r() * 0.65), 6 + r() * 22, 4 + r() * 14, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    grain(ctx, w, h, 13, seed + 3);
  });
}

/** A soft round shadow used under the character and under props. */
export function blobShadowTexture() {
  return paint(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(48,30,14,0.55)");
    g.addColorStop(0.55, "rgba(48,30,14,0.26)");
    g.addColorStop(1, "rgba(48,30,14,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/** Palm crown as a cut-out — fronds droop, they do not fan upward. */
export function palmCrownTexture(seed = 31) {
  return paint(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h * 0.42;
    const r = rng(seed);
    const fronds = 13;
    for (let i = 0; i < fronds; i++) {
      const t = i / (fronds - 1);
      const a = (t - 0.5) * 2.9;
      const len = h * (0.4 + r() * 0.1);
      const spread = Math.sin(a);
      const rise = Math.cos(a);
      const ex = cx + spread * len * 1.05;
      const ey = cy - rise * len * 0.3 + Math.abs(spread) * len * 1.05;
      const mx = cx + spread * len * 0.5;
      const my = cy - rise * len * 0.52 - len * 0.16;
      ctx.strokeStyle = i % 3 === 0 ? "#4d8438" : "#2f5e2c";
      ctx.lineWidth = 13;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(mx, my, ex, ey);
      ctx.stroke();
      // barbs, so a frond reads as a frond and not a blade
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#2a5427";
      for (const u of [0.4, 0.6, 0.78]) {
        const bx = (1 - u) * (1 - u) * cx + 2 * (1 - u) * u * mx + u * u * ex;
        const by = (1 - u) * (1 - u) * cy + 2 * (1 - u) * u * my + u * u * ey;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - spread * 14 - 20, by + 22);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#33612e";
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Bougainvillea — the one saturated colour Morocco is allowed. */
export function bougainvilleaTexture(accent = "#d2467a", seed = 41) {
  return paint(512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const r = rng(seed);
    for (let i = 0; i < 190; i++) {
      const x = r() * w;
      const y = r() * h * (0.35 + (x / w) * 0.5);
      ctx.fillStyle = `rgba(40,72,36,${0.55 + r() * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 7 + r() * 15, 6 + r() * 12, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 130; i++) {
      const x = r() * w;
      const y = r() * h * (0.3 + (x / w) * 0.55);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.45 + r() * 0.5;
      ctx.beginPath();
      ctx.ellipse(x, y, 4 + r() * 10, 4 + r() * 9, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

/** Zellige-ish tiling for a terrace or a doorstep. */
export function tileTexture(seed = 53) {
  return paint(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#b9a184";
    ctx.fillRect(0, 0, w, h);
    const n = 8;
    const s = w / n;
    const r = rng(seed);
    const colours = ["#2f6d78", "#c9743f", "#e2d3b4", "#7a9a6a"];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        ctx.fillStyle = colours[Math.floor(r() * colours.length)];
        ctx.globalAlpha = 0.82 + r() * 0.18;
        ctx.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(x * s + s / 2, y * s + 4);
        ctx.lineTo(x * s + s - 4, y * s + s / 2);
        ctx.lineTo(x * s + s / 2, y * s + s - 4);
        ctx.lineTo(x * s + 4, y * s + s / 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    grain(ctx, w, h, 10, seed);
  });
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v: number) => Math.max(0, Math.min(255, v + amount));
  return `rgb(${cl((n >> 16) & 255)},${cl((n >> 8) & 255)},${cl(n & 255)})`;
}
