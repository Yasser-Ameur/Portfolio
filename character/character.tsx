"use client";

/**
 * The protagonist.
 *
 * Geometry is React-rendered, but only when `stageStep` changes — stage is
 * quantised to 1/40th of a life, so this subtree re-renders roughly forty times
 * across the whole journey and never during a frame. Everything that moves
 * (limbs, head, hair, face) is written imperatively to the rig's refs by the
 * clock, so travelling costs React nothing at all.
 */

import { memo, useMemo } from "react";
import { glassesOpacity, proportions, skinTone } from "./rig";

export type Outfit = {
  top: string;
  topShade: string;
  bottom: string;
  bottomShade: string;
  shoes: string;
  accent?: string;
  extra?: "gown" | "backpack" | "coat" | "hood";
  /** Carried in the trailing hand — it swings with the arm, which is correct. */
  carries?: "suitcase";
};

export type RigHandle = {
  root: SVGGElement | null;
  body: SVGGElement | null;
  legFar: SVGGElement | null;
  kneeFar: SVGGElement | null;
  legNear: SVGGElement | null;
  kneeNear: SVGGElement | null;
  armFar: SVGGElement | null;
  elbowFar: SVGGElement | null;
  armNear: SVGGElement | null;
  elbowNear: SVGGElement | null;
  head: SVGGElement | null;
  hair: SVGGElement | null;
  curls: SVGGElement | null;
  chest: SVGGElement | null;
  browNear: SVGPathElement | null;
  browFar: SVGPathElement | null;
  eyeNear: SVGGElement | null;
  eyeFar: SVGGElement | null;
  mouth: SVGPathElement | null;
  glasses: SVGGElement | null;
};

export function createRig(): RigHandle {
  return {
    root: null,
    body: null,
    legFar: null,
    kneeFar: null,
    legNear: null,
    kneeNear: null,
    armFar: null,
    elbowFar: null,
    armNear: null,
    elbowNear: null,
    head: null,
    hair: null,
    curls: null,
    chest: null,
    browNear: null,
    browFar: null,
    eyeNear: null,
    eyeFar: null,
    mouth: null,
    glasses: null,
  };
}

/**
 * Curly hair, in units of head radius. Fixed layout (never random per render,
 * so it cannot shimmer). `BACK` sits behind the skull and gives the silhouette
 * its mass; `FRONT` sits over the cranium and is what actually reads as hair.
 * `LOOSE` lags furthest behind the head — the single detail that does the most
 * for "alive".
 */
const HAIR_BACK: [number, number, number][] = [
  [-0.62, -0.48, 0.5],
  [-0.86, -0.06, 0.44],
  [-0.82, 0.34, 0.36],
  [-0.5, 0.56, 0.3],
  [-0.2, -0.86, 0.5],
  [0.28, -0.8, 0.44],
  [0.66, -0.5, 0.34],
];

const HAIR_FRONT: [number, number, number][] = [
  [-0.5, -0.62, 0.46],
  [-0.14, -0.8, 0.48],
  [0.24, -0.72, 0.42],
  [0.56, -0.5, 0.34],
  [-0.72, -0.3, 0.4],
  [0.02, -0.55, 0.44],
  [-0.32, -0.72, 0.42],
  [0.44, -0.66, 0.3],
];

const LOOSE_CURLS: [number, number, number][] = [
  [0.74, -0.72, 0.19],
  [-0.98, -0.44, 0.22],
  [-0.86, 0.5, 0.17],
];

const HAIR = "#191320";
const HAIR_LIT = "#33283f";

type Props = {
  /** Quantised stage — see the note at the top of this file. */
  stageStep: number;
  outfit: Outfit;
  rig: RigHandle;
  /** Rim light colour from the chapter palette. */
  rim?: string;
  rimStrength?: number;
};

function CharacterImpl({ stageStep, outfit, rig, rim = "#ffd9a0", rimStrength = 0.4 }: Props) {
  const stage = stageStep;
  const p = useMemo(() => proportions(stage), [stage]);
  const skin = useMemo(() => skinTone(stage), [stage]);
  const specs = glassesOpacity(stage);

  const hipY = -p.legLen;
  const shoulderY = -(p.legLen + p.torsoLen);
  const headCY = shoulderY - p.neckLen - p.headR;

  const thighLen = p.legLen * 0.52;
  const shinLen = p.legLen * 0.48;
  const upperArm = p.torsoLen * 0.5;
  const foreArm = p.torsoLen * 0.46;

  const r = p.headR;
  const cd = p.chestD;
  const wd = p.waistD;

  // Side-view torso: back edge at −x, chest at +x, facing right.
  const torso = [
    `M ${-wd * 0.5} 4`,
    `C ${-wd * 0.62} ${-p.torsoLen * 0.4}, ${-cd * 0.54} ${-p.torsoLen * 0.72}, ${-cd * 0.5} ${-p.torsoLen}`,
    `Q 0 ${-p.torsoLen - cd * 0.16} ${cd * 0.5} ${-p.torsoLen}`,
    `C ${cd * 0.58} ${-p.torsoLen * 0.6}, ${wd * 0.64} ${-p.torsoLen * 0.28}, ${wd * 0.5} 4`,
    "Z",
  ].join(" ");

  /** A tapered limb segment with rounded ends — reads as a body, not a stick. */
  const limb = (len: number, w: number, taper = 0.82) =>
    `M ${-w / 2} 0
     Q 0 ${-w * 0.34} ${w / 2} 0
     L ${(w * taper) / 2} ${len}
     Q 0 ${len + w * taper * 0.36} ${(-w * taper) / 2} ${len}
     Z`;

  const shoe = (w: number, len: number) =>
    `M ${-w * 0.42} ${len - w * 0.1}
     L ${w * 0.34} ${len - w * 0.1}
     Q ${w * 0.92} ${len - w * 0.06} ${w * 0.96} ${len + w * 0.34}
     Q ${w * 0.9} ${len + w * 0.44} ${w * 0.6} ${len + w * 0.44}
     L ${-w * 0.46} ${len + w * 0.44}
     Q ${-w * 0.6} ${len + w * 0.2} ${-w * 0.42} ${len - w * 0.1} Z`;

  return (
    <g ref={(el) => void (rig.root = el)} className="character">
      <g ref={(el) => void (rig.body = el)}>
        {/* ---- far leg ---------------------------------------------------- */}
        <g ref={(el) => void (rig.legFar = el)} transform={`translate(0 ${hipY})`}>
          <path d={limb(thighLen, p.legW)} fill={outfit.bottomShade} />
          <g ref={(el) => void (rig.kneeFar = el)} transform={`translate(0 ${thighLen})`}>
            <path d={limb(shinLen, p.legW * 0.8, 0.74)} fill={outfit.bottomShade} />
            <path d={shoe(p.legW * 0.8, shinLen)} fill={outfit.shoes} opacity="0.72" />
          </g>
        </g>

        {/* ---- far arm ---------------------------------------------------- */}
        <g ref={(el) => void (rig.armFar = el)} transform={`translate(0 ${shoulderY + p.torsoLen * 0.08})`}>
          <path d={limb(upperArm, p.armW)} fill={outfit.topShade} />
          <g ref={(el) => void (rig.elbowFar = el)} transform={`translate(0 ${upperArm})`}>
            <path d={limb(foreArm, p.armW * 0.86, 0.8)} fill={outfit.topShade} />
            <circle cx="0" cy={foreArm + p.armW * 0.28} r={p.armW * 0.42} fill={skin.shade} />
            {outfit.carries === "suitcase" ? (
              <g>
                <path
                  d={`M ${-p.armW * 0.3} ${foreArm + p.armW * 0.4} q ${p.armW * 0.3} ${-p.armW * 0.4} ${p.armW * 0.6} 0`}
                  fill="none"
                  stroke="#2a2620"
                  strokeWidth={p.armW * 0.16}
                />
                <rect
                  x={-p.height * 0.095}
                  y={foreArm + p.armW * 0.4}
                  width={p.height * 0.19}
                  height={p.height * 0.145}
                  rx={p.height * 0.009}
                  fill="#4a3a2e"
                />
                <rect
                  x={-p.height * 0.095}
                  y={foreArm + p.armW * 0.4 + p.height * 0.058}
                  width={p.height * 0.19}
                  height={p.height * 0.013}
                  fill="#2f2620"
                />
              </g>
            ) : null}
          </g>
        </g>

        {/* ---- torso ------------------------------------------------------ */}
        <g ref={(el) => void (rig.chest = el)} transform={`translate(0 ${hipY})`}>
          <path d={torso} fill={outfit.top} />
          {/* rim light catching the chest edge he leads with */}
          <path
            d={`M ${cd * 0.5} ${-p.torsoLen} C ${cd * 0.58} ${-p.torsoLen * 0.6}, ${wd * 0.64} ${-p.torsoLen * 0.28}, ${wd * 0.5} 4`}
            fill="none"
            stroke={rim}
            strokeWidth={p.armW * 0.3}
            strokeLinecap="round"
            opacity={rimStrength}
          />
          {/* shadow along the back edge grounds him in the chapter's light */}
          <path
            d={`M ${-wd * 0.5} 4 C ${-wd * 0.62} ${-p.torsoLen * 0.4}, ${-cd * 0.54} ${-p.torsoLen * 0.72}, ${-cd * 0.5} ${-p.torsoLen}`}
            fill="none"
            stroke={outfit.topShade}
            strokeWidth={p.armW * 0.42}
            strokeLinecap="round"
            opacity="0.85"
          />
          {outfit.accent ? (
            <path
              d={`M ${-cd * 0.16} ${-p.torsoLen} L ${cd * 0.14} ${-p.torsoLen} L ${cd * 0.06} ${-p.torsoLen * 0.42} L ${-cd * 0.1} ${-p.torsoLen * 0.42} Z`}
              fill={outfit.accent}
              opacity="0.9"
            />
          ) : null}
          {outfit.extra === "gown" ? (
            <>
              <path
                d={`M ${-wd * 0.72} ${p.legLen * 0.54} L ${-cd * 0.55} ${-p.torsoLen} L ${cd * 0.55} ${-p.torsoLen} L ${wd * 0.8} ${p.legLen * 0.54} Z`}
                fill={outfit.top}
              />
              <path
                d={`M ${-cd * 0.22} ${-p.torsoLen} L ${-cd * 0.08} ${p.legLen * 0.22} L ${cd * 0.12} ${p.legLen * 0.22} L ${cd * 0.26} ${-p.torsoLen} Z`}
                fill={outfit.accent ?? "#e0a63c"}
              />
            </>
          ) : null}
          {outfit.extra === "backpack" ? (
            <path
              d={`M ${-cd * 0.5} ${-p.torsoLen * 0.88} q ${-cd * 0.72} ${p.torsoLen * 0.3} ${-cd * 0.14} ${p.torsoLen * 0.68} l ${cd * 0.42} 0 Z`}
              fill={outfit.bottomShade}
            />
          ) : null}
          {outfit.extra === "coat" ? (
            <path
              d={`M ${-cd * 0.54} ${-p.torsoLen * 0.9} L ${-wd * 0.76} ${p.legLen * 0.32} L ${wd * 0.68} ${p.legLen * 0.32} L ${cd * 0.54} ${-p.torsoLen * 0.9} Z`}
              fill={outfit.top}
            />
          ) : null}
          {outfit.extra === "hood" ? (
            <path
              d={`M ${-cd * 0.5} ${-p.torsoLen} q ${-cd * 0.34} ${p.torsoLen * 0.2} ${cd * 0.04} ${p.torsoLen * 0.3} l ${cd * 0.5} ${-p.torsoLen * 0.16} Z`}
              fill={outfit.topShade}
            />
          ) : null}
        </g>

        {/* ---- near leg --------------------------------------------------- */}
        <g ref={(el) => void (rig.legNear = el)} transform={`translate(0 ${hipY})`}>
          <path d={limb(thighLen, p.legW)} fill={outfit.bottom} />
          <g ref={(el) => void (rig.kneeNear = el)} transform={`translate(0 ${thighLen})`}>
            <path d={limb(shinLen, p.legW * 0.8, 0.74)} fill={outfit.bottom} />
            <path d={shoe(p.legW * 0.8, shinLen)} fill={outfit.shoes} />
          </g>
        </g>

        {/* ---- head ------------------------------------------------------- */}
        <g ref={(el) => void (rig.head = el)} transform={`translate(0 ${headCY})`}>
          {/* neck */}
          <path
            d={`M ${-r * 0.3} ${r * 0.52} L ${r * 0.32} ${r * 0.52} L ${r * 0.36} ${r * 1.45} L ${-r * 0.34} ${r * 1.45} Z`}
            fill={skin.shade}
          />

          {/* the mass behind the skull */}
          <g ref={(el) => void (rig.hair = el)}>
            {HAIR_BACK.map(([hx, hy, hr], i) => (
              <circle key={`hb${i}`} cx={hx * r} cy={hy * r} r={hr * r} fill={HAIR} />
            ))}
          </g>

          {/* skull + jaw */}
          <path
            d={`M ${-r * 0.95} ${-r * 0.08}
                a ${r * 0.95} ${r * 0.98} 0 1 1 ${r * 1.9} 0
                q ${r * 0.04} ${r * 0.46} ${-r * 0.12} ${r * 0.7}
                q ${-r * 0.26} ${r * 0.42} ${-r * 0.72} ${r * 0.36}
                q ${-r * 0.62} ${-r * 0.08} ${-r * 1.06} ${-r * 1.06} Z`}
            fill={skin.base}
          />
          {/* the shaded side of the face */}
          <path
            d={`M ${-r * 0.95} ${-r * 0.08} a ${r * 0.95} ${r * 0.98} 0 0 1 ${r * 0.5} ${-r * 0.82}
                l 0 ${r * 1.9} q ${-r * 0.44} ${-r * 0.1} ${-r * 0.5} ${-r * 1.08} Z`}
            fill={skin.shade}
            opacity="0.55"
          />
          {/* ear, tucked under the hair */}
          <ellipse cx={-r * 0.26} cy={r * 0.14} rx={r * 0.15} ry={r * 0.21} fill={skin.shade} />
          {/* nose */}
          <path
            d={`M ${r * 0.7} ${-r * 0.02} q ${r * 0.3} ${r * 0.16} ${r * 0.22} ${r * 0.32} q ${-r * 0.07} ${r * 0.09} ${-r * 0.26} ${r * 0.03}`}
            fill={skin.shade}
          />
          {/* rim light down the profile */}
          <path
            d={`M ${r * 0.5} ${-r * 0.78} q ${r * 0.44} ${r * 0.4} ${r * 0.36} ${r * 0.92} q ${-r * 0.08} ${r * 0.42} ${-r * 0.4} ${r * 0.56}`}
            fill="none"
            stroke={rim}
            strokeWidth={r * 0.13}
            strokeLinecap="round"
            opacity={rimStrength * 0.9}
          />

          {/* eyes — near eye plus the far eye peeking past the bridge */}
          <g ref={(el) => void (rig.eyeFar = el)}>
            <ellipse cx={r * 0.6} cy={-r * 0.02} rx={r * 0.1} ry={r * 0.13} fill="#fbf7f2" opacity="0.9" />
            <circle cx={r * 0.63} cy={-r * 0.01} r={r * 0.07} fill="#231a16" />
          </g>
          <g ref={(el) => void (rig.eyeNear = el)}>
            <ellipse cx={r * 0.24} cy={-r * 0.02} rx={r * 0.145} ry={r * 0.16} fill="#fbf7f2" />
            <circle cx={r * 0.28} cy={-r * 0.01} r={r * 0.092} fill="#231a16" />
            <circle cx={r * 0.32} cy={-r * 0.06} r={r * 0.03} fill="#ffffff" opacity="0.95" />
          </g>

          {/* brows */}
          <path
            ref={(el) => void (rig.browFar = el)}
            d={`M ${r * 0.5} ${-r * 0.28} q ${r * 0.13} ${-r * 0.08} ${r * 0.22} ${-r * 0.01}`}
            stroke="#1b1219"
            strokeWidth={r * 0.08}
            fill="none"
            strokeLinecap="round"
            opacity="0.72"
          />
          <path
            ref={(el) => void (rig.browNear = el)}
            d={`M ${r * 0.06} ${-r * 0.28} q ${r * 0.2} ${-r * 0.13} ${r * 0.36} ${-r * 0.02}`}
            stroke="#150e14"
            strokeWidth={r * 0.105}
            fill="none"
            strokeLinecap="round"
          />

          {/* mouth */}
          <path
            ref={(el) => void (rig.mouth = el)}
            d={`M ${r * 0.4} ${r * 0.5} q ${r * 0.15} ${r * 0.06} ${r * 0.28} 0`}
            stroke="#7d453a"
            strokeWidth={r * 0.08}
            fill="none"
            strokeLinecap="round"
          />

          {/* glasses — arrive in a school corridor, gone by the last EPFL year */}
          {specs > 0.001 ? (
            <g ref={(el) => void (rig.glasses = el)} opacity={specs}>
              <rect
                x={r * 0.06}
                y={-r * 0.21}
                width={r * 0.4}
                height={r * 0.36}
                rx={r * 0.13}
                fill="#cfe4ee"
                fillOpacity="0.14"
                stroke="#2a2620"
                strokeWidth={r * 0.058}
              />
              <rect
                x={r * 0.5}
                y={-r * 0.19}
                width={r * 0.28}
                height={r * 0.32}
                rx={r * 0.11}
                fill="#cfe4ee"
                fillOpacity="0.12"
                stroke="#2a2620"
                strokeWidth={r * 0.05}
                opacity="0.85"
              />
              <path d={`M ${r * 0.46} ${-r * 0.06} L ${r * 0.5} ${-r * 0.06}`} stroke="#2a2620" strokeWidth={r * 0.05} />
              <path
                d={`M ${r * 0.06} ${-r * 0.08} L ${-r * 0.22} ${r * 0.04}`}
                stroke="#2a2620"
                strokeWidth={r * 0.048}
                opacity="0.7"
              />
              <path
                d={`M ${r * 0.13} ${-r * 0.15} l ${r * 0.13} ${r * 0.11}`}
                stroke="#ffffff"
                strokeWidth={r * 0.042}
                opacity="0.45"
              />
            </g>
          ) : null}

          {/* the hair that actually reads as hair — over the cranium */}
          <g>
            {HAIR_FRONT.map(([hx, hy, hr], i) => (
              <circle key={`hf${i}`} cx={hx * r} cy={hy * r} r={hr * r} fill={HAIR} />
            ))}
            {/* one highlight so the black mass has a form */}
            <circle cx={-r * 0.1} cy={-r * 0.86} r={r * 0.3} fill={HAIR_LIT} opacity="0.55" />
            <circle cx={r * 0.3} cy={-r * 0.74} r={r * 0.18} fill={HAIR_LIT} opacity="0.4" />
          </g>

          {/* loose curls lag furthest behind the head */}
          <g ref={(el) => void (rig.curls = el)}>
            {LOOSE_CURLS.map(([hx, hy, hr], i) => (
              <circle key={`lc${i}`} cx={hx * r} cy={hy * r} r={hr * r} fill={HAIR} />
            ))}
          </g>
        </g>

        {/* ---- near arm --------------------------------------------------- */}
        <g ref={(el) => void (rig.armNear = el)} transform={`translate(0 ${shoulderY + p.torsoLen * 0.08})`}>
          <path d={limb(upperArm, p.armW * 1.04)} fill={outfit.top} />
          <g ref={(el) => void (rig.elbowNear = el)} transform={`translate(0 ${upperArm})`}>
            <path d={limb(foreArm, p.armW * 0.9, 0.8)} fill={outfit.top} />
            <circle cx="0" cy={foreArm + p.armW * 0.3} r={p.armW * 0.44} fill={skin.base} />
          </g>
        </g>
      </g>
    </g>
  );
}

export const Character = memo(CharacterImpl);

/** Geometry quantisation — see the note at the top of this file. */
export const STAGE_STEPS = 40;
export const quantiseStage = (stage: number) =>
  Math.round(Math.max(0, Math.min(1, stage)) * STAGE_STEPS) / STAGE_STEPS;
