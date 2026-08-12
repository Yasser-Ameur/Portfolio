"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The quieter visualizer for supporting projects. Flagship worlds get rich
 * interactive system diagrams; supporting projects get a single halo around
 * their primary node and a data-driven subsystem spine. Deliberately calm so
 * it never competes with the flagship worlds.
 */

export function SatelliteWorld({
  name,
  pipeline,
  accent,
  active,
}: {
  name: string;
  pipeline: string[];
  accent: string;
  active: boolean;
}) {
  const reduced = useReducedMotion();
  const n = pipeline.length;
  const U = 100;

  return (
    <div
      className="absolute inset-x-0 bottom-[34%] top-8 sm:bottom-[36%]"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${U} ${U}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="satSpine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(242,234,217,0.05)" />
            <stop offset="0.5" stopColor="rgba(242,234,217,0.25)" />
            <stop offset="1" stopColor="rgba(242,234,217,0.05)" />
          </linearGradient>
        </defs>

        {/* orbit rings */}
        <circle
          cx={0.5 * U}
          cy={0.42 * U}
          r={0.12 * U}
          fill="none"
          stroke="rgba(242,234,217,0.1)"
          strokeWidth="0.25"
          strokeDasharray="1.4 1.6"
          opacity="0.7"
        />
        <circle
          cx={0.5 * U}
          cy={0.42 * U}
          r={0.19 * U}
          fill="none"
          stroke="rgba(242,234,217,0.06)"
          strokeWidth="0.2"
          strokeDasharray="1 2.2"
          opacity="0.6"
        />

        {/* primary node */}
        <circle
          cx={0.5 * U}
          cy={0.42 * U}
          r="6.5"
          fill="rgba(242,234,217,0.06)"
        />
        <circle
          cx={0.5 * U}
          cy={0.42 * U}
          r="4.5"
          fill="none"
          stroke={accent}
          strokeOpacity="0.4"
          strokeWidth="0.4"
        />
        <circle
          cx={0.5 * U}
          cy={0.42 * U}
          r="1.9"
          fill="#0a101f"
          stroke={accent}
          strokeOpacity="0.8"
          strokeWidth="0.45"
        />

        {/* subsystem spine */}
        <line
          x1={0.08 * U}
          y1={0.68 * U}
          x2={0.92 * U}
          y2={0.68 * U}
          stroke="url(#satSpine)"
          strokeWidth="0.3"
        />
        {pipeline.map((_, i) => {
          const x = (0.08 + (0.84 * i) / Math.max(1, n - 1)) * U;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={0.6 * U}
                x2={x}
                y2={0.76 * U}
                stroke={accent}
                strokeOpacity="0.22"
                strokeWidth="0.2"
              />
              <circle
                cx={x}
                cy={0.68 * U}
                r="1.5"
                fill="#0a101f"
                stroke={accent}
                strokeOpacity="0.6"
                strokeWidth="0.35"
              />
            </g>
          );
        })}

        {/* gentle data drift along the spine */}
        {!reduced &&
          active &&
          pipeline.map((_, i) => (
            <motion.g
              key={`drift-${i}`}
              animate={{ x: [0.1 * U, 0.9 * U] }}
              transition={{
                duration: 6.5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 1.3,
              }}
              style={{ y: 0.68 * U }}
            >
              <circle r="0.45" fill="rgba(242,234,217,0.8)" />
            </motion.g>
          ))}
      </svg>

      {/* labels */}
      <div className="absolute inset-x-0" style={{ top: "68%" }}>
        <div className="flex items-center justify-between px-[6%]">
          {pipeline.map((label) => (
            <span
              key={label}
              className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-starlight-faint sm:text-[0.6rem]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <p
        className="absolute left-1/2 font-mono text-[0.55rem] uppercase tracking-[0.3em] sm:text-[0.65rem]"
        style={{ top: "42%", transform: "translate(-50%, -50%)", color: accent, opacity: 0.7 }}
      >
        {name}
      </p>
    </div>
  );
}
