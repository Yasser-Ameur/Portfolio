"use client";

import { motion, useReducedMotion } from "motion/react";

const WINDOW_BANDS = [0, 1, 2, 3, 4];

/**
 * Milestone 06 — EPFL. A stylized modern campus at dusk by the lake.
 * Clean geometric volumes, warm-lit windows, and the long curved shell
 * that gives the place its recognisably calm, rigorous mood.
 */
export function EpflScene({ active }: { active: boolean }) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 720"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="epflSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1330" />
            <stop offset="0.55" stopColor="#1a2c55" />
            <stop offset="0.8" stopColor="#4a4a6e" />
            <stop offset="1" stopColor="#a4685a" />
          </linearGradient>
          <linearGradient id="epflLake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#23365e" />
            <stop offset="1" stopColor="#101a33" />
          </linearGradient>
          <linearGradient id="epflBldg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b2440" />
            <stop offset="1" stopColor="#0f1628" />
          </linearGradient>
          <linearGradient id="epflShell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#202b49" />
            <stop offset="1" stopColor="#141c33" />
          </linearGradient>
          <linearGradient id="epflGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0e1626" />
            <stop offset="1" stopColor="#070d18" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1440" height="720" fill="url(#epflSky)" />

        {/* first stars */}
        <g fill="#e6e0d2" opacity="0.8">
          <circle cx="120" cy="70" r="1.2" />
          <circle cx="320" cy="110" r="1" />
          <circle cx="520" cy="60" r="1.3" />
          <circle cx="880" cy="90" r="1" />
          <circle cx="1230" cy="70" r="1.2" />
        </g>

        {/* the lake */}
        <rect x="0" y="420" width="1440" height="90" fill="url(#epflLake)" />
        <ellipse cx="760" cy="452" rx="300" ry="6" fill="rgba(240,189,125,0.08)" />
        <ellipse cx="1080" cy="470" rx="180" ry="4" fill="rgba(240,189,125,0.05)" />

        {/* distant shore */}
        <path d="M0,420 L0,372 L150,372 L150,396 L260,396 L260,420 Z" fill="#1a2340" />
        <path d="M1240,420 L1240,384 L1330,384 L1330,360 L1400,360 L1400,420 Z" fill="#1a2340" />

        {/* campus — cubic teaching blocks */}
        <g fill="url(#epflBldg)">
          <path d="M330,420 L330,300 L520,300 L520,420 Z" />
          <path d="M540,420 L540,320 L700,320 L700,420 Z" />
          <path d="M800,420 L800,336 L950,336 L950,420 Z" />
          <path d="M1010,420 L1010,306 L1160,306 L1160,420 Z" />
        </g>

        {/* warm window bands */}
        {WINDOW_BANDS.map((b) => (
          <rect
            key={`a${b}`}
            x="356"
            y={310 + b * 22}
            width="138"
            height="9"
            rx="4.5"
            fill="rgba(240,189,125,0.55)"
          />
        ))}
        {WINDOW_BANDS.map((b) => (
          <rect
            key={`b${b}`}
            x="1036"
            y={316 + b * 22}
            width="98"
            height="9"
            rx="4.5"
            fill="rgba(240,189,125,0.5)"
          />
        ))}
        <rect x="566" y="330" width="108" height="9" rx="4.5" fill="rgba(240,189,125,0.45)" />
        <rect x="566" y="366" width="108" height="9" rx="4.5" fill="rgba(240,189,125,0.45)" />
        <rect x="826" y="346" width="98" height="9" rx="4.5" fill="rgba(240,189,125,0.4)" />

        {/* the long curved shell */}
        <g>
          <path
            d="M600,420 C600,338 700,296 820,296 C960,296 1040,340 1040,420 Z"
            fill="url(#epflShell)"
          />
          <path
            d="M600,420 C600,330 720,290 820,290 C930,290 1040,336 1040,420"
            fill="none"
            stroke="rgba(160,190,225,0.25)"
            strokeWidth="3"
          />
          {/* entrances */}
          <path d="M770,420 C770,392 798,372 820,372 C842,372 870,392 870,420 Z" fill="#0b1220" />
          <path d="M832,420 C832,398 850,388 862,388 C874,388 892,398 892,420 Z" fill="#0b1220" />
        </g>

        {/* lampposts on the walkway */}
        <g>
          <rect x="186" y="420" width="7" height="140" fill="#0e1626" />
          <path d="M178,420 L200,420 L196,404 L182,404 Z" fill="#d8a867" />
          <rect x="1246" y="420" width="7" height="140" fill="#0e1626" />
          <path d="M1238,420 L1260,420 L1256,404 L1242,404 Z" fill="#d8a867" />
        </g>

        {/* pines */}
        <g fill="#0c1420">
          <path d="M250,560 L214,446 L286,446 Z" />
          <path d="M250,560 L226,484 L274,484 Z" />
          <path d="M1170,560 L1134,452 L1206,452 Z" />
          <path d="M1170,560 L1146,492 L1194,492 Z" />
        </g>

        {/* ground / walkway */}
        <rect x="0" y="560" width="1440" height="160" fill="url(#epflGround)" />
        <line x1="0" y1="560" x2="1440" y2="560" stroke="#16203a" strokeWidth="3" />
        {/* walkway seams */}
        <path d="M520,720 L620,560 L820,560 L920,720 Z" fill="rgba(255,255,255,0.02)" />
        <line x1="620" y1="560" x2="520" y2="720" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        <line x1="820" y1="560" x2="920" y2="720" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        <line x1="720" y1="560" x2="720" y2="720" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
      </svg>

      {/* warm lamplight pools */}
      <div
        className="pointer-events-none absolute blur-2xl"
        style={{
          left: "12%",
          top: "52%",
          width: "10rem",
          height: "10rem",
          background: "radial-gradient(closest-side, rgb(216 168 103 / 0.16), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute blur-2xl"
        style={{
          right: "10%",
          top: "52%",
          width: "10rem",
          height: "10rem",
          background: "radial-gradient(closest-side, rgb(216 168 103 / 0.16), transparent 70%)",
        }}
      />

      {/* quiet movement on the water */}
      {!reduced && active && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute blur-md"
          style={{
            left: "38%",
            top: "62%",
            width: "24%",
            height: "6%",
            background:
              "linear-gradient(90deg, transparent, rgba(242,234,217,0.05), transparent)",
          }}
          animate={{ x: ["-12%", "12%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
