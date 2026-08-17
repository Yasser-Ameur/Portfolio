/**
 * 07 · Lausanne — EPFL
 *
 * The palette inverts and everything is bigger. In Morocco the horizon sat a
 * few hundred units away and the sky was a narrow band; here the far plane
 * retreats for kilometres and the sky takes half the frame. Scale is the whole
 * argument of this chapter.
 *
 * Concrete and glass. Students moving at speeds that have nothing to do with
 * him — the first time the world contains people who aren't there for him.
 * Mathematics is present but quiet: a curve on a whiteboard behind glass, a
 * diagram taped up. It is a beautiful cold campus that happens to have
 * mathematics in it, not a hacker aesthetic.
 *
 * And once, at the far end, one window is lit in a warm ochre that does not
 * otherwise exist in this half of the world. It is never explained.
 */

import type { Chapter } from "@/engine/types";
import { PALETTES, atmo, lit, shadowed } from "../palette";
import {
  Conifer,
  Crowd,
  GlowWindow,
  GroundStrip,
  HillRange,
  Peaks,
  WorldLabel,
  rng,
} from "../props";

const P = PALETTES.arrival;
const G = 700;
const SPAN: [number, number] = [12000, 13400];
const W = SPAN[1] - SPAN[0];

/** The one warm window. */
const HER_WINDOW = 1180;

export const arrival: Chapter = {
  id: "arrival",
  span: SPAN,
  palette: P,
  surface: "tile",

  layers: {
    far: ({ palette }) => (
      <g>
        <Peaks x={-200} ground={G - 150} width={W + 400} height={330} p={palette} d={0.92} seed={239} />
        <HillRange x={-200} ground={G - 120} width={W + 400} height={130} p={palette} d={0.82} seed={241} color="#5c7264" />
        {/* the lake */}
        <rect x={-200} y={G - 122} width={W + 400} height={122} fill={atmo(palette, "#3f7f9e", 0.7)} />
        <rect x={-200} y={G - 122} width={W + 400} height={3} fill={atmo(palette, "#cfe6f2", 0.4)} />
        {Array.from({ length: 26 }, (_, i) => {
          const r = rng(i * 5 + 3);
          return (
            <rect
              key={i}
              x={r() * (W + 200) - 100}
              y={G - 116 + r() * 100}
              width={20 + r() * 70}
              height={1.6}
              fill="#ffffff"
              opacity={0.1 + r() * 0.22}
            />
          );
        })}
      </g>
    ),

    mid: ({ palette }) => {
      const r = rng(251);
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => (
            <Conifer key={i} x={-60 + i * 190 + r() * 60} ground={G - 26} h={130 + r() * 90} p={palette} d={0.62} />
          ))}
          {/* campus volumes, further back */}
          {Array.from({ length: 4 }, (_, i) => (
            <rect
              key={`b${i}`}
              x={120 + i * 380}
              y={G - 180 - r() * 60}
              width={220 + r() * 90}
              height={240}
              fill={atmo(palette, "#8c98a4", 0.58)}
            />
          ))}
        </g>
      );
    },

    ground: ({ palette }) => {
      const r = rng(257);
      /* The left half is deliberately left open. This chapter's whole argument
         is scale, so the lake and the Alps have to be *visible* — putting the
         campus across the full span would bury the point. */
      const BUILD_X = 900;
      return (
        <g>
          <GroundStrip x={0} width={W} ground={G} p={palette} seed={263} color="#93a0aa" />
          {/* paving joints — the ground here is made, not worn */}
          {Array.from({ length: 20 }, (_, i) => (
            <rect key={i} x={20 + i * 96} y={G} width={2} height={110} fill={shadowed(palette, "#6f7f8a", 0.3)} opacity="0.35" />
          ))}
          <rect x={0} y={G} width={W} height={5} fill={lit(palette, "#d2dde4", 0.3)} />

          {/* the parapet he looks over — low, so the view stays open */}
          <rect x={-40} y={G - 46} width={BUILD_X - 140} height={46} fill={lit(palette, "#9fadb7", 0.08)} />
          <rect x={-40} y={G - 52} width={BUILD_X - 140} height={9} fill={lit(palette, "#cdd9e1", 0.2)} />
          <rect x={-40} y={G - 8} width={BUILD_X - 140} height={8} fill={shadowed(palette, "#6f7f8a", 0.26)} />

          {/* a bench facing the lake, and someone already sitting on it */}
          <g>
            <rect x={300} y={G - 66} width={150} height={9} rx={3} fill={shadowed(palette, "#4d5a66", 0.16)} />
            <rect x={312} y={G - 57} width={9} height={57} fill={shadowed(palette, "#4d5a66", 0.22)} />
            <rect x={430} y={G - 57} width={9} height={57} fill={shadowed(palette, "#4d5a66", 0.22)} />
            <ellipse cx={375} cy={G + 3} rx={92} ry={9} fill="#000" opacity="0.12" />
          </g>

          {/* ---- the campus: concrete frame, glass infill ------------------ */}
          <g>
            <rect x={BUILD_X} y={200} width={W - BUILD_X + 80} height={G - 200} fill={lit(palette, "#a8b2ba", 0.06)} />
            {[0, 1, 2].map((f) => (
              <rect key={f} x={BUILD_X - 14} y={236 + f * 152} width={W - BUILD_X + 108} height={17} fill={shadowed(palette, "#7d8a94", 0.22)} />
            ))}
            {Array.from({ length: 6 }, (_, i) => {
              const x = BUILD_X + 30 + i * 104;
              return (
                <g key={i}>
                  {[0, 1, 2].map((f) => (
                    <GlowWindow
                      key={f}
                      x={x}
                      y={256 + f * 152}
                      w={80}
                      h={124}
                      color="#cfe0ea"
                      intensity={0.24 + r() * 0.12}
                    />
                  ))}
                  <rect x={x - 12} y={200} width={12} height={G - 200} fill={shadowed(palette, "#8d99a2", 0.18)} />
                </g>
              );
            })}

            {/* the one warm window — never explained, never repeated */}
            <GlowWindow x={HER_WINDOW} y={408} w={80} h={124} color="#f0b070" intensity={0.6} />

            {/* a whiteboard behind glass, at ground level */}
            <g>
              <rect x={BUILD_X + 60} y={G - 186} width={214} height={128} fill="#f2f5f7" opacity="0.92" />
              <path
                d={`M ${BUILD_X + 84} ${G - 88} q 40 -72 84 -34 q 34 30 84 -52`}
                stroke={palette.accent}
                strokeWidth="2.8"
                fill="none"
                opacity="0.75"
              />
              <path d={`M ${BUILD_X + 78} ${G - 80} l 186 0`} stroke="#8d99a2" strokeWidth="1.6" opacity="0.6" />
              <path d={`M ${BUILD_X + 84} ${G - 74} l 0 -94`} stroke="#8d99a2" strokeWidth="1.6" opacity="0.6" />
            </g>
          </g>

          {/* bicycles in a rack */}
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i} opacity="0.85">
              <circle cx={BUILD_X - 120 + i * 44} cy={G - 20} r={19} fill="none" stroke={shadowed(palette, "#4d5a66", 0.2)} strokeWidth="2.8" />
              <path
                d={`M ${BUILD_X - 120 + i * 44} ${G - 20} l 10 -26 l 18 0`}
                stroke={shadowed(palette, "#4d5a66", 0.2)}
                strokeWidth="2.8"
                fill="none"
              />
            </g>
          ))}

          {/* students, moving at speeds that have nothing to do with him */}
          <Crowd x={520} ground={G} width={300} count={3} p={palette} d={0.05} seed={269} height={164} opacity={0.4} />
          <Crowd x={BUILD_X + 180} ground={G} width={420} count={4} p={palette} d={0.05} seed={271} height={160} opacity={0.34} />

          <WorldLabel x={BUILD_X + 34} y={188} text="LAUSANNE · EPFL" p={palette} size={19} opacity={0.44} />
          <WorldLabel x={40} y={G - 76} text="2022" p={palette} size={15} opacity={0.26} />
        </g>
      );
    },

    fore: ({ palette }) => (
      <g opacity="0.6">
        <rect x={-200} y={G + 128} width={W + 400} height={16} fill={shadowed(palette, "#6a7a86", 0.3)} />
      </g>
    ),
  },

  beats: [
    {
      id: "arrival-open",
      at: 12080,
      run: async (c) => {
        c.character.stop();
        c.character.express("wonder", 1);
        // Pull back and look up. He is small here, and that is the point.
        c.camera.apply({ zoom: 0.86, y: -70, lead: 0.3, duration: 3.4 });
        await c.wait(3200);
        c.camera.release();
        c.character.express("curious", 0.7);
        c.character.resume();
      },
    },
    {
      id: "arrival-end",
      at: 13280,
      run: async (c) => {
        c.character.express("calm", 0.6);
        c.caption({
          line: "Still walking.",
          hold: 6000,
        });
        await c.wait(6200);
      },
    },
  ],
};
