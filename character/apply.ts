"use client";

/**
 * Writes a pose onto the rig.
 *
 * Called once per frame from the clock. Roughly twenty attribute writes on
 * elements that already exist — no allocation, no React, no layout. This is the
 * only place the character's transforms are touched.
 */

import type { Expression } from "./face";
import type { Pose } from "./rig";
import { proportions } from "./rig";
import type { RigHandle } from "./character";

const set = (el: Element | null, t: string) => {
  if (el) el.setAttribute("transform", t);
};

export type HairState = { x: number; y: number; vx: number; vy: number };

export function createHairState(): HairState {
  return { x: 0, y: 0, vx: 0, vy: 0 };
}

/**
 * Curly hair lags the head and settles on its own — a light spring driven by
 * head motion. This one detail carries most of the "alive".
 */
export function updateHair(
  hair: HairState,
  headVelX: number,
  headVelY: number,
  dt: number,
  amount = 1,
) {
  const stiffness = 90;
  const damping = 11;
  const targetX = -headVelX * 0.016 * amount;
  const targetY = -headVelY * 0.012 * amount;

  hair.vx += (targetX - hair.x) * stiffness * dt;
  hair.vy += (targetY - hair.y) * stiffness * dt;
  hair.vx *= Math.exp(-damping * dt);
  hair.vy *= Math.exp(-damping * dt);
  hair.x += hair.vx * dt;
  hair.y += hair.vy * dt;

  const cap = 4.5;
  hair.x = Math.max(-cap, Math.min(cap, hair.x));
  hair.y = Math.max(-cap, Math.min(cap, hair.y));
}

export function applyPose(
  rig: RigHandle,
  pose: Pose,
  stage: number,
  hair: HairState,
  expr: Expression,
  blink: number,
) {
  const p = proportions(stage);
  const hipY = -p.legLen;
  const shoulderY = -(p.legLen + p.torsoLen);
  const headCY = shoulderY - p.neckLen - p.headR;
  const thighLen = p.legLen * 0.52;
  const upperArm = p.torsoLen * 0.5;
  const r = p.headR;

  // Whole body: vertical bob plus a forward lean that grows with speed.
  set(rig.body, `translate(0 ${pose.bob}) rotate(${pose.lean + p.posture * 0.4} 0 ${hipY})`);

  set(rig.legFar, `translate(${-p.hipW * 0.12} ${hipY}) rotate(${pose.thighFar})`);
  set(rig.kneeFar, `translate(0 ${thighLen}) rotate(${pose.kneeFar})`);
  set(rig.legNear, `translate(${p.hipW * 0.12} ${hipY}) rotate(${pose.thighNear})`);
  set(rig.kneeNear, `translate(0 ${thighLen}) rotate(${pose.kneeNear})`);

  const shoulderPivot = shoulderY + p.torsoLen * 0.08;
  set(rig.armFar, `translate(${-p.shoulderW * 0.1} ${shoulderPivot}) rotate(${pose.armFar})`);
  set(rig.elbowFar, `translate(0 ${upperArm}) rotate(${pose.elbowFar})`);
  set(rig.armNear, `translate(${p.shoulderW * 0.1} ${shoulderPivot}) rotate(${pose.armNear})`);
  set(rig.elbowNear, `translate(0 ${upperArm}) rotate(${pose.elbowNear})`);

  // Chest breathes at rest; the swell fades out as he picks up speed.
  const swell = 1 + pose.breath * 0.008;
  set(rig.chest, `translate(0 ${hipY}) scale(${swell} ${1 / swell})`);

  set(
    rig.head,
    `translate(${pose.headTurn * 0.4} ${headCY}) rotate(${pose.headTilt - pose.lean * 0.55})`,
  );

  set(rig.hair, `translate(${hair.x * 0.55} ${hair.y * 0.55})`);
  set(rig.curls, `translate(${hair.x} ${hair.y})`);

  // ---- face -----------------------------------------------------------
  const open = Math.max(0.04, expr.eyeOpen * blink);
  set(rig.eyeNear, `translate(0 ${-r * 0.04 * (1 - open)}) scale(1 ${open})`);
  set(rig.eyeFar, `translate(0 ${-r * 0.04 * (1 - open)}) scale(1 ${open})`);

  set(
    rig.browNear,
    `translate(0 ${-expr.browRaise * r * 0.06}) rotate(${expr.browAngle} ${r * 0.28} ${-r * 0.3})`,
  );
  set(
    rig.browFar,
    `translate(0 ${-expr.browRaise * r * 0.05}) rotate(${expr.browAngle * 0.7} ${r * 0.62} ${-r * 0.3})`,
  );

  if (rig.mouth) {
    const w = r * 0.28;
    const x0 = r * 0.4;
    const y0 = r * 0.5;
    const curve = expr.mouthCurve * r * 0.16;
    const drop = expr.mouthOpen * r * 0.16;
    rig.mouth.setAttribute(
      "d",
      `M ${x0} ${y0} q ${w * 0.5} ${curve + drop} ${w} ${-curve * 0.35}`,
    );
  }
}
