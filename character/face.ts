/**
 * Expression.
 *
 * Five numbers, spring-blended between named presets. At normal framing his
 * face is ~16 px tall, so expression is felt rather than read — it becomes
 * legible exactly when it matters, because every emotional beat is also a
 * camera push-in. Expression and camera are one system.
 */

import type { ExpressionName } from "@/engine/types";

export type Expression = {
  /** Degrees. Negative furrows (focus, frustration); positive lifts the inner brow. */
  browAngle: number;
  /** Units the brow rides above rest. */
  browRaise: number;
  /** 1 = normal, <1 narrowed, >1 wide. */
  eyeOpen: number;
  /** −1 down … +1 up. */
  mouthCurve: number;
  /** 0 closed … 1 open. */
  mouthOpen: number;
};

export const EXPRESSIONS: Record<ExpressionName, Expression> = {
  neutral: { browAngle: 0, browRaise: 0, eyeOpen: 1, mouthCurve: 0.05, mouthOpen: 0 },
  curious: { browAngle: -3, browRaise: 1.5, eyeOpen: 1.05, mouthCurve: 0.15, mouthOpen: 0.08 },
  joy: { browAngle: -2, browRaise: 1, eyeOpen: 0.72, mouthCurve: 0.9, mouthOpen: 0.34 },
  focus: { browAngle: -8, browRaise: -1.2, eyeOpen: 0.84, mouthCurve: -0.05, mouthOpen: 0 },
  confusion: { browAngle: 6, browRaise: 0.6, eyeOpen: 0.95, mouthCurve: -0.15, mouthOpen: 0.05 },
  frustration: { browAngle: -12, browRaise: -1.8, eyeOpen: 0.68, mouthCurve: -0.5, mouthOpen: 0.1 },
  excitement: { browAngle: -4, browRaise: 2, eyeOpen: 1.14, mouthCurve: 0.7, mouthOpen: 0.44 },
  calm: { browAngle: 0, browRaise: 0.3, eyeOpen: 0.9, mouthCurve: 0.2, mouthOpen: 0 },
  pride: { browAngle: -2, browRaise: 0.8, eyeOpen: 0.94, mouthCurve: 0.45, mouthOpen: 0 },
  wonder: { browAngle: -5, browRaise: 2.2, eyeOpen: 1.2, mouthCurve: 0.25, mouthOpen: 0.24 },
};

export function blendExpression(a: Expression, b: Expression, t: number): Expression {
  const k = t <= 0 ? 0 : t >= 1 ? 1 : t;
  return {
    browAngle: a.browAngle + (b.browAngle - a.browAngle) * k,
    browRaise: a.browRaise + (b.browRaise - a.browRaise) * k,
    eyeOpen: a.eyeOpen + (b.eyeOpen - a.eyeOpen) * k,
    mouthCurve: a.mouthCurve + (b.mouthCurve - a.mouthCurve) * k,
    mouthOpen: a.mouthOpen + (b.mouthOpen - a.mouthOpen) * k,
  };
}

/** Blink: a fast close/open on a randomised interval, layered over expression. */
export class Blink {
  private next = 2 + Math.random() * 3;
  private t = 0;
  private closing = 0;

  update(dt: number): number {
    this.t += dt;
    if (this.closing > 0) {
      this.closing -= dt;
      if (this.closing <= 0) {
        this.closing = 0;
        this.t = 0;
        this.next = 2.2 + Math.random() * 3.4;
      }
      // 0 → 1 → 0 over the blink duration.
      const p = 1 - this.closing / BLINK_MS;
      return 1 - Math.sin(p * Math.PI);
    }
    if (this.t >= this.next) this.closing = BLINK_MS;
    return 1;
  }
}

const BLINK_MS = 0.12;
