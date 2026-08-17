"use client";

/**
 * LOWER WORLD — the Casablanca childhood neighbourhood.
 *
 * Augmented 2D, in the HGSS sense: **every visible surface is painted art on a
 * quad.** Buildings are painted elevations, the street is a painted tilemap,
 * cars and trees and kids are painted sprites. Three.js supplies world
 * position, depth sorting and the camera — nothing else. No primitives.
 *
 * Authored against docs/CASABLANCA_REFERENCE.md.
 *
 * Geography: the street runs east–west and falls toward the Atlantic. From the
 * enclosed upper end the sea is hidden behind the far row; walking west, the
 * row ends and the view opens down the road to the water and the Hassan II
 * Mosque. Elevation is the cause. The view is the effect.
 */

import * as THREE from "three";
import {
  STREET_TILE_M,
  STREET_WIDTH_M,
  facadeSize,
  paintCar,
  paintFacade,
  paintFence,
  paintKid,
  paintPitch,
  paintStreet,
  paintStreetlight,
  paintTree,
  type FacadeOpts,
} from "@/render/paint-city";
import { blobShadowTexture } from "@/render/textures";

export const MOROCCO_PALETTE = {
  sky: "#a6c9de",
  haze: "#d3ded9",
  sun: "#ffdcaa",
  ambient: "#bcd4e4",
  ground: "#6d6f70",
  accent: "#c8407a",
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/** Ground height in metres. The street falls away to the west, toward the sea. */
export function heightAt(x: number, _z: number): number {
  const slope = smooth(clamp((x + 8) / 36, 0, 1)) * 3.6;
  let steps = 0;
  for (const s of [
    { x: 0.0, r: 0.5 },
    { x: 9.0, r: 0.45 },
  ]) {
    steps += smooth(clamp((x - s.x) / 1.6, 0, 1)) * s.r;
  }
  return slope + steps;
}

// --- layout ----------------------------------------------------------------

export type Box = { x0: number; x1: number; z0: number; z1: number };

/** The far row of apartment blocks, with a gap where the pitch sits. */
const BLOCKS: { box: Box; opts: FacadeOpts }[] = [
  { box: { x0: -16, x1: -9.4, z0: -9, z1: -5.6 }, opts: { floors: 4, bays: 3, tone: "#d6c9ae", ground: "shops", seed: 12 } },
  { box: { x0: -8.6, x1: -1.6, z0: -9, z1: -5.6 }, opts: { floors: 5, bays: 3, tone: "#e0d5bc", ground: "shops", seed: 31 } },
  { box: { x0: -0.8, x1: 6.2, z0: -9, z1: -5.6 }, opts: { floors: 5, bays: 3, tone: "#cfc6bb", ground: "entrance", seed: 47 } },
  { box: { x0: 7.0, x1: 13.4, z0: -9, z1: -5.6 }, opts: { floors: 4, bays: 3, tone: "#c9b394", ground: "shops", seed: 63 } },
  { box: { x0: 26.0, x1: 33.0, z0: -9, z1: -5.6 }, opts: { floors: 5, bays: 3, tone: "#d8c2a4", ground: "shops", seed: 81 } },
];

/** The 5v5 pitch fills the gap in the row, right beside home. */
const PITCH: Box = { x0: 14.6, x1: 25.0, z0: -14.5, z1: -5.8 };

export const COLLIDERS: Box[] = [
  ...BLOCKS.map((b) => b.box),
  { x0: PITCH.x0, x1: 18.4, z0: PITCH.z1 - 0.1, z1: PITCH.z1 + 0.1 },
  { x0: 21.2, x1: PITCH.x1, z0: PITCH.z1 - 0.1, z1: PITCH.z1 + 0.1 },
  { x0: PITCH.x0 - 0.1, x1: PITCH.x0 + 0.1, z0: PITCH.z0, z1: PITCH.z1 },
  { x0: PITCH.x1 - 0.1, x1: PITCH.x1 + 0.1, z0: PITCH.z0, z1: PITCH.z1 },
  { x0: PITCH.x0, x1: PITCH.x1, z0: PITCH.z0 - 0.1, z1: PITCH.z0 + 0.1 },
  // the low camera-side parapet
  { x0: -18, x1: 34, z0: 5.4, z1: 5.9 },
];

export function resolveCollision(x: number, z: number, r: number) {
  let px = x;
  let pz = z;
  for (const b of COLLIDERS) {
    const nx = clamp(px, b.x0, b.x1);
    const nz = clamp(pz, b.z0, b.z1);
    const dx = px - nx;
    const dz = pz - nz;
    const d2 = dx * dx + dz * dz;
    if (d2 >= r * r) continue;
    if (d2 > 1e-6) {
      const d = Math.sqrt(d2);
      px = nx + (dx / d) * r;
      pz = nz + (dz / d) * r;
    } else {
      const m = Math.min(px - b.x0, b.x1 - px, pz - b.z0, b.z1 - pz);
      if (m === px - b.x0) px = b.x0 - r;
      else if (m === b.x1 - px) px = b.x1 + r;
      else if (m === pz - b.z0) pz = b.z0 - r;
      else pz = b.z1 + r;
    }
  }
  return { x: px, z: pz };
}

// --- build -----------------------------------------------------------------

type Built = { group: THREE.Group; update: (t: number) => void };

function tinyCanvas(w: number, h: number) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  return { cv, ctx: cv.getContext("2d")! };
}

function texOf(cv: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

export function buildMorocco(): Built {
  const group = new THREE.Group();
  const swayers: { m: THREE.Object3D; phase: number; amp: number }[] = [];

  /**
   * A painted sprite standing on the ground. `alphaTest` lets it write depth,
   * which is what gives correct occlusion against the character.
   */
  function sprite(
    tex: THREE.Texture,
    x: number,
    z: number,
    wM: number,
    hM: number,
    opts: { yaw?: number; alphaTest?: number; depthWrite?: boolean } = {},
  ) {
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: opts.alphaTest ?? 0.4,
      side: THREE.DoubleSide,
      toneMapped: false,
      depthWrite: opts.depthWrite ?? true,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(wM, hM), mat);
    m.geometry.translate(0, hM / 2, 0);
    m.position.set(x, heightAt(x, z), z);
    m.rotation.y = opts.yaw ?? 0;
    group.add(m);
    return m;
  }

  // ---- the street: one painted tile, repeated along its length ------------
  {
    const len = 68;
    const tex = paintStreet();
    tex.repeat.set(len / STREET_TILE_M, 1);
    const geo = new THREE.PlaneGeometry(len, STREET_WIDTH_M, 96, 1);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i) + 8, p.getZ(i)));
    const road = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
    );
    road.position.set(8, 0.01, -1.6);
    group.add(road);
  }

  // ---- the far row of apartment blocks ------------------------------------
  for (const b of BLOCKS) {
    const { wM, hM } = facadeSize(b.opts);
    sprite(paintFacade(b.opts), (b.box.x0 + b.box.x1) / 2, b.box.z1, wM, hM);
  }

  // ---- the 5v5 pitch in the gap -------------------------------------------
  {
    const w = PITCH.x1 - PITCH.x0;
    const d = PITCH.z1 - PITCH.z0;
    const cx = (PITCH.x0 + PITCH.x1) / 2;
    const cz = (PITCH.z0 + PITCH.z1) / 2;
    const turf = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({ map: paintPitch(), toneMapped: false }),
    );
    turf.rotation.x = -Math.PI / 2;
    turf.position.set(cx, heightAt(cx, cz) + 0.02, cz);
    group.add(turf);

    const fenceH = 2.4;
    function fence(cxx: number, czz: number, lenM: number, yaw: number) {
      const t = paintFence();
      t.repeat.set(lenM / 2, 1);
      const m = sprite(t, cxx, czz, lenM, fenceH, { yaw, alphaTest: 0.04, depthWrite: false });
      m.renderOrder = 2;
      return m;
    }
    fence((PITCH.x0 + 18.4) / 2, PITCH.z1, 18.4 - PITCH.x0, 0);
    fence((21.2 + PITCH.x1) / 2, PITCH.z1, PITCH.x1 - 21.2, 0);
    fence(PITCH.x0, cz, d, Math.PI / 2);
    fence(PITCH.x1, cz, d, Math.PI / 2);
  }

  // ---- street football: rocks marking two goals ---------------------------
  function rockTexture(seed: number) {
    const { cv, ctx } = tinyCanvas(64, 48);
    const r = rng(seed);
    ctx.clearRect(0, 0, 64, 48);
    const g = ctx.createLinearGradient(10, 4, 54, 44);
    g.addColorStop(0, "#bcb8ac");
    g.addColorStop(1, "#6b685f");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(5, 45);
    ctx.lineTo(12 + r() * 4, 16);
    ctx.lineTo(32, 5 + r() * 5);
    ctx.lineTo(54, 17 + r() * 4);
    ctx.lineTo(59, 45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,250,238,0.32)";
    ctx.beginPath();
    ctx.moveTo(12, 17);
    ctx.lineTo(32, 6);
    ctx.lineTo(37, 21);
    ctx.fill();
    ctx.fillStyle = "rgba(40,32,22,0.3)";
    ctx.fillRect(4, 43, 56, 5);
    return texOf(cv);
  }
  const rocks: [number, number, number][] = [
    [-3.4, -3.2, 0.36],
    [-3.1, 1.6, 0.32],
    [4.6, -3.3, 0.34],
    [4.9, 1.5, 0.38],
  ];
  rocks.forEach(([x, z, s], i) => sprite(rockTexture(7 + i * 13), x, z, s * 1.33, s));

  // the ball
  {
    const { cv, ctx } = tinyCanvas(64, 64);
    ctx.clearRect(0, 0, 64, 64);
    const g = ctx.createRadialGradient(24, 20, 2, 32, 32, 30);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#cbc6b6");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(32, 32, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#26241f";
    ctx.beginPath();
    ctx.moveTo(32, 15);
    ctx.lineTo(45, 25);
    ctx.lineTo(40, 41);
    ctx.lineTo(24, 41);
    ctx.lineTo(19, 25);
    ctx.fill();
    const ball = sprite(texOf(cv), 0.9, -0.6, 0.24, 0.24);
    ball.name = "football";
  }

  // ---- cars along the kerbs ------------------------------------------------
  const carTex = ["#8f3f3a", "#d8d6d0", "#9aa2a8", "#3f4a5c", "#b0aa9c"].map((c, i) =>
    paintCar(c, 3 + i * 7),
  );
  const cars: [number, number, number][] = [
    [-12.5, -4.6, 0],
    [-5.8, 3.6, 1],
    [2.6, 3.6, 2],
    [10.5, -4.6, 3],
    [19.0, 3.6, 4],
    [28.0, -4.6, 1],
  ];
  for (const [x, z, i] of cars) sprite(carTex[i], x, z, 4.2, 1.7);

  // ---- trees and streetlights ----------------------------------------------
  const treeTex = paintTree();
  for (const [x, z] of [
    [-10.0, 4.2],
    [1.0, -5.1],
    [12.0, 4.2],
    [24.0, -5.1],
  ] as const) {
    swayers.push({ m: sprite(treeTex, x, z, 3.4, 4.6), phase: x, amp: 0.01 });
  }
  const lampTex = paintStreetlight();
  for (const x of [-13, -3, 7, 17, 27]) sprite(lampTex, x, -5.2, 1.6, 5.6);

  // ---- friends --------------------------------------------------------------
  const shadowTex = blobShadowTexture();
  const kids: [number, number, string, string][] = [
    [-1.6, -2.2, "#c4453e", "#2f3f6b"],
    [2.2, 1.9, "#e0dcd0", "#3f5f3a"],
    [3.6, -1.4, "#3f6b8a", "#2b2b30"],
    [-4.6, 1.0, "#d8b447", "#2f3f6b"],
  ];
  kids.forEach(([x, z, shirt, shorts], i) => {
    const sh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.3),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false }),
    );
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(x, heightAt(x, z) + 0.02, z);
    group.add(sh);
    swayers.push({ m: sprite(paintKid(shirt, shorts, 11 + i * 5), x, z, 0.9, 1.25), phase: x * 2, amp: 0.012 });
  });

  // ---- camera-side parapet, kept below eye level ---------------------------
  {
    const { cv, ctx } = tinyCanvas(512, 96);
    const g = ctx.createLinearGradient(0, 0, 0, 96);
    g.addColorStop(0, "#dbd1bc");
    g.addColorStop(0.16, "#c9bea7");
    g.addColorStop(1, "#9a9080");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 96);
    ctx.fillStyle = "rgba(60,50,38,0.24)";
    ctx.fillRect(0, 13, 512, 5);
    const r = rng(313);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = r() > 0.5 ? "rgba(255,248,232,0.06)" : "rgba(60,48,34,0.07)";
      ctx.fillRect(r() * 512, r() * 96, 3, 3);
    }
    const t = texOf(cv);
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(11, 1);
    sprite(t, 8, 5.7, 54, 0.95);
  }

  // ---- the reveal: rooftops falling away, the sea, the mosque -------------
  {
    const { cv, ctx } = tinyCanvas(2048, 640);
    const r = rng(404);

    const sea = ctx.createLinearGradient(0, 296, 0, 640);
    sea.addColorStop(0, "#93b5c2");
    sea.addColorStop(1, "#6e94a7");
    ctx.fillStyle = sea;
    ctx.fillRect(0, 296, 2048, 344);
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.14})`;
      ctx.fillRect(r() * 2048, 300 + r() * 330, 20 + r() * 90, 2);
    }

    // the mosque — a landmark, off-centre, never a postcard
    const mx = 1420;
    ctx.fillStyle = "#dcd3bd";
    ctx.fillRect(mx - 130, 238, 260, 60);
    ctx.fillStyle = "#5f7d70";
    ctx.fillRect(mx - 138, 226, 276, 15);
    ctx.fillStyle = "#e6ddc7";
    ctx.fillRect(mx - 25, 30, 50, 210);
    ctx.fillStyle = "#cec4ab";
    ctx.fillRect(mx + 11, 30, 14, 210);
    ctx.fillStyle = "#5f7d70";
    ctx.fillRect(mx - 30, 14, 60, 18);
    ctx.fillStyle = "#4e6a5f";
    ctx.fillRect(mx - 9, -6, 18, 22);
    ctx.fillStyle = "rgba(92,112,102,0.45)";
    for (let i = 0; i < 5; i++) ctx.fillRect(mx - 21, 64 + i * 33, 42, 5);

    // rooftops between here and the water
    for (let i = 0; i < 340; i++) {
      const d = r();
      const bx = r() * 2048;
      const top = 300 - d * 92 - r() * 42;
      const h = 40 + r() * 90;
      const w = 40 + r() * 90;
      ctx.globalAlpha = 0.38 + d * 0.55;
      ctx.fillStyle = ["#ded0b4", "#d0c4ab", "#c9b394", "#e2d8c2", "#c2b6a4"][Math.floor(r() * 5)];
      ctx.fillRect(bx, top, w, h);
      ctx.fillStyle = "rgba(70,58,42,0.18)";
      ctx.fillRect(bx + w - 9, top, 9, h);
      ctx.fillStyle = "rgba(255,250,236,0.42)";
      ctx.fillRect(bx, top, w, 5);
      ctx.globalAlpha = 1;
    }
    const haze = ctx.createLinearGradient(0, 140, 0, 330);
    haze.addColorStop(0, "rgba(214,226,226,0.78)");
    haze.addColorStop(1, "rgba(214,226,226,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 140, 2048, 190);

    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(170, 53),
      new THREE.MeshBasicMaterial({ map: texOf(cv), transparent: true, toneMapped: false, depthWrite: false }),
    );
    backdrop.position.set(-60, 11, -40);
    backdrop.rotation.y = Math.PI / 2;
    backdrop.renderOrder = -10;
    group.add(backdrop);
  }

  return {
    group,
    update(t: number) {
      for (const s of swayers) s.m.rotation.z = Math.sin(t * 0.85 + s.phase) * s.amp;
    },
  };
}
