"use client";

/**
 * Painted interiors.
 *
 * In this doctrine a room is another painted sprite — the same way HGSS paints
 * its interiors. The camera pushes toward these planes rather than cutting to
 * them, so the apartment, the stairwell and the bedroom are all continuous with
 * the street outside.
 *
 * The living room deliberately carries **two separate light pools**: the CRT on
 * him, a warm lamp on her. That separation is the whole point of the glance.
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

function toTexture(cv: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, n: number, seed: number, a = 0.05) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = r() > 0.5 ? `rgba(255,246,228,${a})` : `rgba(60,46,32,${a})`;
    const s = 1 + r() * 3;
    ctx.fillRect(r() * w, r() * h, s, s);
  }
}

/** The living room. Beats 04–05. */
export function paintLivingRoom(): THREE.CanvasTexture {
  const W = 1536;
  const H = 900;
  const { cv, ctx } = canvas(W, H);
  const r = rng(555);

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#4a3a30");
  g.addColorStop(0.55, "#6b5241");
  g.addColorStop(1, "#3e2f27");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#4a3628";
  ctx.fillRect(0, H * 0.68, W, H * 0.32);
  ctx.fillStyle = "rgba(20,12,8,0.3)";
  ctx.fillRect(0, H * 0.68, W, 12);

  // patterned rug
  ctx.fillStyle = "#7c3f38";
  ctx.beginPath();
  ctx.moveTo(W * 0.16, H * 0.99);
  ctx.lineTo(W * 0.84, H * 0.99);
  ctx.lineTo(W * 0.74, H * 0.74);
  ctx.lineTo(W * 0.26, H * 0.74);
  ctx.fill();
  ctx.strokeStyle = "rgba(226,196,150,0.3)";
  ctx.lineWidth = 3;
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(W * (0.26 + i * 0.08), H * 0.74);
    ctx.lineTo(W * (0.16 + i * 0.113), H * 0.99);
    ctx.stroke();
  }

  // balcony door, evening light behind it
  ctx.fillStyle = "#2a2018";
  ctx.fillRect(W * 0.04, H * 0.12, W * 0.2, H * 0.58);
  const dl = ctx.createLinearGradient(0, H * 0.12, 0, H * 0.7);
  dl.addColorStop(0, "#d3b07c");
  dl.addColorStop(1, "#8a7250");
  ctx.fillStyle = dl;
  ctx.fillRect(W * 0.05, H * 0.13, W * 0.18, H * 0.56);
  ctx.fillStyle = "#2a2018";
  ctx.fillRect(W * 0.138, H * 0.13, 8, H * 0.56);

  // framed photographs
  for (let i = 0; i < 4; i++) {
    const x = W * (0.3 + i * 0.072);
    const y = H * (0.16 + (i % 2) * 0.055);
    ctx.fillStyle = "#3a2a1e";
    ctx.fillRect(x, y, 60, 76);
    ctx.fillStyle = "#8d7358";
    ctx.fillRect(x + 6, y + 6, 48, 64);
  }

  // shelf
  ctx.fillStyle = "#523c2c";
  ctx.fillRect(W * 0.62, H * 0.3, W * 0.3, 12);
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = ["#9a7a52", "#7a8a6a", "#8a5a4a", "#a49478"][i % 4];
    const h = 18 + r() * 26;
    ctx.fillRect(W * 0.635 + i * 42, H * 0.3 - h, 22, h);
  }

  // sofa
  ctx.fillStyle = "#4e5a52";
  ctx.fillRect(W * 0.6, H * 0.5, W * 0.28, H * 0.15);
  ctx.fillStyle = "#5a6a60";
  ctx.fillRect(W * 0.6, H * 0.47, W * 0.28, H * 0.05);

  // ---- the television: his key light -------------------------------------
  // Left of frame so its spill falls across the floor toward him, and the two
  // light pools in this room stay genuinely separate.
  ctx.fillStyle = "#2b2620";
  ctx.fillRect(W * 0.29, H * 0.42, W * 0.22, H * 0.25);
  ctx.fillStyle = "#161a1d";
  ctx.fillRect(W * 0.305, H * 0.44, W * 0.19, H * 0.19);
  const crt = ctx.createLinearGradient(W * 0.305, H * 0.44, W * 0.495, H * 0.63);
  crt.addColorStop(0, "#7fd6ea");
  crt.addColorStop(0.5, "#3f9f7a");
  crt.addColorStop(1, "#2a6a54");
  ctx.fillStyle = crt;
  ctx.fillRect(W * 0.312, H * 0.447, W * 0.176, H * 0.176);
  // a football game on the screen
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(W * 0.34, H * 0.56, 22, 16);
  ctx.fillRect(W * 0.43, H * 0.545, 20, 18);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(W * 0.312, H * 0.50, W * 0.176, 3);
  // the spill onto the floor and up the wall — this is what keys him
  const spill = ctx.createRadialGradient(W * 0.4, H * 0.55, 20, W * 0.4, H * 0.55, 620);
  spill.addColorStop(0, "rgba(120,214,232,0.4)");
  spill.addColorStop(0.45, "rgba(90,180,200,0.14)");
  spill.addColorStop(1, "rgba(90,180,200,0)");
  ctx.fillStyle = spill;
  ctx.fillRect(0, 0, W, H);
  // wooden unit under it
  ctx.fillStyle = "#5c4028";
  ctx.fillRect(W * 0.27, H * 0.67, W * 0.26, H * 0.06);

  // her lamp pool + the armchair
  const lamp = ctx.createRadialGradient(W * 0.83, H * 0.44, 12, W * 0.83, H * 0.44, 330);
  lamp.addColorStop(0, "rgba(255,206,140,0.44)");
  lamp.addColorStop(1, "rgba(255,206,140,0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(W * 0.52, H * 0.14, W * 0.48, H * 0.74);
  ctx.fillStyle = "#6b4a3a";
  ctx.fillRect(W * 0.72, H * 0.48, W * 0.13, H * 0.2);
  ctx.fillStyle = "#7d5847";
  ctx.fillRect(W * 0.706, H * 0.46, W * 0.16, H * 0.055);
  // her lamp, visible, so the warm pool has a source
  ctx.fillStyle = "#3a2a20";
  ctx.fillRect(W * 0.885, H * 0.5, 12, H * 0.17);
  ctx.fillStyle = "#e8c187";
  ctx.beginPath();
  ctx.moveTo(W * 0.86, H * 0.5);
  ctx.lineTo(W * 0.925, H * 0.5);
  ctx.lineTo(W * 0.915, H * 0.43);
  ctx.lineTo(W * 0.87, H * 0.43);
  ctx.fill();

  speckle(ctx, W, H, 3000, 61);
  return toTexture(cv);
}

/** Stairwell: green wainscot, terrazzo, a window per landing. Beat 07. */
export function paintStairwell(): THREE.CanvasTexture {
  const W = 900;
  const H = 1600;
  const { cv, ctx } = canvas(W, H);
  ctx.fillStyle = "#d8cdb6";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#6f8a6a";
  ctx.fillRect(0, H * 0.5, W, H * 0.5);
  ctx.fillStyle = "#5d7659";
  ctx.fillRect(0, H * 0.5, W, 10);

  for (let i = 0; i < 3; i++) {
    const y = H * (0.06 + i * 0.31);
    ctx.fillStyle = "#2e2a22";
    ctx.fillRect(W * 0.05, y, W * 0.19, H * 0.13);
    const wl = ctx.createLinearGradient(0, y, 0, y + H * 0.13);
    wl.addColorStop(0, "#f4e6c6");
    wl.addColorStop(1, "#c2b493");
    ctx.fillStyle = wl;
    ctx.fillRect(W * 0.06, y + 6, W * 0.17, H * 0.12);
    ctx.fillStyle = "rgba(255,232,186,0.18)";
    ctx.beginPath();
    ctx.moveTo(W * 0.06, y + H * 0.13);
    ctx.lineTo(W * 0.23, y + H * 0.13);
    ctx.lineTo(W * 0.6, y + H * 0.25);
    ctx.lineTo(W * 0.22, y + H * 0.25);
    ctx.fill();
    ctx.fillStyle = "#bcb4a4";
    for (let s = 0; s < 9; s++) {
      ctx.fillRect(W * (0.28 + s * 0.055), y + H * 0.115 + s * 15, W * 0.062, 13);
    }
    ctx.strokeStyle = "#3a3d3a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(W * 0.3, y + H * 0.085);
    ctx.lineTo(W * 0.78, y + H * 0.21);
    ctx.stroke();
  }
  speckle(ctx, W, H, 2400, 71);
  return toTexture(cv);
}

/** The bedroom. The computer is the focal point. Beats 16–17. */
export function paintBedroom(): THREE.CanvasTexture {
  const W = 1536;
  const H = 900;
  const { cv, ctx } = canvas(W, H);
  const r = rng(909);

  const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, "#3d4450");
  g.addColorStop(0.6, "#4e5462");
  g.addColorStop(1, "#33383f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#3a3128";
  ctx.fillRect(0, H * 0.7, W, H * 0.3);

  // window onto the night city
  ctx.fillStyle = "#22262c";
  ctx.fillRect(W * 0.05, H * 0.16, W * 0.21, H * 0.32);
  ctx.fillStyle = "#2f4356";
  ctx.fillRect(W * 0.06, H * 0.17, W * 0.19, H * 0.3);
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = "rgba(255,214,150,0.5)";
    ctx.fillRect(W * 0.06 + r() * W * 0.19, H * 0.17 + r() * H * 0.3, 4, 3);
  }

  // bed
  ctx.fillStyle = "#5a6270";
  ctx.fillRect(W * 0.02, H * 0.6, W * 0.33, H * 0.2);
  ctx.fillStyle = "#7c6a8a";
  ctx.fillRect(W * 0.02, H * 0.58, W * 0.33, H * 0.06);
  ctx.fillStyle = "#c9c2b4";
  ctx.fillRect(W * 0.04, H * 0.55, W * 0.09, H * 0.05);

  // shelves: books and a football
  ctx.fillStyle = "#5c4634";
  ctx.fillRect(W * 0.4, H * 0.26, W * 0.28, 11);
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = ["#7a4438", "#3a5a6a", "#8a7a4a", "#5a4a6a"][i % 4];
    const h = 30 + r() * 34;
    ctx.fillRect(W * 0.41 + i * 26, H * 0.26 - h, 18, h);
  }
  ctx.fillStyle = "#efece2";
  ctx.beginPath();
  ctx.arc(W * 0.645, H * 0.235, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#26241f";
  ctx.beginPath();
  ctx.arc(W * 0.645, H * 0.235, 8, 0, Math.PI * 2);
  ctx.fill();

  // basketball on the floor
  ctx.fillStyle = "#b4642f";
  ctx.beginPath();
  ctx.arc(W * 0.29, H * 0.88, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7a3f1c";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(W * 0.29, H * 0.88, 25, 0, Math.PI * 2);
  ctx.moveTo(W * 0.29 - 25, H * 0.88);
  ctx.lineTo(W * 0.29 + 25, H * 0.88);
  ctx.stroke();

  // desk + CRT — the focal point
  ctx.fillStyle = "#6b5238";
  ctx.fillRect(W * 0.55, H * 0.62, W * 0.42, 16);
  ctx.fillStyle = "#523f2c";
  ctx.fillRect(W * 0.57, H * 0.64, 16, H * 0.24);
  ctx.fillRect(W * 0.93, H * 0.64, 16, H * 0.24);
  ctx.fillStyle = "#c6c0ae";
  ctx.fillRect(W * 0.65, H * 0.35, W * 0.21, H * 0.27);
  ctx.fillStyle = "#1b1f22";
  ctx.fillRect(W * 0.665, H * 0.37, W * 0.18, H * 0.21);
  const scr = ctx.createLinearGradient(W * 0.665, H * 0.37, W * 0.845, H * 0.58);
  scr.addColorStop(0, "#5fbfe0");
  scr.addColorStop(0.55, "#3f7f5a");
  scr.addColorStop(1, "#2a5a44");
  ctx.fillStyle = scr;
  ctx.fillRect(W * 0.672, H * 0.377, W * 0.166, H * 0.196);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(W * 0.695, H * 0.5, 30, 22);
  ctx.fillStyle = "rgba(255,240,180,0.55)";
  ctx.fillRect(W * 0.775, H * 0.47, 18, 26);
  const glow = ctx.createRadialGradient(W * 0.755, H * 0.475, 10, W * 0.755, H * 0.475, 470);
  glow.addColorStop(0, "rgba(120,210,235,0.32)");
  glow.addColorStop(1, "rgba(120,210,235,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#3f4247";
  ctx.fillRect(W * 0.67, H * 0.6, W * 0.15, 12);

  speckle(ctx, W, H, 2600, 33);
  return toTexture(cv);
}

/** The mother, seated. Two frames: doing something, and looking at him. */
export function paintMother(looking: boolean): THREE.CanvasTexture {
  const W = 300;
  const H = 420;
  const { cv, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2;

  // seated body in a warm robe
  const g = ctx.createLinearGradient(cx - 70, 0, cx + 70, 0);
  g.addColorStop(0, "#b8607a");
  g.addColorStop(0.6, "#9c4f66");
  g.addColorStop(1, "#7d3f52");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - 56, H * 0.95);
  ctx.lineTo(cx - 46, H * 0.42);
  ctx.quadraticCurveTo(cx, H * 0.34, cx + 46, H * 0.42);
  ctx.lineTo(cx + 58, H * 0.95);
  ctx.fill();
  // lap / knees
  ctx.fillStyle = "#8c4459";
  ctx.fillRect(cx - 58, H * 0.78, 118, H * 0.17);
  // arm resting
  ctx.strokeStyle = "#a8556d";
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + 40, H * 0.5);
  ctx.lineTo(cx + 54, H * 0.76);
  ctx.stroke();

  // head — turned toward him when looking
  const hx = cx + (looking ? -12 : 4);
  ctx.fillStyle = "#e0b189";
  ctx.beginPath();
  ctx.ellipse(hx, H * 0.26, 40, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  // hair, pulled back
  ctx.fillStyle = "#241a18";
  ctx.beginPath();
  ctx.ellipse(hx + 4, H * 0.2, 44, 38, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + 22, H * 0.3, 18, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  // eye + a small smile only when looking
  ctx.fillStyle = "#2a1d17";
  ctx.beginPath();
  ctx.ellipse(hx - (looking ? 14 : 8), H * 0.26, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a8695a";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (looking) {
    ctx.moveTo(hx - 18, H * 0.335);
    ctx.quadraticCurveTo(hx - 8, H * 0.352, hx + 2, H * 0.332);
  } else {
    ctx.moveTo(hx - 14, H * 0.34);
    ctx.lineTo(hx + 2, H * 0.339);
  }
  ctx.stroke();

  return toTexture(cv);
}
