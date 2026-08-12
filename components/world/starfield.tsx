"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/animation/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type Star = {
  x: number;
  y: number;
  r: number;
  depth: number;
  base: number;
  speed: number;
  phase: number;
};

type Shooter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

const DEPTHS = [0.12, 0.3, 0.55, 0.8];

export function Starfield({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stars: Star[] = [];
    const shooters: Shooter[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    let nextShootAt = 0;
    const t0 = performance.now();

    const build = () => {
      const count = Math.min(900, Math.round((w * h) / 1100));
      stars = Array.from({ length: count }, () => {
        const depth = DEPTHS[Math.floor(Math.random() * DEPTHS.length)];
        const faint = Math.random() < 0.85;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: (faint ? 0.45 : 0.9) * (0.6 + depth * 0.9),
          depth,
          base: 0.35 + Math.random() * 0.6,
          speed: 0.6 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const spawnShooter = () => {
      const fromLeft = Math.random() < 0.5;
      shooters.push({
        x: fromLeft
          ? Math.random() * w * 0.35
          : w * (0.65 + Math.random() * 0.35),
        y: Math.random() * h * 0.4,
        vx: (fromLeft ? 1 : -1) * (2.2 + Math.random() * 1.3),
        vy: 0.8 + Math.random() * 0.6,
        life: 0,
        maxLife: 110,
      });
    };

    const draw = (now: number) => {
      const elapsed = (now - t0) / 1000;
      px += (tx - px) * 0.055;
      py += (ty - py) * 0.055;

      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const twinkle = reduced
          ? 1
          : 0.55 + 0.45 * Math.sin(elapsed * s.speed + s.phase);
        ctx.globalAlpha = s.base * (0.35 + 0.65 * twinkle);
        ctx.fillStyle = "#e9e4d5";
        ctx.beginPath();
        ctx.arc(
          ((s.x + px * s.depth) + w) % w,
          ((s.y + py * s.depth) + h) % h,
          s.r,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!reduced) {
        if (now > nextShootAt) {
          spawnShooter();
          nextShootAt = now + 6500 + Math.random() * 9000;
        }

        ctx.globalCompositeOperation = "lighter";
        for (let i = shooters.length - 1; i >= 0; i--) {
          const sh = shooters[i];
          sh.x += sh.vx;
          sh.y += sh.vy;
          sh.life += 1;
          if (sh.life > sh.maxLife) {
            shooters.splice(i, 1);
            continue;
          }
          const fade = 1 - sh.life / sh.maxLife;
          const tailX = sh.x - sh.vx * 16;
          const tailY = sh.y - sh.vy * 16;
          const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255,243,222,${0.85 * fade})`);
          grad.addColorStop(1, "rgba(255,243,222,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
          ctx.fillStyle = `rgba(255,248,232,${0.55 * fade})`;
          ctx.beginPath();
          ctx.arc(sh.x, sh.y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }

      raf = requestAnimationFrame(draw);
    };

    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2 * 30;
      ty = (e.clientY / window.innerHeight - 0.5) * 2 * 20;
    };

    resize();
    nextShootAt = performance.now() + 3500;
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
}
