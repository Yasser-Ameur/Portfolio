"use client";

import { AnimatePresence, animate, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECTS, type Project } from "@/content/projects";
import { EASINGS } from "@/lib/animation/motion";
import { usePrefersReducedMotion } from "@/lib/animation/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { FlowOSWorld } from "./visualizers/flowos-world";
import { MiniGoogleWorld } from "./visualizers/minigoogle-world";
import { NexusWorld } from "./visualizers/nexus-world";
import { NotiFlyWorld } from "./visualizers/notifly-world";
import { PulseWorld } from "./visualizers/pulse-world";
import { SatelliteWorld } from "./visualizers/satellite-world";

function World({ project, active }: { project: Project; active: boolean }) {
  switch (project.worldType) {
    case "minigoogle":
      return <MiniGoogleWorld active={active} />;
    case "notifly":
      return <NotiFlyWorld active={active} />;
    case "nexus":
      return <NexusWorld active={active} />;
    case "pulse":
      return <PulseWorld active={active} />;
    case "flowos":
      return <FlowOSWorld active={active} />;
    case "satellite":
      return (
        <SatelliteWorld
          name={project.name}
          pipeline={project.pipeline}
          accent={project.accent}
          active={active}
        />
      );
  }
}

function Identity({ project, visible }: { project: Project; visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 22 }}
      transition={{ duration: 0.8, ease: EASINGS.outExpo }}
      className="pointer-events-none flex flex-col items-center gap-3 px-6 text-center"
    >
      <p
        className="font-mono text-[0.6rem] uppercase tracking-[0.42em] sm:text-xs"
        style={{ color: project.accent }}
      >
        {project.tagline}
      </p>
      <h2 className="font-display text-3xl font-light text-starlight sm:text-5xl">
        {project.name}
      </h2>
      <p className="max-w-md text-xs leading-5 text-starlight-dim sm:text-sm">
        {project.description}
      </p>
      <ul className="mt-1 flex max-w-xl flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {project.technologies.slice(0, 6).map((t) => (
          <li
            key={t}
            className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-starlight-faint sm:text-[0.65rem]"
          >
            {t}
          </li>
        ))}
      </ul>
      <div className="pointer-events-auto mt-2 flex items-center gap-4">
        <Link
          href={`/projects/${project.slug}`}
          className="group flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-starlight-dim transition-colors duration-200 hover:text-ember-bright"
        >
          Details
          <span className="inline-block transition-transform duration-200 ease-out-soft group-hover:translate-x-1">
            →
          </span>
        </Link>
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-starlight-dim transition-colors duration-200 hover:text-ember-bright"
        >
          GitHub
          <svg
            aria-hidden="true"
            className="h-3 w-3 transition-transform duration-200 ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

export function ProjectWorld() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState<"settled" | "travel">("settled");
  const [veil, setVeil] = useState(0);
  const worldRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ index, phase });

  useEffect(() => {
    stateRef.current = { index, phase };
  });

  const travelTo = useCallback(
    (next: number) => {
      const { index: cur, phase: curPhase } = stateRef.current;
      if (curPhase === "travel") return;
      const clamped = Math.max(0, Math.min(PROJECTS.length - 1, next));
      if (clamped === cur) return;
      setDirection(clamped > cur ? 1 : -1);

      if (reduced) {
        setIndex(clamped);
        return;
      }

      setPhase("travel");
      void (async () => {
        await animate(0, 0.62, {
          duration: 0.3,
          ease: "easeIn",
          onUpdate: (v) => setVeil(v),
        });
        setIndex(clamped);
        await animate(0.62, 0, {
          duration: 0.9,
          ease: "easeOut",
          onUpdate: (v) => setVeil(v),
        });
        setPhase("settled");
      })();
    },
    [reduced]
  );

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") travelTo(stateRef.current.index + 1);
      if (e.key === "ArrowLeft") travelTo(stateRef.current.index - 1);
      if (e.key === "Home") travelTo(0);
      if (e.key === "End") travelTo(PROJECTS.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [travelTo]);

  // swipe
  useEffect(() => {
    const el = worldRef.current;
    if (!el) return;
    let startX = 0;
    const onStart = (e: PointerEvent) => {
      startX = e.clientX;
    };
    const onEnd = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 60) {
        travelTo(stateRef.current.index + (dx < 0 ? 1 : -1));
      }
    };
    el.addEventListener("pointerdown", onStart);
    el.addEventListener("pointerup", onEnd);
    return () => {
      el.removeEventListener("pointerdown", onStart);
      el.removeEventListener("pointerup", onEnd);
    };
  }, [travelTo]);

  const project = PROJECTS[index];

  return (
    <div
      ref={worldRef}
      className="relative h-dvh w-full touch-pan-y overflow-hidden bg-night-950"
    >
      {/* ambient backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 10%, #0a1222 0%, #05080f 55%, #02040a 100%)",
        }}
      />

      {/* the active world */}
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={project.slug}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d * 90, opacity: 0, scale: 0.99 }),
            center: { x: 0, opacity: 1, scale: 1 },
            exit: (d: number) => ({ x: d * -90, opacity: 0, scale: 0.99 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: EASINGS.outExpo }}
          className="absolute inset-0"
        >
          <World project={project} active={phase === "settled"} />
        </motion.div>
      </AnimatePresence>

      {/* travel veil */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-night-950"
        animate={{ opacity: veil }}
      />

      {/* system index */}
      <p className="absolute left-1/2 top-6 z-30 -translate-x-1/2 font-mono text-[0.6rem] uppercase tracking-[0.42em] text-starlight-faint sm:top-8">
        System {String(index + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
      </p>

      {/* the world */}
      <div className="absolute inset-x-0 top-0 bottom-[30%] z-10 sm:bottom-[32%]" />

      {/* identity */}
      <div className="pointer-events-none absolute inset-x-0 bottom-9 z-30 flex justify-center px-6 sm:bottom-12">
        <AnimatePresence mode="wait">
          <Identity key={project.slug} project={project} visible={phase === "settled"} />
        </AnimatePresence>
      </div>

      {/* progress dots */}
      <div className="absolute right-1/2 top-14 z-30 flex translate-x-1/2 items-center gap-2 sm:top-10">
        {PROJECTS.map((p, i) => (
          <button
            key={p.slug}
            aria-label={`Go to ${p.name}`}
            aria-current={i === index ? "step" : undefined}
            onClick={() => travelTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 ease-out-soft",
              i === index ? "w-6 bg-ember" : "w-1.5 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>

      {/* travel controls */}
      <div className="pointer-events-none absolute inset-x-4 bottom-7 z-30 flex items-center justify-between sm:inset-x-8">
        <button
          onClick={() => travelTo(index - 1)}
          disabled={index === 0 || phase === "travel"}
          aria-label="Previous project"
          className={cn(
            "group pointer-events-auto flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-starlight-dim transition-colors duration-200",
            "hover:text-ember-bright disabled:pointer-events-none disabled:opacity-25"
          )}
        >
          <span className="inline-block transition-transform duration-200 ease-out-soft group-hover:-translate-x-1">
            ←
          </span>
          Prev
        </button>
        <button
          onClick={() => travelTo(index + 1)}
          disabled={index === PROJECTS.length - 1 || phase === "travel"}
          aria-label="Next project"
          className={cn(
            "group pointer-events-auto flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-starlight-dim transition-colors duration-200",
            "hover:text-ember-bright disabled:pointer-events-none disabled:opacity-25"
          )}
        >
          Next
          <span className="inline-block transition-transform duration-200 ease-out-soft group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
