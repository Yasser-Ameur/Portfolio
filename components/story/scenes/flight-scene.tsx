"use client";

import { motion, useReducedMotion } from "motion/react";

const EDGE_LIGHTS = [430, 395, 358, 320, 282, 246, 210, 178];

/**
 * Milestone 05 — the journey. A terminal at night. One suitcase,
 * a plane on the tarmac, and a sky ahead. The most cinematic frame
 * of the story — keep the composition still and the light meaningful.
 */
export function FlightScene({ active }: { active: boolean }) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 720"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flyTerm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a0e1c" />
            <stop offset="0.7" stopColor="#10162a" />
            <stop offset="1" stopColor="#070a14" />
          </linearGradient>
          <linearGradient id="flyNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#050810" />
            <stop offset="1" stopColor="#0d1526" />
          </linearGradient>
          <linearGradient id="flyTarmac" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a0e18" />
            <stop offset="1" stopColor="#060810" />
          </linearGradient>
          <linearGradient id="flyFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#11162a" />
            <stop offset="1" stopColor="#070a14" />
          </linearGradient>
          <linearGradient id="flyGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(240,189,125,0.06)" />
            <stop offset="1" stopColor="rgba(240,189,125,0.16)" />
          </linearGradient>
        </defs>

        {/* interior */}
        <rect x="0" y="0" width="1440" height="720" fill="url(#flyTerm)" />

        {/* the window opening onto the night */}
        <rect x="620" y="96" width="780" height="464" fill="url(#flyNight)" />

        {/* stars beyond the glass */}
        <g fill="#e6e0d2">
          <circle cx="680" cy="150" r="1.2" />
          <circle cx="820" cy="130" r="1" />
          <circle cx="980" cy="170" r="1.3" />
          <circle cx="1120" cy="120" r="1" />
          <circle cx="1320" cy="150" r="1.2" />
          <circle cx="1240" cy="200" r="1" />
        </g>

        {/* tarmac */}
        <rect x="620" y="440" width="780" height="120" fill="url(#flyTarmac)" />
        <line x1="620" y1="440" x2="1400" y2="440" stroke="#111829" strokeWidth="2" />

        {/* runway edge lights receding */}
        {EDGE_LIGHTS.map((y, i) => (
          <circle
            key={i}
            cx={700 + i * 92}
            cy={y}
            r={i < 3 ? 3 : 2.4}
            fill="#d08a3e"
            opacity={0.9 - i * 0.1}
          />
        ))}

        {/* the plane */}
        <g>
          {/* tail fin */}
          <path d="M1230,300 L1216,238 L1260,238 L1254,300 Z" fill="#101828" />
          {/* fuselage */}
          <path d="M960,330 Q1090,286 1236,302 L1256,318 Q1230,398 1000,404 Q940,408 918,376 Q924,344 960,330 Z" fill="#0d1420" />
          {/* nose highlight */}
          <path d="M918,376 Q940,408 1000,404 Q930,400 918,376 Z" fill="#0a0f18" />
          {/* window line */}
          <path d="M980,330 Q1090,296 1230,308" stroke="#c9a06a" strokeWidth="3" fill="none" opacity="0.55" strokeDasharray="10 14" />
          {/* wing */}
          <path d="M1040,368 L1020,452 L960,452 L1000,368 Z" fill="#0d1420" />
          <path d="M1080,366 L1110,452 L1050,452 L1044,366 Z" fill="#111a2c" />
          {/* engine */}
          <ellipse cx="1020" cy="448" rx="20" ry="8" fill="#0a0f18" />
          {/* boarding light pool */}
          <ellipse cx="1060" cy="452" rx="90" ry="16" fill="rgba(240,189,125,0.16)" />
        </g>

        {/* window mullions */}
        <rect x="620" y="96" width="780" height="464" fill="none" stroke="#0c1120" strokeWidth="22" />
        <line x1="1000" y1="96" x2="1000" y2="560" stroke="#0c1120" strokeWidth="16" />
        <line x1="620" y1="330" x2="1400" y2="330" stroke="#0c1120" strokeWidth="12" />
        {/* glass sheen */}
        <rect x="620" y="96" width="780" height="464" fill="url(#flyGlass)" />

        {/* interior floor */}
        <rect x="0" y="560" width="1440" height="160" fill="url(#flyFloor)" />
        <line x1="0" y1="560" x2="1440" y2="560" stroke="#1a2040" strokeWidth="3" />
        {/* cool reflections from the window */}
        <path d="M620,560 L1400,560 L1200,720 L720,720 Z" fill="rgba(90,120,180,0.06)" />

        {/* interior ceiling light bar */}
        <rect x="160" y="60" width="300" height="10" rx="5" fill="#d8a867" opacity="0.5" />

        {/* suitcase beside the traveler */}
        <g>
          <rect x="858" y="496" width="58" height="64" rx="6" fill="#1a1626" />
          <rect x="858" y="496" width="58" height="64" rx="6" fill="none" stroke="#2a2440" strokeWidth="2" />
          <line x1="858" y1="524" x2="916" y2="524" stroke="#2a2440" strokeWidth="2" />
          <rect x="862" y="470" width="10" height="20" rx="5" fill="#241e36" />
        </g>
      </svg>

      {/* warm interior glow */}
      <div
        className="pointer-events-none absolute blur-3xl"
        style={{
          left: "6%",
          top: "4%",
          width: "20rem",
          height: "12rem",
          background: "radial-gradient(closest-side, rgb(216 168 103 / 0.14), transparent 70%)",
        }}
      />

      {/* faint moving sheen across the glass */}
      {!reduced && active && (
        <motion.div
          className="pointer-events-none absolute blur-sm"
          style={{
            left: "44%",
            top: "8%",
            width: "40%",
            height: "100%",
            background:
              "linear-gradient(105deg, transparent 40%, rgba(242,234,217,0.05) 50%, transparent 60%)",
          }}
          animate={{ x: ["-30%", "30%"] }}
          transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}
