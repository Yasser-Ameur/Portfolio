"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/animation/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

const BODY = "#05070f";
const RIM = "rgba(240,189,125,0.55)";

/**
 * A stylized figure seen from behind, seated on the hill, gazing at the sky.
 * Pure original SVG silhouette — no external assets.
 */
export function Character({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <svg
        viewBox="0 0 140 180"
        className="h-auto w-full overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0a101f" />
            <stop offset="0.5" stopColor={BODY} />
            <stop offset="1" stopColor="#02030a" />
          </linearGradient>
        </defs>

        {/* ground shadow */}
        <ellipse cx="70" cy="170" rx="42" ry="7" fill="#000" opacity="0.55" />

        <motion.g
          animate={
            reduced
              ? undefined
              : { y: [0, -2.5, 0] }
          }
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* knees (legs folded forward, seen from behind) */}
          <ellipse cx="56" cy="140" rx="15" ry="13" fill="#02030a" />
          <ellipse cx="84" cy="140" rx="15" ry="13" fill="#02030a" />

          {/* torso + shoulders */}
          <path
            d="M54,50 C52,66 51,84 52,102 C53,118 56,126 60,132 L80,132 C84,126 87,118 88,102 C89,84 88,66 86,50 C82,44 58,44 54,50 Z"
            fill="url(#bodyGrad)"
          />

          {/* arms resting on knees */}
          <path
            d="M55,60 C46,66 42,78 44,92 C46,103 50,109 52,117 C54,121 60,119 58,113 C56,103 55,90 58,78 C60,71 59,65 57,58 Z"
            fill="#02040a"
          />
          <path
            d="M85,60 C94,66 98,78 96,92 C94,103 90,109 88,117 C86,121 80,119 82,113 C84,103 85,90 82,78 C80,71 81,65 83,58 Z"
            fill="#02040a"
          />
          <ellipse cx="50" cy="118" rx="5" ry="4.5" fill="#04060d" />
          <ellipse cx="90" cy="118" rx="5" ry="4.5" fill="#04060d" />

          {/* head */}
          <motion.g
            animate={
              reduced
                ? undefined
                : { rotate: [0, -1.4, 0, 0.8, 0] }
            }
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "70px", originY: "40px" }}
          >
            <circle cx="70" cy="32" r="15" fill="#04060d" />
          </motion.g>

          {/* warm rim light along the right silhouette */}
          <path
            d="M78,22 C82,27 84,33 84,40 C84,46 82,51 84,57 C90,65 96,77 96,90 C96,101 92,108 90,116"
            stroke={RIM}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </motion.g>
      </svg>
    </div>
  );
}
