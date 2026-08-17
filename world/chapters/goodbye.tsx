/**
 * 05 · Leaving Morocco
 *
 * The strongest scene in the experience, and it contains no dialogue, no music
 * cue, and no slow motion.
 *
 * They walk together for an unusually long stretch with nothing happening. Then
 * the path narrows, and she stops. He keeps walking.
 *
 * The camera does not cut and does not fade — it keeps following him, which
 * means she slides backward out of frame on her own, the way people actually
 * disappear when you leave. Hold the back key and she is still standing there,
 * smaller. She stays as long as you look.
 *
 * There is no goodbye animation. He does not turn around.
 */

import type { Chapter } from "@/engine/types";
import { PALETTES, atmo, lit, shadowed } from "../palette";
import { placeMother } from "../mother-bus";
import {
  GlowWindow,
  GroundStrip,
  HillRange,
  Palm,
  Rooftops,
  StreetLamp,
  WorldLabel,
  rng,
} from "../props";

const P = PALETTES.goodbye;
const G = 700;
const SPAN: [number, number] = [9000, 10800];
const W = SPAN[1] - SPAN[0];

/** Where the path narrows and only one of them can go on. */
const NARROWS = 900;
export const NARROWS_X = SPAN[0] + NARROWS;

export const goodbye: Chapter = {
  id: "goodbye",
  span: SPAN,
  palette: P,
  surface: "asphalt",

  layers: {
    far: ({ palette }) => (
      <g>
        <HillRange x={-100} ground={G - 50} width={W + 200} height={120} p={palette} d={0.9} seed={173} color="#7a6a70" />
        {/* the last of the light, behind the neighbourhood */}
        <ellipse cx={W * 0.14} cy={G - 60} rx={340} ry={150} fill="#f0b070" opacity="0.13" />
      </g>
    ),

    mid: ({ palette }) => (
      <g>
        {/* the neighbourhood, thinning out as the road leaves it */}
        <Rooftops x={-80} ground={G - 20} width={760} base={200} p={palette} d={0.62} seed={179} color="#8a7076" />
        <Rooftops x={780} ground={G - 20} width={340} base={150} p={palette} d={0.62} seed={181} color="#7a666c" />
        <Palm x={1180} ground={G - 20} h={230} lean={12} p={palette} d={0.62} seed={7} />
        <Palm x={1560} ground={G - 20} h={200} lean={-8} p={palette} d={0.62} seed={11} />
      </g>
    ),

    near: ({ palette }) => (
      <g>
        <Rooftops x={-60} ground={G - 8} width={620} base={230} p={palette} d={0.35} seed={191} color="#96787c" />
      </g>
    ),

    ground: ({ palette }) => {
      const r = rng(193);
      return (
        <g>
          <GroundStrip x={-200} width={W + 400} ground={G} p={palette} seed={197} color="#5a525f" />

          {/* road markings that stop where the road does */}
          {Array.from({ length: 7 }, (_, i) => (
            <rect
              key={i}
              x={-100 + i * 150}
              y={G + 54}
              width={72}
              height={5}
              fill={lit(palette, "#c4b8a4", 0.1)}
              opacity="0.28"
            />
          ))}

          {/* the last houses on his side of the street */}
          <g>
            <rect x={-200} y={G - 250} width={700} height={250} fill={lit(palette, "#8a6a62", 0.06)} />
            <rect x={-210} y={G - 264} width={720} height={16} fill={shadowed(palette, "#5a4448", 0.2)} />
            {/* one window still warm */}
            <GlowWindow x={210} y={G - 190} w={70} h={92} color="#f0b070" intensity={0.5} frame={shadowed(palette, "#4a3438", 0.3)} />
            <GlowWindow x={352} y={G - 186} w={62} h={86} color="#8a94a8" intensity={0.22} frame={shadowed(palette, "#4a3438", 0.3)} />
          </g>

          <StreetLamp x={620} ground={G} h={218} p={palette} d={0} />
          <StreetLamp x={1240} ground={G} h={218} p={palette} d={0} />
          <StreetLamp x={1720} ground={G} h={218} p={palette} d={0} />

          {/* ---- where the path narrows ------------------------------------ */}
          <g>
            {/* a low wall closes off the road; a gap continues on foot */}
            <rect x={NARROWS - 30} y={G - 96} width={26} height={96} fill={shadowed(palette, "#4a4450", 0.16)} />
            <rect x={NARROWS + 92} y={G - 96} width={26} height={96} fill={shadowed(palette, "#4a4450", 0.16)} />
            <rect x={NARROWS - 34} y={G - 104} width={34} height={12} fill={shadowed(palette, "#3a3642", 0.2)} />
            <rect x={NARROWS + 88} y={G - 104} width={34} height={12} fill={shadowed(palette, "#3a3642", 0.2)} />
            {/* the surface changes under his feet past this point */}
            <rect x={NARROWS + 118} y={G} width={W - NARROWS - 118 + 200} height={7} fill={lit(palette, "#8a8290", 0.2)} opacity="0.7" />
          </g>

          {/* a sign, the only thing that says where he is going */}
          <g>
            <rect x={1340} y={G - 262} width={7} height={262} fill={shadowed(palette, "#3e3a46", 0.2)} />
            <rect x={1300} y={G - 300} width={190} height={52} rx={4} fill={lit(palette, "#3a4a62", 0.08)} />
            <WorldLabel x={1395} y={G - 266} text="AÉROPORT" p={palette} size={20} opacity={0.66} anchor="middle" />
            <path d={`M 1462 ${G - 274} l 14 -6 l -14 -6 Z`} fill={palette.ink} opacity="0.6" />
          </g>

          {/* dust and grit at the roadside */}
          {Array.from({ length: 22 }, (_, i) => (
            <ellipse
              key={i}
              cx={r() * W}
              cy={G + 16 + r() * 76}
              rx={6 + r() * 24}
              ry={2 + r() * 3}
              fill={shadowed(palette, "#4a4450", 0.3)}
              opacity={0.2 + r() * 0.2}
            />
          ))}

          <WorldLabel x={140} y={G - 300} text="2022" p={palette} size={18} opacity={0.3} />
        </g>
      );
    },

    fore: ({ palette }) => (
      <g opacity="0.7">
        {Array.from({ length: 16 }, (_, i) => {
          const r = rng(i * 13 + 5);
          const x = -100 + r() * (W + 200);
          return (
            <path
              key={i}
              d={`M ${x} ${G + 116} q 3 -18 1 -34`}
              stroke={shadowed(palette, "#4a4450", 0.3)}
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
      </g>
    ),
  },

  beats: [
    {
      id: "goodbye-together",
      at: 9040,
      run: (c) => {
        // She walks beside him. Nothing happens for a long time. That is the scene.
        placeMother("follow", { offset: -78 });
        c.character.express("calm", 0.4);
      },
    },
    {
      id: "goodbye-stop",
      at: NARROWS_X - 40,
      run: async (c) => {
        // She stops here. He does not.
        placeMother(NARROWS_X - 96, { look: 1, sway: 0 });
        c.character.express("calm", 0.55);

        // The camera stays on him. She leaves the frame by herself.
        await c.wait(600);
        c.caption({ line: "Everything I knew fit into one bag.", hold: 3200 });
      },
    },
  ],
};
