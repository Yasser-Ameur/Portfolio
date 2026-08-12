"use client";

import { motion, useReducedMotion } from "motion/react";

const BARS: [number, number][] = [
  [0, 46],
  [8, 58],
  [4, 34],
  [0, 64],
  [10, 48],
  [2, 26],
  [6, 55],
];

/**
 * Milestone 03 — the discovery. A dark room, a desk, a monitor facing the
 * character, and the first glow of "I could build worlds of my own."
 * The character stands at center, lit from the left by the screen.
 */
export function ProgrammingScene({ active }: { active: boolean }) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 720"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="progRoom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#04060d" />
            <stop offset="1" stopColor="#0a0e1a" />
          </linearGradient>
          <linearGradient id="progFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#070a12" />
            <stop offset="1" stopColor="#03040a" />
          </linearGradient>
          <linearGradient id="progDesk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14181f" />
            <stop offset="1" stopColor="#0a0d14" />
          </linearGradient>
          <linearGradient id="progWindow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1124" />
            <stop offset="1" stopColor="#111a33" />
          </linearGradient>
          <linearGradient id="progScreen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0b1a18" />
            <stop offset="1" stopColor="#0e2420" />
          </linearGradient>
          <linearGradient id="progGlowWash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(88,196,168,0.16)" />
            <stop offset="1" stopColor="rgba(88,196,168,0)" />
          </linearGradient>
          <clipPath id="progScreenClip">
            <path d="M300,392 L600,352 L600,552 L300,548 Z" />
          </clipPath>
        </defs>

        {/* room */}
        <rect x="0" y="0" width="1440" height="720" fill="url(#progRoom)" />

        {/* window — deep night, faint city */}
        <rect x="980" y="90" width="300" height="260" rx="4" fill="url(#progWindow)" />
        <circle cx="1248" cy="170" r="30" fill="#e9d7a8" opacity="0.85" />
        <circle cx="1010" cy="130" r="1.4" fill="#e6e0d2" />
        <circle cx="1080" cy="150" r="1" fill="#e6e0d2" />
        <circle cx="1220" cy="120" r="1.3" fill="#e6e0d2" />
        <rect x="980" y="90" width="300" height="260" rx="4" fill="none" stroke="#05070d" strokeWidth="16" />
        <line x1="1130" y1="90" x2="1130" y2="350" stroke="#05070d" strokeWidth="10" />

        {/* floor */}
        <rect x="0" y="560" width="1440" height="160" fill="url(#progFloor)" />
        <line x1="0" y1="560" x2="1440" y2="560" stroke="#0d111c" strokeWidth="3" />

        {/* screen glow spilling across the floor toward the character */}
        <path
          d="M300,560 L600,560 L900,700 L240,700 Z"
          fill="url(#progGlowWash)"
          opacity="0.9"
        />

        {/* desk */}
        <g>
          <path d="M120,586 L680,586 L672,606 L128,606 Z" fill="url(#progDesk)" />
          <rect x="150" y="606" width="22" height="114" fill="#0a0d14" />
          <rect x="620" y="606" width="22" height="114" fill="#0a0d14" />
          {/* screen glow reflected on the desktop */}
          <rect x="120" y="586" width="560" height="20" fill="rgba(88,196,168,0.05)" />
        </g>

        {/* keyboard */}
        <rect x="268" y="596" width="200" height="22" rx="4" fill="#0c101a" />
        <rect x="278" y="600" width="60" height="3.5" rx="1.5" fill="#1a2233" />
        <rect x="344" y="600" width="60" height="3.5" rx="1.5" fill="#1a2233" />
        <rect x="410" y="600" width="48" height="3.5" rx="1.5" fill="#1a2233" />

        {/* mug */}
        <rect x="604" y="566" width="26" height="20" rx="3" fill="#0e1420" />

        {/* lamp */}
        <g>
          <path d="M78,600 L96,600 L100,532 L74,532 Z" fill="#0d1118" />
          <path d="M60,506 L112,506 L104,528 L68,528 Z" fill="#d08a3e" />
          <rect x="80" y="528" width="12" height="8" fill="#1a1410" />
        </g>

        {/* monitor */}
        <g>
          <rect x="360" y="576" width="22" height="42" fill="#0a0d14" />
          <ellipse cx="371" cy="622" rx="22" ry="7" fill="#06080e" />
          {/* side + top of the shell */}
          <path d="M600,352 L616,358 L616,556 L600,552 Z" fill="#0c1018" />
          <path d="M300,392 L600,352 L616,358 L312,402 Z" fill="#0e141f" />
          {/* screen face */}
          <path d="M300,392 L600,352 L600,552 L300,548 Z" fill="url(#progScreen)" stroke="#16222e" strokeWidth="2" />
          {/* content */}
          <g clipPath="url(#progScreenClip)">
            <rect x="300" y="392" width="300" height="160" fill="url(#progScreen)" />
            {BARS.map(([pad, w], i) => {
              const y = 410 + i * 22;
              return (
                <motion.rect
                  key={i}
                  x={310 + pad}
                  y={y}
                  width={w}
                  height="6"
                  rx="3"
                  fill="rgba(108,226,196,0.75)"
                  animate={
                    reduced || !active
                      ? undefined
                      : { opacity: [0.5, 1, 0.7, 1, 0.55] }
                  }
                  transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.4 }}
                />
              );
            })}
            <motion.rect
              x={318}
              y={546}
              width="9"
              height="14"
              fill="#6ce4c4"
              animate={reduced || !active ? undefined : { opacity: [1, 1, 0, 0, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, times: [0, 0.45, 0.5, 0.92, 1] }}
            />
          </g>
          {/* cursor light on the character side */}
          <path d="M600,352 L620,396 L620,552 L600,552 Z" fill="rgba(108,226,196,0.18)" />
        </g>
      </svg>

      {/* soft screen glow toward the character */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{
          left: "24%",
          width: "30%",
          background:
            "linear-gradient(to right, rgba(88,196,168,0.16), transparent 75%)",
        }}
      />

      {/* lamp pool */}
      <div
        className="pointer-events-none absolute blur-2xl"
        style={{
          left: "3%",
          bottom: "6%",
          width: "14rem",
          height: "14rem",
          background: "radial-gradient(closest-side, rgb(217 154 91 / 0.2), transparent 70%)",
        }}
      />
    </div>
  );
}
