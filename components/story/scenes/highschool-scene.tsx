"use client";

import { motion, useReducedMotion } from "motion/react";

const CLASSMATES: [number, number][] = [
  [300, 636],
  [360, 640],
  [430, 634],
  [500, 642],
  [560, 636],
  [940, 638],
  [1000, 634],
  [1070, 642],
  [1130, 636],
  [1190, 640],
];

/**
 * Milestone 04 — high school. A quiet assembly hall. The valedictorian stands
 * at the podium under a single warm light while the audience waits.
 */
export function HighSchoolScene({ active }: { active: boolean }) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 720"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hsRoom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b0e1d" />
            <stop offset="0.6" stopColor="#10142a" />
            <stop offset="1" stopColor="#060814" />
          </linearGradient>
          <linearGradient id="hsSpot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(240,189,125,0.4)" />
            <stop offset="1" stopColor="rgba(240,189,125,0)" />
          </linearGradient>
          <linearGradient id="hsStage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#151a2c" />
            <stop offset="1" stopColor="#0a0d1a" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1440" height="720" fill="url(#hsRoom)" />

        {/* chalkboard */}
        <g>
          <rect x="120" y="150" width="360" height="230" rx="6" fill="#0c1218" />
          <rect x="120" y="150" width="360" height="230" rx="6" fill="none" stroke="#1c2436" strokeWidth="10" />
          <path d="M170,200 L210,200 L250,162 M300,180 L350,180 M420,220 L390,272 M210,280 L260,250" stroke="rgba(240,240,240,0.28)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M320,300 Q360,285 400,302 M330,320 L370,320" stroke="rgba(240,240,240,0.18)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <rect x="290" y="130" width="34" height="14" rx="3" fill="#2c3547" />
        </g>

        {/* bunting curtain, upper right */}
        <g fill="#1a1f33">
          <path d="M1020,0 L1080,0 L1030,60 Z" />
          <path d="M1080,0 L1140,0 L1095,66 Z" />
          <path d="M1140,0 L1200,0 L1160,60 Z" />
          <path d="M1200,0 L1260,0 L1225,66 Z" />
          <path d="M1260,0 L1320,0 L1290,58 Z" />
        </g>

        {/* stage floor */}
        <rect x="0" y="520" width="1440" height="200" fill="url(#hsStage)" />
        <line x1="0" y1="520" x2="1440" y2="520" stroke="#1b2140" strokeWidth="4" />
        <rect x="470" y="560" width="500" height="18" rx="3" fill="#12162a" />
        <rect x="470" y="560" width="500" height="18" rx="3" fill="none" stroke="#1e2446" strokeWidth="2" />

        {/* audience heads */}
        {CLASSMATES.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="11" fill="#070a15" />
            <circle cx={x + 26} cy={y + 2} r="11" fill="#070a15" />
          </g>
        ))}
        <rect x="240" y="600" width="960" height="120" fill="#05070f" opacity="0.6" />

        {/* podium */}
        <g>
          <path d="M660,520 L780,520 L788,556 L652,556 Z" fill="#171c2e" />
          <path d="M660,520 L720,514 L720,556 L660,556 Z" fill="#0f1324" />
          <rect x="682" y="540" width="40" height="26" rx="3" fill="#10162a" transform="rotate(-6 702 553)" />
          <rect x="682" y="540" width="40" height="26" rx="3" fill="none" stroke="#c9a06a" strokeWidth="2" opacity="0.7" transform="rotate(-6 702 553)" />
        </g>

        {/* spotlight cone */}
        <path d="M700,0 L780,0 L830,520 L650,520 Z" fill="url(#hsSpot)" />
      </svg>

      {/* warm light pool on the floor around the podium */}
      <div
        className="pointer-events-none absolute blur-3xl"
        style={{
          left: "44%",
          top: "58%",
          width: "20rem",
          height: "14rem",
          background: "radial-gradient(closest-side, rgb(240 189 125 / 0.22), transparent 70%)",
        }}
      />

      {/* ember dust floating in the light */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.span
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-ember-bright/60"
              style={{ left: `${47 + i * 1.6}%`, top: `${52 - i * 2}%` }}
              animate={
                active
                  ? { y: [0, -70, 0], opacity: [0, 0.9, 0] }
                  : undefined
              }
              transition={{
                duration: 5 + i * 0.9,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
