/**
 * 06 · The Crossing
 *
 * Suspension. The only chapter with no ground under him and the only one where
 * he isn't walking — he is seated, small, framed by a window, and the world
 * moves past instead of him moving through it.
 *
 * Cloud layers at four different speeds do all the work.
 */

import type { Chapter } from "@/engine/types";
import { PALETTES, atmo, lit } from "../palette";
import { Sun, rng } from "../props";

const P = PALETTES.crossing;
const G = 700;
const SPAN: [number, number] = [10800, 12000];
const W = SPAN[1] - SPAN[0];

function CloudBank({
  y,
  scale,
  opacity,
  seed,
  color,
}: {
  y: number;
  scale: number;
  opacity: number;
  seed: number;
  color: string;
}) {
  const r = rng(seed);
  return (
    <g opacity={opacity}>
      {Array.from({ length: 9 }, (_, i) => {
        const cx = -200 + r() * (W + 400);
        const cy = y + (r() - 0.5) * 60 * scale;
        const w = (140 + r() * 220) * scale;
        const h = (26 + r() * 34) * scale;
        return (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={w} ry={h} fill={color} />
            <ellipse cx={cx - w * 0.4} cy={cy + h * 0.3} rx={w * 0.6} ry={h * 0.8} fill={color} />
            <ellipse cx={cx + w * 0.45} cy={cy + h * 0.24} rx={w * 0.5} ry={h * 0.72} fill={color} />
          </g>
        );
      })}
    </g>
  );
}

export const crossing: Chapter = {
  id: "crossing",
  span: SPAN,
  palette: P,
  surface: "none",

  layers: {
    far: ({ palette }) => (
      <g>
        <Sun x={W * 0.78} y={168} r={40} color="#ffffff" glowR={420} intensity={0.55} />
        <CloudBank y={300} scale={1.5} opacity={0.34} seed={211} color={atmo(palette, "#ffffff", 0.5)} />
      </g>
    ),

    mid: ({ palette }) => (
      <g>
        <CloudBank y={430} scale={1.1} opacity={0.55} seed={223} color={atmo(palette, "#f4f9fd", 0.3)} />
      </g>
    ),

    near: ({ palette }) => (
      <g>
        <CloudBank y={620} scale={0.85} opacity={0.75} seed={227} color="#ffffff" />
      </g>
    ),

    ground: ({ palette }) => (
      <g>
        {/* the cloud deck he is flying over — this chapter's "floor" */}
        <CloudBank y={G + 90} scale={1.3} opacity={0.9} seed={229} color="#ffffff" />
        <rect x={-200} y={G + 150} width={W + 400} height={300} fill={lit(palette, "#eef5fa", 0.2)} opacity="0.85" />
      </g>
    ),

    fore: ({ palette }) => (
      <g>
        <CloudBank y={G + 20} scale={0.6} opacity={0.5} seed={233} color="#ffffff" />
      </g>
    ),
  },

  beats: [
    {
      id: "crossing-up",
      at: 10860,
      run: async (c) => {
        c.character.express("wonder", 0.7);
        c.camera.apply({ zoom: 0.94, y: -60, duration: 3.2 });
        await c.wait(2400);
        await c.wait(3800);
        c.camera.release();
        c.character.express("curious", 0.5);
      },
    },
  ],
};
