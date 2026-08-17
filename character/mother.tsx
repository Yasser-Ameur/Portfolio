"use client";

/**
 * His mother.
 *
 * She is never animated toward the camera and never gestures. Her whole
 * performance is posture, stillness, and where she is looking — in the hall her
 * head tracks him; on the road she stops walking and does nothing else at all.
 * A wave would ruin it.
 *
 * Drawn in the same language as him (same skull construction, same rim light),
 * so the two of them read as belonging to one world. A djellaba silhouette and
 * a headscarf, with a waist and a sleeve — the shape has to be a person, not a
 * slab.
 */

import { memo } from "react";

export type MotherRig = {
  root: SVGGElement | null;
  body: SVGGElement | null;
  head: SVGGElement | null;
  hem: SVGGElement | null;
  armNear: SVGGElement | null;
};

export function createMotherRig(): MotherRig {
  return { root: null, body: null, head: null, hem: null, armNear: null };
}

type Props = {
  rig: MotherRig;
  robe: string;
  robeShade: string;
  scarf: string;
  scarfShade?: string;
  rim?: string;
  rimStrength?: number;
  height?: number;
};

function MotherImpl({
  rig,
  robe,
  robeShade,
  scarf,
  scarfShade,
  rim = "#ffd9a0",
  rimStrength = 0.35,
  height = 164,
}: Props) {
  const h = height;
  const r = h * 0.068;
  const shoulderY = -(h - r * 2 - h * 0.03);
  const waistY = shoulderY * 0.56;
  const hem = -h * 0.04;
  const shoulderW = h * 0.1;
  const waistW = h * 0.085;
  const hemW = h * 0.135;
  const scarfDark = scarfShade ?? robeShade;

  return (
    <g ref={(el) => void (rig.root = el)} className="mother">
      <g ref={(el) => void (rig.body = el)}>
        {/* feet, only just visible under the hem */}
        <path d={`M ${-h * 0.03} ${hem} l ${h * 0.075} 0 l 0 ${h * 0.038} l ${-h * 0.075} 0 Z`} fill="#3b2f2a" />

        <g ref={(el) => void (rig.hem = el)}>
          {/* the djellaba: shoulder → waist → hem, with an actual waist */}
          <path
            d={`M ${-shoulderW} ${shoulderY}
                C ${-shoulderW * 1.16} ${shoulderY * 0.78}, ${-waistW * 1.05} ${waistY * 1.1}, ${-waistW} ${waistY}
                C ${-waistW * 1.1} ${waistY * 0.5}, ${-hemW * 0.94} ${hem * 3}, ${-hemW} ${hem}
                L ${hemW} ${hem}
                C ${hemW * 0.92} ${hem * 3}, ${waistW * 1.08} ${waistY * 0.5}, ${waistW} ${waistY}
                C ${waistW * 1.04} ${waistY * 1.1}, ${shoulderW * 1.14} ${shoulderY * 0.78}, ${shoulderW} ${shoulderY} Z`}
            fill={robe}
          />
          {/* the shaded back half gives the garment volume */}
          <path
            d={`M ${-shoulderW} ${shoulderY}
                C ${-shoulderW * 1.16} ${shoulderY * 0.78}, ${-waistW * 1.05} ${waistY * 1.1}, ${-waistW} ${waistY}
                C ${-waistW * 1.1} ${waistY * 0.5}, ${-hemW * 0.94} ${hem * 3}, ${-hemW} ${hem}
                L ${-hemW * 0.2} ${hem} L ${-shoulderW * 0.16} ${shoulderY} Z`}
            fill={robeShade}
            opacity="0.75"
          />
          {/* folds */}
          <path d={`M ${-waistW * 0.3} ${waistY} L ${-hemW * 0.5} ${hem}`} stroke={robeShade} strokeWidth={h * 0.008} opacity="0.5" />
          <path d={`M ${waistW * 0.4} ${waistY * 0.9} L ${hemW * 0.52} ${hem}`} stroke={robeShade} strokeWidth={h * 0.007} opacity="0.4" />
          {/* embroidered placket down the front — one small piece of specificity */}
          <path
            d={`M ${shoulderW * 0.28} ${shoulderY + h * 0.03} L ${waistW * 0.3} ${waistY * 0.7}`}
            stroke={scarf}
            strokeWidth={h * 0.009}
            opacity="0.55"
          />
          {/* the light down her leading edge */}
          <path
            d={`M ${shoulderW} ${shoulderY}
                C ${shoulderW * 1.14} ${shoulderY * 0.78}, ${waistW * 1.04} ${waistY * 1.1}, ${waistW} ${waistY}
                C ${waistW * 1.08} ${waistY * 0.5}, ${hemW * 0.92} ${hem * 3}, ${hemW} ${hem}`}
            fill="none"
            stroke={rim}
            strokeWidth={h * 0.011}
            opacity={rimStrength}
            strokeLinecap="round"
          />
          <path d={`M ${-hemW} ${hem} L ${hemW} ${hem}`} stroke={robeShade} strokeWidth={h * 0.016} />
        </g>

        {/* near arm, held quietly at her side */}
        <g ref={(el) => void (rig.armNear = el)} transform={`translate(${shoulderW * 0.5} ${shoulderY + h * 0.03})`}>
          <path
            d={`M ${-h * 0.021} 0 Q 0 ${-h * 0.012} ${h * 0.021} 0 L ${h * 0.016} ${h * 0.29} Q 0 ${h * 0.305} ${-h * 0.018} ${h * 0.29} Z`}
            fill={robe}
          />
          <circle cx={0} cy={h * 0.315} r={h * 0.017} fill="#dcae8b" />
        </g>

        {/* head.
            Built the simple way round: the scarf is one shape covering the
            whole head, and the face is an oval sitting forward on top of it.
            The scarf then reads as a frame without needing any clever cutouts. */}
        <g ref={(el) => void (rig.head = el)} transform={`translate(0 ${shoulderY - r * 0.92})`}>
          {/* the drape down her back and over the shoulder */}
          <path
            d={`M ${-r * 0.9} ${-r * 0.3}
                q ${-r * 0.5} ${r * 1.1} ${-r * 0.28} ${r * 2.3}
                l ${r * 0.86} ${r * 0.16}
                q ${-r * 0.2} ${-r * 1.2} ${r * 0.06} ${-r * 2.2} Z`}
            fill={scarfDark}
          />
          {/* the head covering */}
          <ellipse cx={-r * 0.08} cy={-r * 0.06} rx={r * 1.12} ry={r * 1.16} fill={scarf} />
          {/* a fold catching light along the crown */}
          <path
            d={`M ${-r * 0.7} ${-r * 0.72} q ${r * 0.7} ${-r * 0.6} ${r * 1.3} ${r * 0.1}`}
            fill="none"
            stroke={scarfDark}
            strokeWidth={r * 0.09}
            opacity="0.5"
            strokeLinecap="round"
          />
          {/* it wraps under the chin */}
          <path
            d={`M ${-r * 0.5} ${r * 0.72} q ${r * 0.6} ${r * 0.56} ${r * 1.16} ${-r * 0.02}
                q ${-r * 0.2} ${r * 0.5} ${-r * 0.62} ${r * 0.56}
                q ${-r * 0.44} ${r * 0.02} ${-r * 0.54} ${-r * 0.54} Z`}
            fill={scarfDark}
          />

          {/* the face, sitting forward in the opening */}
          <ellipse cx={r * 0.24} cy={r * 0.02} rx={r * 0.74} ry={r * 0.9} fill="#e9c3a1" />
          <ellipse cx={r * 0.02} cy={r * 0.02} rx={r * 0.36} ry={r * 0.86} fill="#d3a482" opacity="0.45" />
          {/* jaw and chin */}
          <path
            d={`M ${-r * 0.44} ${r * 0.36} q ${r * 0.24} ${r * 0.66} ${r * 0.78} ${r * 0.5}
                q ${r * 0.4} ${-r * 0.12} ${r * 0.52} ${-r * 0.56} Z`}
            fill="#e9c3a1"
          />
          {/* nose */}
          <path
            d={`M ${r * 0.76} ${-r * 0.04} q ${r * 0.26} ${r * 0.16} ${r * 0.18} ${r * 0.3}
                q ${-r * 0.06} ${r * 0.08} ${-r * 0.24} ${r * 0.02}`}
            fill="#d3a482"
          />
          {/* eye */}
          <ellipse cx={r * 0.42} cy={-r * 0.05} rx={r * 0.12} ry={r * 0.13} fill="#fbf7f2" />
          <circle cx={r * 0.45} cy={-r * 0.04} r={r * 0.076} fill="#2a1d17" />
          <path
            d={`M ${r * 0.24} ${-r * 0.3} q ${r * 0.17} ${-r * 0.11} ${r * 0.32} ${-r * 0.02}`}
            stroke="#241a16"
            strokeWidth={r * 0.082}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M ${r * 0.5} ${r * 0.44} q ${r * 0.13} ${r * 0.05} ${r * 0.24} ${-r * 0.01}`}
            stroke="#a8695a"
            strokeWidth={r * 0.06}
            fill="none"
            strokeLinecap="round"
          />
          {/* rim light down the scarf's leading edge */}
          <path
            d={`M ${r * 0.44} ${-r * 1.02} q ${r * 0.62} ${r * 0.44} ${r * 0.56} ${r * 1.06}`}
            fill="none"
            stroke={rim}
            strokeWidth={r * 0.12}
            opacity={rimStrength * 0.9}
            strokeLinecap="round"
          />
        </g>
      </g>
    </g>
  );
}

export const Mother = memo(MotherImpl);

const setT = (el: Element | null, t: string) => {
  if (el) el.setAttribute("transform", t);
};

/**
 * `look` turns her head toward him (−1 … 1). `sway` is walking motion, 0 when
 * she has stopped. Breathing keeps her alive while standing perfectly still.
 */
export function applyMother(
  rig: MotherRig,
  opts: { look: number; sway: number; t: number; height?: number },
) {
  const h = opts.height ?? 164;
  const r = h * 0.068;
  const shoulderY = -(h - r * 2 - h * 0.03);
  const breath = Math.sin(opts.t * 1.25) * 0.55;

  setT(rig.body, `translate(0 ${breath * 0.5 + Math.sin(opts.t * 4) * opts.sway * 1.6})`);
  setT(rig.hem, `rotate(${Math.sin(opts.t * 3.4) * opts.sway * 1.8} 0 ${shoulderY})`);
  setT(
    rig.armNear,
    `translate(${h * 0.05} ${shoulderY + h * 0.03}) rotate(${Math.sin(opts.t * 3.4 + Math.PI) * opts.sway * 11})`,
  );
  setT(
    rig.head,
    `translate(${opts.look * r * 0.16} ${shoulderY - r * 0.92 + breath * 0.3}) rotate(${opts.look * 5})`,
  );
}
