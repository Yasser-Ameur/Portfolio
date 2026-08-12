"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

function Football({ reduced }: { reduced: boolean | null }) {
  const [kicked, setKicked] = useState(false);

  return (
    <motion.g
      data-football
      animate={kicked ? { x: 320, y: -64, opacity: [1, 0.85] } : { x: 0, y: 0 }}
      transition={kicked ? { duration: 1.1, ease: "easeIn" } : { duration: 0 }}
      style={{ cursor: "pointer" }}
    >
      <motion.circle
        cx={620}
        cy={534}
        r="26"
        fill="#10161c"
        stroke="#cfd4d8"
        strokeWidth="1.5"
        whileHover={kicked ? undefined : { scale: 1.12 }}
        whileTap={kicked ? undefined : { scale: 0.95 }}
        onTap={kicked || reduced ? undefined : () => setKicked(true)}
      />
    </motion.g>
  );
}

export function ChildhoodScene() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* warm night wall */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 720" preserveAspectRatio="none">
        <defs>
          <linearGradient id="childWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a110b" />
            <stop offset="1" stopColor="#0e0805" />
          </linearGradient>
          <linearGradient id="childSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1224" />
            <stop offset="1" stopColor="#141c33" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1440" height="720" fill="url(#childWall)" />

        {/* window with night sky */}
        <rect x="110" y="80" width="300" height="300" rx="6" fill="url(#childSky)" />
        <circle cx="360" cy="150" r="26" fill="#e9d7a8" />
        <circle cx="150" cy="140" r="1.6" fill="#f2ead9" />
        <circle cx="250" cy="110" r="1.2" fill="#f2ead9" />
        <circle cx="190" cy="220" r="1.4" fill="#f2ead9" />
        <circle cx="330" cy="250" r="1.2" fill="#f2ead9" />
        <rect x="110" y="80" width="300" height="300" rx="6" fill="none" stroke="#241509" strokeWidth="14" />
        <line x1="260" y1="80" x2="260" y2="380" stroke="#241509" strokeWidth="12" />
        <line x1="110" y1="230" x2="410" y2="230" stroke="#241509" strokeWidth="12" />

        {/* floor */}
        <rect x="0" y="560" width="1440" height="160" fill="#0b0705" />
        <line x1="0" y1="560" x2="1440" y2="560" stroke="#1c110a" strokeWidth="3" />

        {/* rug */}
        <ellipse cx="720" cy="566" rx="190" ry="22" fill="#170d09" />

        {/* shelf with toys */}
        <rect x="470" y="420" width="220" height="16" rx="3" fill="#241408" />
        <rect x="478" y="436" width="30" height="124" fill="#241408" />
        <rect x="642" y="436" width="30" height="124" fill="#241408" />
        <rect x="496" y="392" width="26" height="28" rx="3" fill="#3a1d0c" />
        <rect x="536" y="376" width="30" height="44" rx="3" fill="#4a2210" />
        <circle cx="610" cy="398" r="15" fill="#2f3f52" />

        {/* bed */}
        <rect x="1030" y="560" width="360" height="40" fill="#2a1409" />
        <rect x="1030" y="470" width="360" height="90" rx="10" fill="#33200f" />
        <rect x="1008" y="440" width="26" height="130" rx="6" fill="#2a1409" />
        <rect x="1386" y="440" width="26" height="130" rx="6" fill="#2a1409" />
        <rect x="1048" y="430" width="60" height="52" rx="12" fill="#4a3a22" />
        <path d="M1030,486 Q1090,470 1150,486 Q1200,500 1260,496 L1260,560 L1030,560 Z" fill="#2b1a0c" />
        <circle cx="1340" cy="470" r="9" fill="#3a2a15" />
        <circle cx="1360" cy="470" r="9" fill="#3a2a15" />

        {/* lamp */}
        <rect x="920" y="430" width="12" height="130" fill="#1c0f07" />
        <path d="M900,428 L952,428 L940,408 L912,408 Z" fill="#c98d4a" />
      </svg>

      {/* lamp glow */}
      <div
        className="absolute blur-2xl"
        style={{
          left: "64%",
          top: "50%",
          width: "16rem",
          height: "16rem",
          background: "radial-gradient(closest-side, rgb(217 154 91 / 0.22), transparent 70%)",
        }}
      />

      {/* kicking the ball */}
      {!reduced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1] }}
          transition={{ delay: 2.4, duration: 3, times: [0, 0.2, 1] }}
          className="pointer-events-none absolute bottom-[21%] left-[40%] font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember/70"
        >
          kick the ball
        </motion.div>
      )}

      <motion.svg
        viewBox="0 0 1440 720"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <Football reduced={reduced} />
      </motion.svg>

      {/* television glow, faint and alive */}
      <div
        className="absolute animate-pulse-soft blur-xl"
        style={{
          right: "3%",
          bottom: "0%",
          width: "7rem",
          height: "5rem",
          background: "radial-gradient(closest-side, rgb(240 189 125 / 0.28), transparent 75%)",
        }}
      />
    </div>
  );
}
