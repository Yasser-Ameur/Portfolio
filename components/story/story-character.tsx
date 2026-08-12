"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Stage = number; // 0 child → 6 young adult

type StageParams = {
  scale: number;
  headR: number;
  shoulder: number;
  waist: number;
  torso: number;
  leg: number;
};

const STAGES: StageParams[] = [
  { scale: 0.72, headR: 15, shoulder: 10, waist: 7.5, torso: 40, leg: 30 },
  { scale: 0.8, headR: 15.5, shoulder: 11, waist: 8, torso: 44, leg: 33 },
  { scale: 0.9, headR: 16, shoulder: 12.5, waist: 8.5, torso: 48, leg: 37 },
  { scale: 1.0, headR: 16.5, shoulder: 14, waist: 9, torso: 52, leg: 41 },
  { scale: 1.08, headR: 16.5, shoulder: 15, waist: 9, torso: 54, leg: 43 },
  { scale: 1.16, headR: 17, shoulder: 16.5, waist: 9.5, torso: 57, leg: 45 },
  { scale: 1.22, headR: 17, shoulder: 17.5, waist: 10, torso: 59, leg: 46 },
];

export type CharacterPose = "idle" | "walk" | "proud";

export function characterScale(stage: number): number {
  return STAGES[Math.max(0, Math.min(6, Math.round(stage)))].scale;
}

const BODY = "#04060d";
const RIM = "rgba(240,189,125,0.5)";

/**
 * A standing figure seen from behind. `stage` drives visible growth — a child
 * is small with a large head; an adult is tall with broad shoulders. The
 * growth is physical, not just a label.
 */
export function StoryCharacter({
  stage = 3,
  pose = "idle",
  className,
  showRim = true,
}: {
  stage?: Stage;
  pose?: CharacterPose;
  className?: string;
  showRim?: boolean;
}) {
  const reduced = useReducedMotion();
  const p = STAGES[Math.max(0, Math.min(6, Math.round(stage)))];
  const s = p.shoulder;
  const w = p.waist;
  const headY = 22;
  const shoulderY = headY + p.headR - 1.5;
  const hips = shoulderY + p.torso;
  const footY = hips + p.leg;

  const idle = !reduced && pose === "idle";
  const walking = !reduced && pose === "walk";
  const proud = !reduced && pose === "proud";

  return (
    <svg
      viewBox="0 0 120 180"
      className={cn("h-auto w-full overflow-visible", className)}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="storyBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a101f" />
          <stop offset="0.5" stopColor={BODY} />
          <stop offset="1" stopColor="#010209" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="60" cy={footY + 4} rx="34" ry="5" fill="#000" opacity="0.5" />

      <motion.g
        animate={
          walking
            ? { y: [0, -3.2, 0], rotate: [0, -2.2, 0, 2.2, 0] }
            : idle
              ? { y: [0, -1.2, 0] }
              : proud
                ? { y: [0, -1, 0, 1, 0] }
                : undefined
        }
        transition={
          walking
            ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
            : { duration: proud ? 5.5 : 4.2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* legs */}
        <path
          d={`M56,${hips} C56,${hips + 8} 55,${hips + 18} 54,${footY - 3} C54,${footY - 1} 56,${footY} 58,${footY} L62,${footY} C62,${footY - 6} 62,${hips + 10} 63,${hips} Z`}
          fill="#010209"
        />
        <path
          d={`M64,${hips} C64,${hips + 8} 65,${hips + 18} 66,${footY - 3} C66,${footY - 1} 64,${footY} 62,${footY} L58,${footY} C58,${footY - 6} 58,${hips + 10} 57,${hips} Z`}
          fill="#010209"
        />
        <ellipse cx="56" cy={footY - 1} rx="7" ry="3.4" fill="#02040a" />
        <ellipse cx="64" cy={footY - 1} rx="7" ry="3.4" fill="#02040a" />

        {/* torso */}
        <path
          d={`M${60 - s},${shoulderY} C${60 - s + 3},${shoulderY + 16} ${60 - w - 2},${hips - 12} ${60 - w},${hips} L${60 + w},${hips} C${60 + w + 2},${hips - 12} ${60 + s - 3},${shoulderY + 16} ${60 + s},${shoulderY} C${60 + s - 4},${shoulderY - 6} ${60 - s + 4},${shoulderY - 6} ${60 - s},${shoulderY} Z`}
          fill="url(#storyBody)"
        />

        {/* neck */}
        <rect x="56" y={headY + p.headR - 4} width="8" height="6" fill={BODY} rx="1" />

        {/* arms — pose dependent */}
        {proud ? (
          <>
            <path
              d={`M${60 - s},${shoulderY + 2} C${60 - s - 6},${shoulderY + 8} ${60 - s - 12},${shoulderY + 14} ${60 - s - 15},${shoulderY + 26}`}
              stroke="#02040a"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d={`M${60 + s},${shoulderY + 2} C${60 + s + 6},${shoulderY + 8} ${60 + s + 12},${shoulderY + 14} ${60 + s + 15},${shoulderY + 26}`}
              stroke="#02040a"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <circle cx={60 - s - 15} cy={shoulderY + 29} r="3.4" fill="#02040a" />
            <circle cx={60 + s + 15} cy={shoulderY + 29} r="3.4" fill="#02040a" />
          </>
        ) : (
          <>
            <path
              d={`M${60 - s},${shoulderY + 2} C${60 - s - 5},${shoulderY + 14} ${60 - s - 4},${shoulderY + 26} ${60 - s - 2},${hips - 4} C${60 - s + 1},${hips + 2} ${60 - s + 5},${hips - 2} ${60 - s + 3},${hips - 8}`}
              stroke="#02040a"
              strokeWidth="8.5"
              strokeLinecap="round"
            />
            <path
              d={`M${60 + s},${shoulderY + 2} C${60 + s + 5},${shoulderY + 14} ${60 + s + 4},${shoulderY + 26} ${60 + s + 2},${hips - 4} C${60 + s - 1},${hips + 2} ${60 + s - 5},${hips - 2} ${60 + s - 3},${hips - 8}`}
              stroke="#02040a"
              strokeWidth="8.5"
              strokeLinecap="round"
            />
            <circle cx={60 - s + 2} cy={hips - 6} r="3" fill="#02040a" />
            <circle cx={60 + s - 2} cy={hips - 6} r="3" fill="#02040a" />
          </>
        )}

        {/* head */}
        <motion.g
          animate={
            reduced
              ? undefined
              : idle
                ? { rotate: [0, -1.6, 0, 1.2, 0] }
                : walking
                  ? { rotate: [0, -1.5, 0, 1.5, 0] }
                  : undefined
          }
          transition={{ duration: idle ? 7 : 0.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "60px", originY: `${headY}px` }}
        >
          <circle cx="60" cy={headY} r={p.headR} fill="#04060d" />
        </motion.g>

        {showRim && (
          <path
            d={`M${60 + s + 6},${shoulderY - 2} C${60 + s + 8},${shoulderY + 14} ${60 + s + 5},${shoulderY + 26} ${60 + s + 3},${hips - 6}`}
            stroke={RIM}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />
        )}
      </motion.g>
    </svg>
  );
}
