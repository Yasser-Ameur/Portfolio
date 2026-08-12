"use client";

import { AnimatePresence, animate, motion, MotionValue } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { EASINGS } from "@/lib/animation/motion";
import { usePrefersReducedMotion } from "@/lib/animation/use-prefers-reduced-motion";
import { MILESTONES, type Milestone } from "@/lib/story/milestones";
import { cn } from "@/lib/utils";
import { characterScale, StoryCharacter, type CharacterPose } from "./story-character";
import { ChildhoodScene } from "./scenes/childhood-scene";
import { MarrakechScene } from "./scenes/marrakech-scene";

const SCENES: ((props: { active: boolean }) => ReactNode)[] = [
  () => <ChildhoodScene />,
  () => <MarrakechScene />,
  () => null,
  () => null,
  () => null,
  () => null,
  () => null,
];

function Caption({ milestone, visible }: { milestone: Milestone; visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 18 }}
      transition={{ duration: 0.7, ease: EASINGS.outExpo }}
      className="pointer-events-none flex max-w-xl flex-col items-center gap-2 text-center"
    >
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.42em] text-ember sm:text-xs">
        {milestone.location}
      </p>
      {milestone.caption.map((line) => (
        <p
          key={line}
          className="font-display text-xl font-light leading-snug text-starlight sm:text-3xl"
        >
          {line}
        </p>
      ))}
      {milestone.note?.map((line) => (
        <p
          key={line}
          className="mt-1 text-xs leading-5 text-starlight-dim sm:text-sm"
        >
          {line}
        </p>
      ))}
    </motion.div>
  );
}

export function StoryWorld() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"settled" | "travel">("settled");
  const [camera] = useState(() => new MotionValue(0));
  const [veil] = useState(() => new MotionValue(0));
  const worldRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ index, phase });

  useEffect(() => {
    stateRef.current = { index, phase };
  });

  const travelTo = useCallback(
    (next: number) => {
      const { index: cur, phase: curPhase } = stateRef.current;
      if (curPhase === "travel") return;
      const clamped = Math.max(0, Math.min(MILESTONES.length - 1, next));
      if (clamped === cur) return;

      const vw = worldRef.current?.clientWidth ?? window.innerWidth;
      const to = clamped * vw;
      const dist = Math.abs(to - camera.get()) / vw;
      const dur = Math.min(3, 1.3 + dist * 0.85);

      setPhase("travel");

      if (reduced) {
        camera.jump(to);
        setIndex(clamped);
        setPhase("settled");
        return;
      }

      void (async () => {
        await animate(veil, 0.62, { duration: 0.35, ease: "easeIn" });
        await animate(camera, to, { duration: dur, ease: EASINGS.outExpo });
        setIndex(clamped);
        setPhase("settled");
        await animate(veil, 0, { duration: 0.8, ease: "easeOut" });
      })();
    },
    [camera, reduced, veil]
  );

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") travelTo(stateRef.current.index + 1);
      if (e.key === "ArrowLeft") travelTo(stateRef.current.index - 1);
      if (e.key === "Home") travelTo(0);
      if (e.key === "End") travelTo(MILESTONES.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [travelTo]);

  // swipe navigation
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

  const milestone = MILESTONES[index];
  const pose: CharacterPose = phase === "travel" ? "walk" : index === MILESTONES.length - 1 ? "proud" : "idle";
  const isLast = index === MILESTONES.length - 1;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-night-950">
      {/* the world strip */}
      <motion.div
        ref={worldRef}
        className="absolute inset-0"
        style={{ width: `${MILESTONES.length * 100}vw`, x: camera }}
      >
        {MILESTONES.map((m, i) => (
          <div
            key={m.id}
            className="absolute inset-y-0"
            style={{ left: `${i * 100}vw`, width: "100vw" }}
          >
            {SCENES[i]({ active: index === i })}
          </div>
        ))}
      </motion.div>

      {/* travel veil */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-night-950"
        style={{ opacity: veil }}
      />

      {/* the traveler */}
      <div
        className="pointer-events-none absolute bottom-[21%] left-1/2 z-30 w-12 -translate-x-1/2 sm:w-16"
        style={{ transformOrigin: "bottom center", scale: characterScale(milestone.stage) }}
      >
        <StoryCharacter stage={milestone.stage} pose={pose} />
      </div>

      {/* caption */}
      <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center px-6 sm:bottom-12">
        <AnimatePresence mode="wait">
          <Caption key={milestone.id} milestone={milestone} visible={phase === "settled"} />
        </AnimatePresence>
      </div>

      {/* progress */}
      <div className="absolute bottom-8 right-1/2 z-30 flex translate-x-1/2 items-center gap-2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:top-8 sm:translate-x-[-50%]">
        {MILESTONES.map((m, i) => (
          <button
            key={m.id}
            aria-label={`Go to ${m.location}`}
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
      <div className="absolute inset-x-4 bottom-6 z-30 flex items-center justify-between sm:inset-x-8">
        <button
          onClick={() => travelTo(index - 1)}
          disabled={index === 0 || phase === "travel"}
          aria-label="Previous milestone"
          className={cn(
            "group flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-starlight-dim transition-colors duration-200",
            "hover:text-ember-bright disabled:pointer-events-none disabled:opacity-25"
          )}
        >
          <span className="inline-block transition-transform duration-200 ease-out-soft group-hover:-translate-x-1">←</span>
          Prev
        </button>

        {isLast ? (
          <Link
            href="/projects"
            className="group relative rounded-full border border-ember/40 px-6 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-ember-bright transition-colors duration-300 hover:border-ember hover:bg-ember/10 sm:px-8"
          >
            Explore my projects
            <span className="ml-2 inline-block transition-transform duration-300 ease-out-soft group-hover:translate-x-1">→</span>
          </Link>
        ) : (
          <button
            onClick={() => travelTo(index + 1)}
            aria-label="Next milestone"
            className={cn(
              "group flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-starlight-dim transition-colors duration-200",
              "hover:text-ember-bright disabled:pointer-events-none disabled:opacity-25"
            )}
          >
            Next
            <span className="inline-block transition-transform duration-200 ease-out-soft group-hover:translate-x-1">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
