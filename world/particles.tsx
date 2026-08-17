"use client";

/**
 * The particle field.
 *
 * One canvas, one pooled array, no allocation in the loop. Dust hanging in
 * Moroccan afternoon light, motes around a desk lamp, snow on the way in to
 * Lausanne — the layer that stops flat vector from looking like a diagram.
 */

import { useEffect, useRef, type RefObject } from "react";
import type { Viewport } from "@/engine/space";
import type { ChapterId } from "@/engine/types";
import type { Palette } from "./palette";
import { withAlpha } from "./color";

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  seed: number;
};

export type ParticleField = {
  update: (dt: number, camX: number, zoom: number) => void;
};

type Spec = {
  count: number;
  color: string;
  drift: [number, number];
  size: [number, number];
  alpha: [number, number];
  /** Vertical bias — dust floats, snow falls. */
  fall: number;
  glow: boolean;
};

function specFor(chapterId: ChapterId, palette: Palette, narrow: boolean): Spec {
  const base = narrow ? 0.3 : 1;
  switch (chapterId) {
    case "yard":
      return {
        count: Math.round(220 * base),
        color: palette.key,
        drift: [6, 3],
        size: [0.6, 2.1],
        alpha: [0.1, 0.42],
        fall: 0.15,
        glow: true,
      };
    case "room":
      return {
        count: Math.round(120 * base),
        color: "#ffc987",
        drift: [3, 2],
        size: [0.5, 1.6],
        alpha: [0.08, 0.34],
        fall: 0.1,
        glow: true,
      };
    case "stage":
      return {
        count: Math.round(160 * base),
        color: palette.accent,
        drift: [4, 2],
        size: [0.6, 1.9],
        alpha: [0.08, 0.34],
        fall: 0.2,
        glow: true,
      };
    case "goodbye":
      return {
        count: Math.round(120 * base),
        color: "#cbb69c",
        drift: [10, 2],
        size: [0.5, 1.5],
        alpha: [0.06, 0.24],
        fall: 0.3,
        glow: false,
      };
    case "crossing":
      return {
        count: Math.round(90 * base),
        color: "#ffffff",
        drift: [40, 4],
        size: [0.8, 2.6],
        alpha: [0.05, 0.2],
        fall: 0.05,
        glow: false,
      };
    case "arrival":
      return {
        count: Math.round(260 * base),
        color: "#ffffff",
        drift: [8, 4],
        size: [0.7, 2.4],
        alpha: [0.12, 0.5],
        fall: 1,
        glow: false,
      };
    default:
      return {
        count: Math.round(70 * base),
        color: palette.key,
        drift: [3, 2],
        size: [0.5, 1.4],
        alpha: [0.05, 0.2],
        fall: 0.1,
        glow: false,
      };
  }
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

type Props = {
  fieldRef: RefObject<ParticleField | null>;
  viewport: Viewport;
  palette: Palette;
  chapterId: ChapterId;
};

export function Particles({ fieldRef, viewport, palette, chapterId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poolRef = useRef<Particle[]>([]);
  const specRef = useRef<Spec>(specFor(chapterId, palette, viewport.narrow));

  useEffect(() => {
    specRef.current = specFor(chapterId, palette, viewport.narrow);
    const pool = poolRef.current;
    const spec = specRef.current;
    // Grow or shrink the pool in place — never reallocate mid-journey.
    while (pool.length < spec.count) {
      pool.push({
        x: Math.random(),
        y: Math.random(),
        z: rand(0.35, 1),
        vx: 0,
        vy: 0,
        r: 1,
        a: 1,
        seed: Math.random() * 1000,
      });
    }
    pool.length = spec.count;
    for (const p of pool) {
      p.r = rand(spec.size[0], spec.size[1]);
      p.a = rand(spec.alpha[0], spec.alpha[1]);
      p.vx = rand(-spec.drift[0], spec.drift[0]);
      p.vy = rand(-spec.drift[1], spec.drift[1]) + spec.fall * 14;
    }
  }, [chapterId, palette, viewport.narrow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = viewport.width;
    const H = viewport.height;

    fieldRef.current = {
      update(dt, camX) {
        const spec = specRef.current;
        const pool = poolRef.current;
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = spec.glow ? "lighter" : "source-over";

        for (let i = 0; i < pool.length; i++) {
          const p = pool[i];
          p.x += (p.vx * dt) / W;
          p.y += (p.vy * dt) / H;

          if (p.y > 1.05) p.y = -0.05;
          if (p.y < -0.05) p.y = 1.05;
          if (p.x > 1.05) p.x = -0.05;
          if (p.x < -0.05) p.x = 1.05;

          // Parallax against the camera so the field has depth.
          const drift = ((-camX * 0.06 * p.z) / W) % 1;
          let sx = (p.x + drift) % 1;
          if (sx < 0) sx += 1;

          const wobble = Math.sin(p.seed + performance.now() * 0.0004) * 6;
          ctx.globalAlpha = p.a * p.z;
          ctx.fillStyle = spec.color;
          ctx.beginPath();
          ctx.arc(sx * W + wobble, p.y * H, p.r * p.z, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      },
    };

    return () => {
      fieldRef.current = null;
    };
  }, [viewport.width, viewport.height, fieldRef]);

  return (
    <canvas
      ref={canvasRef}
      className="world-particles"
      aria-hidden="true"
      style={{
        width: viewport.width,
        height: viewport.height,
        // A whisper of the chapter's haze keeps particles inside the palette.
        color: withAlpha(palette.haze, 0.5),
      }}
    />
  );
}
