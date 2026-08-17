/**
 * 00 · Before
 *
 * Almost nothing. A dark road, one warm point of light far ahead, and him.
 * The invitation is the composition, not a button.
 */

import type { Chapter } from "@/engine/types";
import { PALETTES, atmo, shadowed } from "../palette";
import { GroundStrip, Sun, rng } from "../props";

const P = PALETTES.threshold;
const G = 700;
const SPAN: [number, number] = [-600, 0];
const W = SPAN[1] - SPAN[0];

export const threshold: Chapter = {
  id: "threshold",
  span: SPAN,
  palette: P,
  surface: "dirt",

  layers: {
    far: ({ palette }) => (
      <g>
        {/* the warmth he is walking toward */}
        <Sun x={W - 40} y={520} r={12} color="#ffcf90" glowR={260} intensity={0.32} />
      </g>
    ),

    mid: ({ palette }) => {
      const r = rng(3);
      return (
        <g opacity="0.5">
          {Array.from({ length: 9 }, (_, i) => (
            <rect
              key={i}
              x={r() * W}
              y={G - 40 - r() * 90}
              width={30 + r() * 60}
              height={140}
              fill={atmo(palette, "#2a3242", 0.62)}
            />
          ))}
        </g>
      );
    },

    ground: ({ palette }) => (
      <g>
        <GroundStrip x={-200} width={W + 400} ground={G} p={palette} seed={5} />
        <rect x={-200} y={G} width={W + 400} height={200} fill={shadowed(palette, palette.ground, 0.3)} opacity="0.5" />
      </g>
    ),
  },

  beats: [
    {
      id: "threshold-open",
      at: -520,
      run: (c) => {
        c.character.express("curious", 0.4);
      },
    },
  ],
};
