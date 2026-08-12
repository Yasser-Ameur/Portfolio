"use client";

import { motion, useReducedMotion } from "motion/react";

const BIRDS: [number, number][] = [
  [380, 150],
  [420, 138],
  [1040, 200],
  [1080, 188],
];

/**
 * Milestone 07 — the high country. The emotional close: a golden alpine
 * viewpoint, layered peaks, and a still lake in the valley. The character
 * stands on the ledge with the whole journey behind them.
 */
export function MountainsScene({ active }: { active: boolean }) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 720"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mtSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1c2c" />
            <stop offset="0.45" stopColor="#16405a" />
            <stop offset="0.75" stopColor="#c97a52" />
            <stop offset="1" stopColor="#e9b882" />
          </linearGradient>
          <linearGradient id="mtFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a6484" />
            <stop offset="1" stopColor="#2c4058" />
          </linearGradient>
          <linearGradient id="mtMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#223a58" />
            <stop offset="1" stopColor="#142a40" />
          </linearGradient>
          <linearGradient id="mtNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f2038" />
            <stop offset="1" stopColor="#0a1526" />
          </linearGradient>
          <linearGradient id="mtLake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1c3a54" />
            <stop offset="1" stopColor="#12283c" />
          </linearGradient>
          <linearGradient id="mtGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(233,184,130,0.5)" />
            <stop offset="1" stopColor="rgba(233,184,130,0)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1440" height="720" fill="url(#mtSky)" />

        {/* sun glow */}
        <circle cx="720" cy="470" r="170" fill="url(#mtGlow)" />

        {/* high stars fading into daylight */}
        <g fill="#e6e0d2" opacity="0.55">
          <circle cx="180" cy="80" r="1.3" />
          <circle cx="420" cy="50" r="1" />
          <circle cx="1020" cy="70" r="1.2" />
          <circle cx="1300" cy="110" r="1" />
          <circle cx="600" cy="140" r="1" />
        </g>

        {/* birds */}
        {BIRDS.map(([x, y], i) => (
          <motion.path
            key={i}
            d={`M${x - 10},${y} Q${x - 5},${y - 6} ${x},${y} Q${x + 5},${y - 6} ${x + 10},${y}`}
            stroke="#0a1c2c"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            animate={reduced || !active ? undefined : { x: [0, 46, 0], y: [0, -10, 0] }}
            transition={{ duration: 16 + i * 3, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* far range */}
        <path
          d="M0,560 L0,420 L120,356 L260,430 L380,372 L520,452 L640,392 L760,470 L900,412 L1040,484 L1180,428 L1300,490 L1440,444 L1440,560 Z"
          fill="url(#mtFar)"
        />
        {/* mid range — the famous paired peaks */}
        <path
          d="M0,560 L0,470 L140,430 L260,494 L360,440 L470,560 Z"
          fill="url(#mtMid)"
        />
        <path
          d="M970,560 L1090,452 L1210,524 L1320,470 L1440,560 Z"
          fill="url(#mtMid)"
        />
        {/* snowline highlights */}
        <path
          d="M1090,452 L1130,486 L1114,490 L1090,484 L1068,492 L1052,486 Z"
          fill="rgba(232,240,250,0.8)"
        />
        <path
          d="M120,356 L150,380 L130,384 L118,378 L106,384 L96,376 Z"
          fill="rgba(232,240,250,0.7)"
        />

        {/* valley lake */}
        <rect x="0" y="500" width="1440" height="60" fill="url(#mtLake)" />
        <ellipse cx="720" cy="528" rx="360" ry="8" fill="rgba(233,184,130,0.14)" />

        {/* near ridge */}
        <path d="M0,560 L0,520 L90,500 L170,540 L280,510 L360,560 Z" fill="url(#mtNear)" />
        <path d="M1080,560 L1180,516 L1280,552 L1360,532 L1440,560 Z" fill="url(#mtNear)" />

        {/* the ledge in the foreground */}
        <path
          d="M0,560 L90,560 L120,600 L60,720 L0,720 Z"
          fill="#0a1526"
        />
        <path
          d="M1440,560 L1330,560 L1300,600 L1360,720 L1440,720 Z"
          fill="#0a1526"
        />
        <rect x="0" y="560" width="1440" height="160" fill="#071020" />
        <line x1="0" y1="560" x2="1440" y2="560" stroke="#0e2238" strokeWidth="3" />

        {/* warm light raking the ledge */}
        <path d="M560,560 L880,560 L820,720 L600,720 Z" fill="rgba(233,184,130,0.06)" />
      </svg>

      {/* rising warmth */}
      <div
        className="pointer-events-none absolute blur-3xl"
        style={{
          left: "50%",
          top: "52%",
          width: "26rem",
          height: "14rem",
          transform: "translateX(-50%)",
          background: "radial-gradient(closest-side, rgb(233 184 130 / 0.18), transparent 70%)",
        }}
      />

      {/* drifting valley mist */}
      {!reduced && active && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute blur-xl"
              style={{
                left: `${6 + i * 34}%`,
                top: "70%",
                width: "16rem",
                height: "5rem",
                background:
                  "radial-gradient(closest-side, rgba(160,200,220,0.12), transparent 70%)",
              }}
              animate={{ x: ["0%", "28%", "0%"] }}
              transition={{ duration: 26 + i * 7, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </>
      )}
    </div>
  );
}
