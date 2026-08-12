"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Character } from "@/components/world/character";
import { Clouds } from "@/components/world/clouds";
import { Moon } from "@/components/world/moon";
import { ParallaxLayer } from "@/components/world/parallax-layer";
import { Starfield } from "@/components/world/starfield";
import { Terrain } from "@/components/world/terrain";
import { EASINGS } from "@/lib/animation/motion";
import { usePrefersReducedMotion } from "@/lib/animation/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { MainMenu, type MenuItem } from "./main-menu";

const MENU_ITEMS: MenuItem[] = [
  { label: "My Story", href: "/story" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Resume", href: "/resume", hint: "↓" },
];

function usePointerParallax(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;

    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };

    const loop = () => {
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      root.style.setProperty("--px", `${px.toFixed(4)}px`);
      root.style.setProperty("--py", `${py.toFixed(4)}px`);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return ref;
}

export function HomeWorld() {
  const reduced = usePrefersReducedMotion();
  const sceneRef = usePointerParallax(!reduced);
  const [menuHovered, setMenuHovered] = useState(false);

  return (
    <div
      ref={sceneRef}
      className="relative h-dvh w-full overflow-hidden bg-night-950"
    >
      {/* sky gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #02030a 0%, #04060d 38%, #0a1224 68%, #111a30 88%, #0c1322 100%)",
        }}
      />

      {/* stars */}
      <Starfield className="opacity-90" />

      {/* moon */}
      <ParallaxLayer x={9} y={5}>
        <Moon className="right-[8%] top-[9%] h-24 w-24 sm:right-[12%] sm:top-[10%] sm:h-36 sm:w-36" />
      </ParallaxLayer>

      {/* drifting clouds */}
      <Clouds />

      {/* mountain + hill silhouettes */}
      <Terrain />

      {/* warm pool of light around the character */}
      <ParallaxLayer x={60} y={24} className="inset-auto bottom-[4vh] left-[62%] -translate-x-1/2">
        <div
          aria-hidden="true"
          className="h-96 w-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(closest-side, rgb(217 154 91 / 0.20), transparent 70%)",
          }}
        />
      </ParallaxLayer>

      {/* the stargazer */}
      <ParallaxLayer
        x={64}
        y={26}
        className="inset-auto bottom-[4.5vh] left-[62%] w-[7.5rem] -translate-x-1/2 opacity-90 sm:bottom-[7vh] sm:left-[66%] sm:w-[12rem] sm:opacity-95 lg:w-[13.5rem]"
      >
        <div data-char>
          <Character />
        </div>
      </ParallaxLayer>

      {/* title + menu */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-5">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: EASINGS.outExpo }}
          className="font-mono text-[0.6rem] uppercase tracking-[0.5em] text-ember sm:text-xs"
        >
          An interactive portfolio
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.7, ease: EASINGS.outExpo }}
          className="mt-4 text-center font-display text-[clamp(2.5rem,9vw,5.5rem)] font-light leading-[0.95] tracking-tight text-starlight"
        >
          Yasser Ameur
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.42em] text-starlight-dim sm:text-xs"
        >
          Computer Science · EPFL
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.5, ease: EASINGS.outExpo }}
          className="mt-10"
        >
          <MainMenu items={MENU_ITEMS} onHoverChange={setMenuHovered} />
        </motion.div>
      </div>

      {/* subtle scene response while browsing the menu */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-20 transition-opacity duration-700 ease-out-soft",
          menuHovered ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 78%, rgb(217 154 91 / 0.07), transparent 70%)",
        }}
      />

      {/* faint vignette for cinematic depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 42%, transparent 55%, rgb(1 2 5 / 0.55) 100%)",
        }}
      />
    </div>
  );
}
