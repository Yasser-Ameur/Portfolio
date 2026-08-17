/**
 * Environmental vocabulary.
 *
 * Everything here takes a palette and a depth, so the same shape is a far
 * rooftop or a near wall depending only on how far away you say it is —
 * atmospheric perspective is computed, never painted. Nothing hard-codes a
 * colour it wasn't handed.
 */

import { Fragment, useId } from "react";
import { atmo, lit, shadowed, type Palette } from "./palette";
import { withAlpha } from "./color";

type Depth = { p: Palette; d: number };

/** Deterministic pseudo-random so scenes never shimmer between renders. */
export function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------------------
// Light
// ---------------------------------------------------------------------------

export function Sun({
  x,
  y,
  r = 46,
  color,
  glowR = 320,
  intensity = 0.5,
}: {
  x: number;
  y: number;
  r?: number;
  color: string;
  glowR?: number;
  intensity?: number;
}) {
  const id = useId();
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={intensity} />
          <stop offset="45%" stopColor={color} stopOpacity={intensity * 0.28} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={glowR} fill={`url(#${id})`} />
      <circle cx={x} cy={y} r={r} fill={color} opacity={Math.min(1, intensity + 0.35)} />
    </g>
  );
}

/**
 * A rectangle of light — the motif that carries the whole story. A TV through a
 * window, a monitor, a lecture screen, a train window.
 */
export function GlowWindow({
  x,
  y,
  w,
  h,
  color,
  intensity = 0.85,
  frame,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  intensity?: number;
  frame?: string;
  children?: React.ReactNode;
}) {
  const id = useId();
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={intensity * 0.75} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 2.4} ry={h * 2.6} fill={`url(#${id})`} />
      {frame ? <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} fill={frame} /> : null}
      <rect x={x} y={y} width={w} height={h} fill={color} opacity={intensity} />
      {children}
      {/* the spill onto whatever is below it */}
      <path
        d={`M ${x} ${y + h} L ${x + w} ${y + h} L ${x + w * 1.5} ${y + h * 2.4} L ${x - w * 0.5} ${y + h * 2.4} Z`}
        fill={color}
        opacity={intensity * 0.12}
      />
    </g>
  );
}

/** Soft high cloud. Broken up so the top of the frame isn't dead space. */
export function Clouds({
  x,
  width,
  y,
  height,
  color,
  opacity = 0.3,
  seed = 91,
  count = 7,
}: {
  x: number;
  width: number;
  y: number;
  height: number;
  color: string;
  opacity?: number;
  seed?: number;
  count?: number;
}) {
  const r = rng(seed);
  const id = useId();
  return (
    <g opacity={opacity}>
      <defs>
        {/* Soft-edged, or they read as lozenges pasted on the sky. */}
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
          <stop offset="52%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: count }, (_, i) => {
        const cx = x + r() * width;
        const cy = y + r() * height;
        const w = 150 + r() * 280;
        const h = (22 + r() * 26) * (1 + r() * 0.4);
        // Each cloud is a drift of overlapping soft blobs, not one shape.
        return (
          <g key={i}>
            {Array.from({ length: 6 }, (_, k) => {
              const ox = (r() - 0.5) * w * 1.5;
              const oy = (r() - 0.5) * h * 1.3;
              const rr = w * (0.3 + r() * 0.42);
              return (
                <ellipse
                  key={k}
                  cx={cx + ox}
                  cy={cy + oy}
                  rx={rr}
                  ry={rr * (0.2 + r() * 0.14)}
                  fill={`url(#${id})`}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

export function StreetLamp({
  x,
  ground,
  h = 190,
  p,
  d,
  on = true,
}: Depth & { x: number; ground: number; h?: number; on?: boolean }) {
  const post = atmo(p, "#2c2620", d);
  return (
    <g>
      <rect x={x - 3} y={ground - h} width={6} height={h} fill={post} />
      <path d={`M ${x} ${ground - h} q 0 -16 22 -16 l 14 0`} fill="none" stroke={post} strokeWidth="5" />
      {on ? (
        <>
          <circle cx={x + 38} cy={ground - h - 14} r={7} fill={p.key} />
          <circle cx={x + 38} cy={ground - h - 14} r={34} fill={p.key} opacity="0.13" />
          <path
            d={`M ${x + 20} ${ground - h - 8} L ${x + 56} ${ground - h - 8} L ${x + 96} ${ground} L ${x - 20} ${ground} Z`}
            fill={p.key}
            opacity="0.05"
          />
        </>
      ) : null}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Vegetation
// ---------------------------------------------------------------------------

/**
 * A cast shadow. The sun in most chapters is low, so shadows are long and lean
 * away from it — adding these to everything is the single cheapest thing that
 * stops flat vector from floating.
 */
export function CastShadow({
  x,
  ground,
  length,
  width,
  p,
  opacity = 0.16,
}: {
  x: number;
  ground: number;
  length: number;
  width: number;
  p: Palette;
  opacity?: number;
}) {
  return (
    <path
      d={`M ${x - width / 2} ${ground} L ${x + width / 2} ${ground}
          L ${x + length + width * 0.2} ${ground + Math.abs(length) * 0.13 + 4}
          L ${x + length - width * 0.4} ${ground + Math.abs(length) * 0.13 + 4} Z`}
      fill={shadowed(p, p.ground, 0.75)}
      opacity={opacity}
    />
  );
}

export function Palm({
  x,
  ground,
  h,
  lean = 0,
  p,
  d,
  seed = 1,
}: Depth & { x: number; ground: number; h: number; lean?: number; seed?: number }) {
  const trunk = atmo(p, "#6b512f", d);
  const trunkLit = atmo(p, lit(p, "#9c7a52", 0.2), d);
  // Saturated enough that it still reads green after the haze takes its cut.
  const frond = atmo(p, "#20512a", d);
  const frondLit = atmo(p, "#3d7a33", d);
  const r = rng(seed);
  const topY = ground - h;
  const topX = x + lean;
  const tw = h * 0.032;
  const fronds = 11;

  return (
    <g>
      {/* trunk, with the ring texture date palms actually have */}
      <path
        d={`M ${x - tw} ${ground} Q ${x + lean * 0.35 - tw * 0.6} ${ground - h * 0.55} ${topX - tw * 0.5} ${topY}
            L ${topX + tw * 0.5} ${topY} Q ${x + lean * 0.35 + tw * 0.6} ${ground - h * 0.55} ${x + tw} ${ground} Z`}
        fill={trunk}
      />
      <path
        d={`M ${x + tw * 0.2} ${ground} Q ${x + lean * 0.35 + tw * 0.2} ${ground - h * 0.55} ${topX + tw * 0.2} ${topY}`}
        stroke={trunkLit}
        strokeWidth={tw * 0.7}
        fill="none"
        opacity="0.6"
      />
      {Array.from({ length: Math.floor(h / 22) }, (_, i) => {
        const t = i / Math.floor(h / 22);
        const yy = ground - h * t;
        const xx = x + lean * 0.35 * (t * 1.6);
        return (
          <path
            key={`ring${i}`}
            d={`M ${xx - tw * (1 - t * 0.4)} ${yy} l ${tw * 2 * (1 - t * 0.4)} 0`}
            stroke={atmo(p, "#5d472f", d)}
            strokeWidth={h * 0.006}
            opacity="0.4"
          />
        );
      })}

      {/* crown — fronds radiate from the head, rise a little, then fall away */}
      {Array.from({ length: fronds }, (_, i) => {
        const t = i / (fronds - 1);
        // Wide fan, and the outer fronds hang well below the crown — that
        // droop is the whole difference between a palm and a yucca.
        const a = (t - 0.5) * 2.9;
        const len = h * (0.38 + r() * 0.12);
        const spread = Math.sin(a);
        const rise = Math.cos(a);
        const ex = topX + spread * len * 1.05;
        const ey = topY - rise * len * 0.3 + Math.abs(spread) * len * 1.05;
        const cx = topX + spread * len * 0.5;
        const cy = topY - rise * len * 0.52 - len * 0.16;
        return (
          <Fragment key={i}>
            <path
              d={`M ${topX} ${topY + h * 0.012} Q ${cx} ${cy} ${ex} ${ey}`}
              stroke={i % 3 === 0 ? frondLit : frond}
              strokeWidth={h * 0.028}
              fill="none"
              strokeLinecap="round"
              opacity={0.94}
            />
            {/* the barbs that make a frond read as a frond, not a blade */}
            {[0.42, 0.62, 0.8].map((u, k) => {
              const bx = (1 - u) * (1 - u) * topX + 2 * (1 - u) * u * cx + u * u * ex;
              const by = (1 - u) * (1 - u) * (topY + h * 0.012) + 2 * (1 - u) * u * cy + u * u * ey;
              return (
                <path
                  key={k}
                  d={`M ${bx} ${by} l ${-spread * h * 0.012 - h * 0.026} ${h * 0.03}`}
                  stroke={frond}
                  strokeWidth={h * 0.012}
                  strokeLinecap="round"
                  opacity="0.55"
                />
              );
            })}
          </Fragment>
        );
      })}
      <circle cx={topX} cy={topY + h * 0.016} r={h * 0.03} fill={frond} />
      {/* dates */}
      <circle cx={topX + h * 0.03} cy={topY + h * 0.05} r={h * 0.018} fill={atmo(p, "#8a6a2a", d)} opacity="0.8" />
    </g>
  );
}

export function Bougainvillea({
  x,
  y,
  w,
  h,
  p,
  d,
  seed = 3,
}: Depth & { x: number; y: number; w: number; h: number; seed?: number }) {
  const r = rng(seed);
  const leaf = atmo(p, "#2e4629", d);
  const flower = atmo(p, p.accent, d * 0.6);
  return (
    <g>
      {Array.from({ length: 26 }, (_, i) => (
        <circle
          key={`l${i}`}
          cx={x + r() * w}
          cy={y + r() * h}
          r={4 + r() * 8}
          fill={leaf}
          opacity={0.85}
        />
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <circle
          key={`f${i}`}
          cx={x + r() * w}
          cy={y + r() * h}
          r={3 + r() * 6}
          fill={flower}
          opacity={0.62 + r() * 0.3}
        />
      ))}
    </g>
  );
}

export function Conifer({
  x,
  ground,
  h,
  p,
  d,
}: Depth & { x: number; ground: number; h: number }) {
  const body = atmo(p, "#1f3a30", d);
  const w = h * 0.3;
  return (
    <g>
      <rect x={x - h * 0.018} y={ground - h * 0.2} width={h * 0.036} height={h * 0.2} fill={atmo(p, "#3a2c22", d)} />
      {[0, 1, 2, 3].map((i) => {
        const t = i / 3;
        const yy = ground - h * (0.18 + t * 0.78);
        const ww = w * (1 - t * 0.62);
        return (
          <path
            key={i}
            d={`M ${x} ${yy - h * 0.26} L ${x + ww} ${yy} L ${x - ww} ${yy} Z`}
            fill={body}
          />
        );
      })}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Architecture
// ---------------------------------------------------------------------------

/** A run of flat-roofed Moroccan houses. */
export function Rooftops({
  x,
  ground,
  width,
  base,
  p,
  d,
  seed = 7,
  color = "#c98f5f",
}: Depth & {
  x: number;
  ground: number;
  width: number;
  base: number;
  seed?: number;
  color?: string;
}) {
  const r = rng(seed);
  const blocks: React.ReactNode[] = [];
  /** Whitewash, ochre and terracotta — the actual range of a Moroccan street. */
  const washes = [color, "#ded2c0", "#c98357", "#d9b48a", "#c5a074"];
  /** Shutters and doors are the only saturated things on these walls. */
  const joinery = ["#3f6b7a", "#2f5a52", "#7a4436", "#4a5a80"];

  let cx = x;
  let i = 0;
  while (cx < x + width) {
    const w = 70 + r() * 120;
    const h = base * (0.55 + r() * 0.75);
    const wash = washes[Math.floor(r() * washes.length)];
    const face = atmo(p, lit(p, wash, 0.16), d);
    const side = atmo(p, shadowed(p, wash, 0.34), d);
    const cornice = atmo(p, shadowed(p, wash, 0.2), d);
    const rows = Math.max(1, Math.floor(h / 62));
    const trim = joinery[Math.floor(r() * joinery.length)];

    blocks.push(
      <Fragment key={i}>
        {/* sunlit face */}
        <rect x={cx} y={ground - h} width={w} height={h} fill={face} />
        {/* the returning side, in shadow — this is what gives the row form */}
        <rect x={cx + w - w * 0.16} y={ground - h} width={w * 0.16} height={h} fill={side} />
        {/* parapet, catching the most light */}
        <rect x={cx - 3} y={ground - h - 7} width={w + 6} height={8} fill={atmo(p, lit(p, wash, 0.3), d)} />
        <rect x={cx - 3} y={ground - h + 1} width={w + 6} height={3} fill={cornice} />

        {r() > 0.5 ? (
          <rect x={cx + w * 0.3} y={ground - h - 24} width={4} height={19} fill={atmo(p, "#4a4038", d)} />
        ) : null}
        {r() > 0.68 ? (
          <g>
            <circle cx={cx + w * 0.66} cy={ground - h - 13} r={8} fill={atmo(p, "#d8d2c4", d)} opacity="0.85" />
            <rect x={cx + w * 0.66 - 1} y={ground - h - 13} width={2} height={12} fill={atmo(p, "#8a8278", d)} />
          </g>
        ) : null}

        {/* shuttered windows, recessed */}
        {Array.from({ length: rows }, (_, k) => {
          const wy = ground - h + 20 + k * 54;
          const ww = w * 0.19;
          return (
            <Fragment key={k}>
              <rect x={cx + w * 0.2} y={wy - 3} width={ww + 6} height={30} fill={cornice} />
              <rect x={cx + w * 0.2 + 3} y={wy} width={ww} height={24} fill={atmo(p, "#3a2c26", d)} />
              <rect x={cx + w * 0.2 + 3} y={wy} width={ww * 0.46} height={24} fill={atmo(p, trim, d)} opacity="0.9" />
              {r() > 0.6 ? (
                <rect x={cx + w * 0.56} y={wy} width={ww * 0.9} height={22} fill={atmo(p, trim, d)} opacity="0.75" />
              ) : null}
            </Fragment>
          );
        })}
      </Fragment>,
    );
    cx += w + 6 + r() * 14;
    i++;
  }
  return <g>{blocks}</g>;
}

/** Distant city silhouette — a minaret and low blocks. */
export function CitySkyline({
  x,
  ground,
  width,
  p,
  d,
  seed = 11,
}: Depth & { x: number; ground: number; width: number; seed?: number }) {
  const r = rng(seed);
  const fill = atmo(p, "#8a7a68", d);
  const parts: React.ReactNode[] = [];
  let cx = x;
  let i = 0;
  while (cx < x + width) {
    const w = 40 + r() * 80;
    const h = 30 + r() * 70;
    parts.push(<rect key={i} x={cx} y={ground - h} width={w} height={h} fill={fill} />);
    cx += w + r() * 20;
    i++;
  }
  const mx = x + width * 0.62;
  parts.push(
    <Fragment key="minaret">
      <rect x={mx} y={ground - 210} width={34} height={210} fill={fill} />
      <rect x={mx - 5} y={ground - 232} width={44} height={26} fill={fill} />
      <path d={`M ${mx + 17} ${ground - 274} L ${mx + 31} ${ground - 232} L ${mx + 3} ${ground - 232} Z`} fill={fill} />
      <circle cx={mx + 17} cy={ground - 282} r={6} fill={fill} />
    </Fragment>,
  );
  return <g>{parts}</g>;
}

export function HillRange({
  x,
  ground,
  width,
  height,
  p,
  d,
  seed = 5,
  color = "#6c7a5e",
}: Depth & {
  x: number;
  ground: number;
  width: number;
  height: number;
  seed?: number;
  color?: string;
}) {
  const r = rng(seed);
  const steps = 9;
  let path = `M ${x} ${ground}`;
  for (let i = 0; i <= steps; i++) {
    const px = x + (width * i) / steps;
    const py = ground - height * (0.35 + r() * 0.65);
    path += ` Q ${px - width / steps / 2} ${py - height * 0.12} ${px} ${py}`;
  }
  path += ` L ${x + width} ${ground} Z`;
  return <path d={path} fill={atmo(p, color, d)} />;
}

/** Layered alpine peaks with snowlines. */
export function Peaks({
  x,
  ground,
  width,
  height,
  p,
  d,
  seed = 13,
  snow = true,
}: Depth & {
  x: number;
  ground: number;
  width: number;
  height: number;
  seed?: number;
  snow?: boolean;
}) {
  const r = rng(seed);
  const rock = atmo(p, "#54607a", d);
  const snowC = atmo(p, "#f2f6fa", d * 0.55);
  const peaks: React.ReactNode[] = [];
  let cx = x - 60;
  let i = 0;
  while (cx < x + width) {
    const w = 220 + r() * 300;
    const h = height * (0.55 + r() * 0.5);
    const apex = cx + w / 2;
    peaks.push(
      <Fragment key={i}>
        <path d={`M ${cx} ${ground} L ${apex} ${ground - h} L ${cx + w} ${ground} Z`} fill={rock} />
        {snow ? (
          <path
            d={`M ${apex - w * 0.17} ${ground - h * 0.66} L ${apex} ${ground - h} L ${apex + w * 0.17} ${ground - h * 0.66}
                l ${-w * 0.05} ${h * 0.06} l ${-w * 0.06} ${-h * 0.07} l ${-w * 0.07} ${h * 0.08} l ${-w * 0.05} ${-h * 0.06} Z`}
            fill={snowC}
            opacity="0.92"
          />
        ) : null}
      </Fragment>,
    );
    cx += w * 0.62;
    i++;
  }
  return <g>{peaks}</g>;
}

// ---------------------------------------------------------------------------
// Objects
// ---------------------------------------------------------------------------

export function Football({ x, y, r = 15, p }: { x: number; y: number; r?: number; p: Palette }) {
  return (
    <g>
      <ellipse cx={x} cy={y + r * 0.95} rx={r * 0.9} ry={r * 0.24} fill="#000" opacity="0.22" />
      <circle cx={x} cy={y} r={r} fill="#f4f1e8" />
      <path
        d={`M ${x} ${y - r * 0.52} l ${r * 0.5} ${r * 0.36} l ${-r * 0.19} ${r * 0.58} l ${-r * 0.62} 0 l ${-r * 0.19} ${-r * 0.58} Z`}
        fill="#23201f"
      />
      <path d={`M ${x - r * 0.86} ${y - r * 0.28} l ${r * 0.34} ${r * 0.14}`} stroke="#23201f" strokeWidth={r * 0.14} />
      <path d={`M ${x + r * 0.86} ${y - r * 0.28} l ${-r * 0.34} ${r * 0.14}`} stroke="#23201f" strokeWidth={r * 0.14} />
      <path d={`M ${x} ${y + r * 0.92} l 0 ${-r * 0.26}`} stroke="#23201f" strokeWidth={r * 0.16} />
      <circle cx={x - r * 0.3} cy={y - r * 0.34} r={r * 0.24} fill="#fff" opacity="0.4" />
      <circle cx={x} cy={y} r={r} fill="none" stroke={withAlpha(p.fill, 0.25)} strokeWidth="1" />
    </g>
  );
}

export function BasketballHoop({
  x,
  ground,
  h = 250,
  p,
  d,
}: Depth & { x: number; ground: number; h?: number }) {
  const post = atmo(p, "#4a4a4e", d);
  const board = atmo(p, "#d8d2c2", d);
  return (
    <g>
      {/* slightly bent, the way they always are */}
      <path d={`M ${x} ${ground} L ${x + 4} ${ground - h * 0.6} L ${x + 12} ${ground - h}`} stroke={post} strokeWidth="9" fill="none" />
      <rect x={x - 2} y={ground - h - 58} width={64} height={54} rx={3} fill={board} transform={`rotate(3 ${x + 30} ${ground - h - 30})`} />
      <rect x={x + 16} y={ground - h - 34} width={28} height={22} fill="none" stroke={atmo(p, "#b4442f", d)} strokeWidth="3" transform={`rotate(3 ${x + 30} ${ground - h - 30})`} />
      <path d={`M ${x + 14} ${ground - h - 6} l 32 0`} stroke={atmo(p, "#c8502f", d)} strokeWidth="4" />
      <path
        d={`M ${x + 16} ${ground - h - 4} l 4 16 l 8 -14 l 4 16 l 8 -16 l 4 14 l 4 -16`}
        stroke={atmo(p, "#e8e2d4", d)}
        strokeWidth="2"
        fill="none"
        opacity="0.8"
      />
    </g>
  );
}

export function Bicycle({ x, ground, s = 1, p, d }: Depth & { x: number; ground: number; s?: number }) {
  const c = atmo(p, "#3a3f4a", d);
  const r = 26 * s;
  return (
    <g opacity="0.95">
      <circle cx={x} cy={ground - r} r={r} fill="none" stroke={c} strokeWidth={3 * s} />
      <circle cx={x + r * 2.5} cy={ground - r} r={r} fill="none" stroke={c} strokeWidth={3 * s} />
      <path
        d={`M ${x} ${ground - r} L ${x + r * 1.1} ${ground - r * 1.9} L ${x + r * 2.1} ${ground - r * 1.9} L ${x + r * 2.5} ${ground - r} L ${x + r * 1.1} ${ground - r} Z`}
        fill="none"
        stroke={c}
        strokeWidth={3 * s}
      />
      <path d={`M ${x + r * 2.1} ${ground - r * 1.9} l ${r * 0.36} ${-r * 0.42}`} stroke={c} strokeWidth={3 * s} />
      <path d={`M ${x + r * 1.0} ${ground - r * 2.0} l ${r * 0.5} 0`} stroke={c} strokeWidth={4 * s} />
    </g>
  );
}

export function LaundryLine({
  x,
  y,
  width,
  p,
  d,
  seed = 17,
}: Depth & { x: number; y: number; width: number; seed?: number }) {
  const r = rng(seed);
  const colors = ["#d8d2c4", "#c9a06a", "#7a94a8", "#d4736a", "#e8dcc0"];
  const sag = 16;
  return (
    <g>
      <path d={`M ${x} ${y} Q ${x + width / 2} ${y + sag} ${x + width} ${y}`} stroke={atmo(p, "#7a6a58", d)} strokeWidth="1.6" fill="none" />
      {Array.from({ length: 6 }, (_, i) => {
        const t = (i + 0.6) / 7;
        const px = x + width * t;
        const py = y + Math.sin(t * Math.PI) * sag;
        const w = 20 + r() * 16;
        const h = 26 + r() * 22;
        return (
          <rect
            key={i}
            x={px - w / 2}
            y={py}
            width={w}
            height={h}
            rx={2}
            fill={atmo(p, colors[Math.floor(r() * colors.length)], d)}
            opacity="0.9"
          />
        );
      })}
    </g>
  );
}

/** Anonymous people. Never detailed — only he and his mother are ever drawn in full. */
export function Crowd({
  x,
  ground,
  width,
  count,
  p,
  d,
  seed = 23,
  height = 150,
  opacity = 0.5,
}: Depth & {
  x: number;
  ground: number;
  width: number;
  count: number;
  seed?: number;
  height?: number;
  opacity?: number;
}) {
  const r = rng(seed);
  const fill = atmo(p, shadowed(p, "#2a2630", 0.2), d);
  return (
    <g opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const px = x + r() * width;
        const h = height * (0.84 + r() * 0.28);
        const w = h * 0.17;
        const headR = h * 0.082;
        const stride = r() * 0.5;
        return (
          <g key={i}>
            <ellipse cx={px} cy={ground} rx={w * 0.8} ry={3.5} fill="#000" opacity="0.16" />
            {/* legs, slightly apart so they read as walking */}
            <path
              d={`M ${px - w * 0.26} ${ground - h * 0.46} l ${-stride * w * 0.5} ${h * 0.46} l ${w * 0.24} 0 l ${stride * w * 0.4 + w * 0.1} ${-h * 0.44} Z`}
              fill={fill}
            />
            <path
              d={`M ${px + w * 0.06} ${ground - h * 0.46} l ${stride * w * 0.5} ${h * 0.46} l ${w * 0.24} 0 l ${-stride * w * 0.4 + w * 0.1} ${-h * 0.44} Z`}
              fill={fill}
            />
            {/* torso: shoulders, waist */}
            <path
              d={`M ${px - w * 0.42} ${ground - h * 0.72}
                  Q ${px} ${ground - h * 0.8} ${px + w * 0.42} ${ground - h * 0.72}
                  L ${px + w * 0.3} ${ground - h * 0.42}
                  L ${px - w * 0.3} ${ground - h * 0.42} Z`}
              fill={fill}
            />
            <path d={`M ${px - w * 0.06} ${ground - h * 0.78} l 0 ${h * 0.06}`} stroke={fill} strokeWidth={w * 0.2} />
            <circle cx={px} cy={ground - h * 0.86 - headR * 0.4} r={headR} fill={fill} />
          </g>
        );
      })}
    </g>
  );
}

/** A seated audience, in rows receding. Backs of heads and shoulders only. */
export function SeatedRows({
  x,
  ground,
  width,
  rows,
  p,
  d,
  seed = 401,
  scale = 1,
  seat,
}: Depth & {
  x: number;
  ground: number;
  width: number;
  rows: number;
  seed?: number;
  scale?: number;
  seat?: string;
}) {
  const r = rng(seed);
  const chair = seat ?? "#3a2a26";
  return (
    <g>
      {Array.from({ length: rows }, (_, row) => {
        const t = row / Math.max(1, rows - 1);
        // Nearer rows sit lower in frame and larger.
        const gy = ground + row * 26 * scale;
        const s = scale * (0.86 + t * 0.3);
        const depth = d * (1 - t * 0.7);
        const fill = atmo(p, shadowed(p, "#2b2028", 0.16 + t * 0.16), depth);
        const chairFill = atmo(p, shadowed(p, chair, 0.2), depth);
        const spacing = 62 * s;
        const n = Math.floor(width / spacing);
        return (
          <g key={row}>
            {/* the row of chair backs */}
            <rect x={x} y={gy - 44 * s} width={width} height={16 * s} rx={4 * s} fill={chairFill} />
            {Array.from({ length: n }, (_, i) => {
              const px = x + i * spacing + spacing * 0.5 + (r() - 0.5) * 8;
              const hh = 74 * s * (0.94 + r() * 0.14);
              const hw = 15 * s;
              return (
                <g key={i}>
                  <path
                    d={`M ${px - hw * 1.5} ${gy - 40 * s}
                        Q ${px} ${gy - hh * 0.92} ${px + hw * 1.5} ${gy - 40 * s} Z`}
                    fill={fill}
                  />
                  <circle cx={px} cy={gy - hh * 0.94} r={hw} fill={fill} />
                </g>
              );
            })}
            <rect x={x} y={gy - 30 * s} width={width} height={9 * s} fill={chairFill} opacity="0.8" />
          </g>
        );
      })}
    </g>
  );
}

/** Ground surface with a subtle texture band — never a flat rectangle. */
export function GroundStrip({
  x,
  width,
  ground,
  p,
  seed = 31,
  color,
}: {
  x: number;
  width: number;
  ground: number;
  p: Palette;
  seed?: number;
  color?: string;
}) {
  const r = rng(seed);
  const base = color ?? p.ground;
  const id = useId();
  const depth = 900 - ground + 220;
  return (
    <g>
      <defs>
        {/* The ground nearest the camera falls away into shadow — without this
            ramp the lower fifth of every frame is a flat slab. */}
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lit(p, base, 0.14)} />
          <stop offset="34%" stopColor={base} />
          <stop offset="100%" stopColor={shadowed(p, base, 0.42)} />
        </linearGradient>
      </defs>
      <rect x={x} y={ground} width={width} height={depth} fill={`url(#${id})`} />
      {/* the lit lip right at the horizon line */}
      <rect x={x} y={ground} width={width} height={4} fill={lit(p, base, 0.36)} />
      <rect x={x} y={ground + 4} width={width} height={13} fill={shadowed(p, base, 0.26)} opacity="0.5" />

      {/* worn tracks and scuffs, thinning with distance from the horizon */}
      {Array.from({ length: Math.floor(width / 46) }, (_, i) => {
        const yy = ground + 10 + r() * 150;
        const fade = 1 - (yy - ground) / 190;
        return (
          <ellipse
            key={i}
            cx={x + r() * width}
            cy={yy}
            rx={16 + r() * 62}
            ry={2 + r() * 5}
            fill={shadowed(p, base, 0.34)}
            opacity={(0.12 + r() * 0.2) * Math.max(0.25, fade)}
          />
        );
      })}
      {Array.from({ length: Math.floor(width / 220) }, (_, i) => (
        <ellipse
          key={`st${i}`}
          cx={x + r() * width}
          cy={ground + 18 + r() * 130}
          rx={2 + r() * 4}
          ry={1.4 + r() * 2}
          fill={lit(p, base, 0.2)}
          opacity={0.4 + r() * 0.3}
        />
      ))}
    </g>
  );
}

/** Diegetic type: a year or a place, painted on a wall or a sign. */
export function WorldLabel({
  x,
  y,
  text,
  p,
  size = 26,
  opacity = 0.55,
  anchor = "start",
}: {
  x: number;
  y: number;
  text: string;
  p: Palette;
  size?: number;
  opacity?: number;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={p.ink}
      opacity={opacity}
      textAnchor={anchor}
      style={{
        font: `${size}px var(--font-mono), ui-monospace, monospace`,
        letterSpacing: "0.16em",
      }}
    >
      {text}
    </text>
  );
}
