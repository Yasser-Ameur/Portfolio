/**
 * 03 · The Climb — school years
 *
 * Deliberately the plainest chapter in the experience. Six years compressed
 * into fifteen seconds of walking, told as *rhythm* rather than stagnation: one
 * window module repeating down a corridor, with the light across it changing
 * every bay. Years passing, drawn as architecture.
 *
 * He gets taller here, and the glasses arrive. Neither is announced.
 */

import type { Chapter } from "@/engine/types";
import { PALETTES, atmo, lit, shadowed } from "../palette";
import { Crowd, GlowWindow, GroundStrip, HillRange, WorldLabel, rng } from "../props";

const P = PALETTES.school;
const G = 700;
const SPAN: [number, number] = [5000, 7200];
const W = SPAN[1] - SPAN[0];

const BAYS = 9;
const BAY_W = 150;
const CORRIDOR_X = 480;

/** The light across each bay drifts from cold morning to warm late afternoon. */
const bayLight = (i: number) => {
  const t = i / (BAYS - 1);
  const warm = ["#c9d8e4", "#d4dde4", "#e2ddd4", "#eedcc4", "#f2d2ac", "#e8c49a", "#d8b48c", "#c9a884", "#b89a7c"];
  return warm[Math.min(warm.length - 1, Math.round(t * (warm.length - 1)))];
};

export const school: Chapter = {
  id: "school",
  span: SPAN,
  palette: P,
  surface: "corridor",

  layers: {
    far: ({ palette }) => (
      <g>
        <HillRange x={-100} ground={G - 40} width={W + 200} height={140} p={palette} d={0.9} seed={71} color="#7a8470" />
      </g>
    ),

    mid: ({ palette }) => {
      const r = rng(83);
      return (
        <g>
          {Array.from({ length: 7 }, (_, i) => (
            <rect
              key={i}
              x={-80 + i * 340 + r() * 60}
              y={G - 160 - r() * 90}
              width={200 + r() * 120}
              height={280}
              fill={atmo(palette, "#9a9c96", 0.62)}
            />
          ))}
        </g>
      );
    },

    ground: ({ palette }) => {
      const r = rng(97);
      return (
        <g>
          <GroundStrip x={-200} width={W + 400} ground={G} p={palette} seed={89} color="#a09884" />

          {/* schoolyard wall on approach */}
          <rect x={-200} y={G - 190} width={CORRIDOR_X + 200} height={190} fill={lit(palette, "#b8ac94", 0.08)} />
          <rect x={-200} y={G - 200} width={CORRIDOR_X + 200} height={12} fill={shadowed(palette, "#8a8070", 0.2)} />

          {/* ---- the corridor: one module, repeated -------------------------- */}
          <g>
            <rect x={CORRIDOR_X} y={200} width={BAYS * BAY_W} height={G - 200} fill={lit(palette, "#c8c0ac", 0.05)} />
            <rect x={CORRIDOR_X} y={188} width={BAYS * BAY_W} height={16} fill={shadowed(palette, "#8a8070", 0.24)} />

            {Array.from({ length: BAYS }, (_, i) => {
              const x = CORRIDOR_X + i * BAY_W;
              const light = bayLight(i);
              return (
                <g key={i}>
                  {/* pillar */}
                  <rect x={x} y={204} width={26} height={G - 204} fill={shadowed(palette, "#a49a86", 0.18)} />
                  {/* the window — same window, different year */}
                  <rect x={x + 38} y={G - 330} width={92} height={196} fill={shadowed(palette, "#6a6458", 0.3)} />
                  <GlowWindow x={x + 44} y={G - 324} w={80} h={184} color={light} intensity={0.62} />
                  <rect x={x + 80} y={G - 324} width={5} height={184} fill={shadowed(palette, "#6a6458", 0.2)} />
                  <rect x={x + 44} y={G - 232} width={80} height={5} fill={shadowed(palette, "#6a6458", 0.2)} />
                  {/* light pooling on the floor, drifting later each bay */}
                  <path
                    d={`M ${x + 44} ${G} L ${x + 124} ${G} L ${x + 150 + i * 6} ${G + 74} L ${x + 62 + i * 6} ${G + 74} Z`}
                    fill={light}
                    opacity="0.15"
                  />
                  {/* a locker or a noticeboard, alternating */}
                  {i % 2 === 0 ? (
                    <rect x={x + 4} y={G - 148} width={30} height={148} fill={shadowed(palette, "#7a8494", 0.14)} />
                  ) : (
                    <rect x={x + 2} y={G - 268} width={34} height={62} fill={lit(palette, "#c4b8a0", 0.1)} opacity="0.9" />
                  )}
                </g>
              );
            })}

            <rect x={CORRIDOR_X} y={G} width={BAYS * BAY_W} height={200} fill={shadowed(palette, "#8a8272", 0.16)} />
          </g>

          {/* ---- the courtyard ---------------------------------------------- */}
          <g>
            <rect x={CORRIDOR_X + BAYS * BAY_W} y={260} width={W - (CORRIDOR_X + BAYS * BAY_W) + 200} height={G - 260} fill={lit(palette, "#b4ac98", 0.06)} />
            <Crowd x={CORRIDOR_X + BAYS * BAY_W + 60} ground={G} width={480} count={6} p={palette} d={0.12} seed={103} height={150} opacity={0.34} />
            {/* benches, and books left on them */}
            {[0, 1].map((i) => (
              <g key={i}>
                <rect x={1960 + i * 210} y={G - 46} width={128} height={11} rx={3} fill={shadowed(palette, "#7a6a52", 0.16)} />
                <rect x={1972 + i * 210} y={G - 35} width={10} height={35} fill={shadowed(palette, "#6a5c48", 0.2)} />
                <rect x={2064 + i * 210} y={G - 35} width={10} height={35} fill={shadowed(palette, "#6a5c48", 0.2)} />
                {i === 0
                  ? Array.from({ length: 3 }, (_, k) => (
                      <rect
                        key={k}
                        x={1994 + k * 4}
                        y={G - 58 + k * 4}
                        width={54}
                        height={5}
                        fill={lit(palette, ["#3a5a7a", "#7a4438", "#5a6a4a"][k], 0.1)}
                      />
                    ))
                  : null}
              </g>
            ))}
            {r() > 2 ? null : null}
          </g>

          <WorldLabel x={CORRIDOR_X + 12} y={252} text="2016 — 2022" p={palette} size={17} opacity={0.26} />
        </g>
      );
    },

    fore: ({ palette }) => (
      <g opacity="0.5">
        <rect x={-200} y={G + 96} width={W + 400} height={12} fill={shadowed(palette, "#6a6252", 0.3)} />
      </g>
    ),
  },

  beats: [
    {
      id: "school-enter",
      at: 5120,
      run: (c) => {
        c.character.express("focus", 0.5);
      },
    },
    {
      id: "school-corridor",
      at: 5900,
      run: async (c) => {
        // No stop, no caption. The corridor does the work.
        c.camera.apply({ zoom: 1.04, duration: 2.4 });
        await c.wait(2600);
        c.camera.release();
      },
    },
  ],
};
