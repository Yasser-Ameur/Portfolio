/**
 * 01 · The Yard — Morocco
 *
 * Late afternoon, the hour before you get called inside. He is small and the
 * world is not big yet: the horizon sits close and the sky is a narrow band.
 * Familiarity is rendered as proximity.
 *
 * Two beats. A football he can kick, and — through a window — the first
 * rectangle of light in the story.
 */

import type { Chapter } from "@/engine/types";
import { PALETTES, atmo, lit, shadowed } from "../palette";
import { placeMother } from "../mother-bus";
import {
  Bicycle,
  Bougainvillea,
  CastShadow,
  CitySkyline,
  Clouds,
  Crowd,
  Football,
  BasketballHoop,
  GlowWindow,
  GroundStrip,
  HillRange,
  LaundryLine,
  Palm,
  Rooftops,
  Sun,
  WorldLabel,
  rng,
} from "../props";

const P = PALETTES.yard;
const G = 700;
const SPAN: [number, number] = [0, 2600];
const W = SPAN[1] - SPAN[0];

const HOUSE_X = 1880;
const DOOR_X = 2330;
const WINDOW_X = 2120;

export const yard: Chapter = {
  id: "yard",
  span: SPAN,
  palette: P,
  surface: "dirt",
  sign: { x: 940, y: 560, label: "2010" },

  layers: {
    // ---- far: the coast, the city, the sun -------------------------------
    far: ({ palette }) => {
      const d = 0.9;
      return (
        <g>
          {/* high cloud, so the top of the frame isn't dead sky */}
          <Clouds x={-200} width={W + 400} y={110} height={190} color="#ffe6c4" opacity={0.34} seed={91} count={6} />
          <Clouds x={-200} width={W + 400} y={300} height={120} color="#ffd9a8" opacity={0.26} seed={97} count={5} />
          {/* The sun sits low and to the right — it is why every shadow in this
              chapter is long and leans left, and why the wall has a lit top. */}
          <Sun x={W * 0.78} y={470} r={44} color="#fff0cc" glowR={620} intensity={0.5} />
          {/* the sea, just visible past the neighbourhood */}
          <rect x={-200} y={G - 92} width={W + 400} height={92} fill={atmo(palette, "#5b8fa8", d)} />
          <rect x={-200} y={G - 92} width={W + 400} height={3} fill={atmo(palette, "#c9e0ea", d * 0.55)} opacity="0.9" />
          {/* the sun's track on the water */}
          <path
            d={`M ${W * 0.78 - 90} ${G - 92} L ${W * 0.78 + 90} ${G - 92} L ${W * 0.78 + 40} ${G} L ${W * 0.78 - 40} ${G} Z`}
            fill="#fff0cc"
            opacity="0.2"
          />
          <HillRange x={-100} ground={G - 58} width={W + 200} height={104} p={palette} d={d} seed={41} color="#9a8a70" />
          <CitySkyline x={120} ground={G - 60} width={W * 0.8} p={palette} d={d} seed={19} />
        </g>
      );
    },

    // ---- mid: the neighbourhood ------------------------------------------
    mid: ({ palette }) => {
      const d = 0.62;
      return (
        <g>
          <Rooftops x={-60} ground={G - 22} width={W + 160} base={210} p={palette} d={d} seed={7} />
          <Palm x={330} ground={G - 22} h={280} lean={14} p={palette} d={d} seed={2} />
          <Palm x={1420} ground={G - 22} h={330} lean={-10} p={palette} d={d} seed={5} />
          <Palm x={2380} ground={G - 22} h={250} lean={8} p={palette} d={d} seed={9} />
          <LaundryLine x={760} y={470} width={230} p={palette} d={d} seed={17} />
          {/* water tower */}
          <g>
            <rect x={1820} y={G - 300} width={9} height={300} fill={atmo(palette, "#7a6a58", d)} />
            <rect x={1880} y={G - 300} width={9} height={300} fill={atmo(palette, "#7a6a58", d)} />
            <rect x={1798} y={G - 348} width={114} height={54} rx={6} fill={atmo(palette, lit(palette, "#a89a80", 0.2), d)} />
            <rect x={1798} y={G - 348} width={114} height={9} fill={atmo(palette, lit(palette, "#c4b79c", 0.3), d)} />
            <rect x={1892} y={G - 348} width={20} height={54} fill={atmo(palette, shadowed(palette, "#8a7c66", 0.3), d)} />
          </g>
        </g>
      );
    },

    // ---- near: the houses across the street -------------------------------
    near: ({ palette }) => {
      const d = 0.35;
      return (
        <g>
          <Rooftops x={-40} ground={G - 8} width={900} base={250} p={palette} d={d} seed={23} color="#d09a68" />
          <Rooftops x={1180} ground={G - 8} width={620} base={230} p={palette} d={d} seed={29} color="#c98f5f" />
          <Crowd x={420} ground={G - 8} width={300} count={3} p={palette} d={d} seed={37} height={120} opacity={0.32} />
        </g>
      );
    },

    // ---- ground: everything at his depth ----------------------------------
    ground: ({ palette }) => {
      const d = 0;
      const wallTop = 560;
      const r = rng(101);
      return (
        <g>
          <GroundStrip x={-200} width={W + 400} ground={G} p={palette} seed={31} />

          {/* The sun is low and right, so the wall throws a long shadow left
              across the yard. Everything else in the chapter obeys the same sun. */}
          <path
            d={`M 520 ${G} L 1880 ${G} L 1700 ${G + 128} L 300 ${G + 128} Z`}
            fill={shadowed(palette, palette.ground, 0.8)}
            opacity="0.13"
          />

          {/* the yard wall, with the gate gap at 880–1000 */}
          <g>
            {[
              [520, 360],
              [1000, 880],
            ].map(([wx, ww]) => (
              <g key={wx}>
                {/* body, warmed by the low sun */}
                <rect x={wx} y={wallTop} width={ww} height={G - wallTop} fill={lit(palette, "#cb9560", 0.2)} />
                {/* rendered plaster: a lighter band up top, dirt and damp below */}
                <rect x={wx} y={wallTop} width={ww} height={26} fill={lit(palette, "#e0b784", 0.26)} />
                <rect x={wx} y={G - 54} width={ww} height={54} fill={shadowed(palette, "#a8703f", 0.34)} opacity="0.55" />
                <rect x={wx} y={G - 8} width={ww} height={8} fill={shadowed(palette, "#8a5a34", 0.4)} opacity="0.7" />
                {/* coping stone, catching the most light of anything at his level */}
                <rect x={wx - 5} y={wallTop - 13} width={ww + 10} height={14} fill={lit(palette, "#eccb9c", 0.34)} />
                <rect x={wx - 5} y={wallTop + 1} width={ww + 10} height={5} fill={shadowed(palette, "#9a6338", 0.3)} />
                {/* patches where the render has come away */}
                {Array.from({ length: Math.floor(ww / 150) }, (_, i) => (
                  <ellipse
                    key={i}
                    cx={wx + 40 + r() * (ww - 80)}
                    cy={wallTop + 40 + r() * (G - wallTop - 80)}
                    rx={16 + r() * 34}
                    ry={10 + r() * 20}
                    fill={shadowed(palette, "#a8703f", 0.22)}
                    opacity={0.16 + r() * 0.16}
                  />
                ))}
              </g>
            ))}
            {/* gate posts */}
            {[868, 992].map((px) => (
              <g key={px}>
                <rect x={px} y={wallTop - 30} width={22} height={G - wallTop + 30} fill={lit(palette, "#b87d47", 0.1)} />
                <rect x={px + 15} y={wallTop - 30} width={7} height={G - wallTop + 30} fill={shadowed(palette, "#8a5a34", 0.34)} />
                <rect x={px - 4} y={wallTop - 36} width={30} height={9} fill={lit(palette, "#eccb9c", 0.3)} />
              </g>
            ))}
          </g>

          <Bougainvillea x={1080} y={wallTop - 66} w={280} h={110} p={palette} d={d} seed={3} />
          <Bougainvillea x={560} y={wallTop - 52} w={190} h={86} p={palette} d={d} seed={13} />

          {/* a football that has been kicked against this wall a thousand times */}
          <CastShadow x={1200} ground={G} length={-64} width={26} p={palette} opacity={0.2} />
          <Football x={1200} y={G - 15} r={15} p={palette} />
          {/* sandals, kicked off */}
          <g opacity="0.9">
            <ellipse cx={1258} cy={G - 4} rx={17} ry={6} fill={shadowed(palette, "#7a5238", 0.1)} />
            <ellipse cx={1290} cy={G - 2} rx={17} ry={6} fill={shadowed(palette, "#7a5238", 0.1)} transform="rotate(-14 1290 698)" />
          </g>

          <CastShadow x={1470} ground={G} length={-190} width={16} p={palette} opacity={0.17} />
          <BasketballHoop x={1470} ground={G} h={252} p={palette} d={d} />
          <CastShadow x={1690} ground={G} length={-120} width={72} p={palette} opacity={0.13} />
          <Bicycle x={1660} ground={G} s={0.92} p={palette} d={d} />

          {/* the house */}
          <g>
            <rect x={HOUSE_X} y={330} width={W - HOUSE_X + 200} height={G - 330} fill={lit(palette, "#d3a06a", 0.1)} />
            <rect x={HOUSE_X - 14} y={314} width={W - HOUSE_X + 220} height={22} fill={shadowed(palette, "#a8703f", 0.24)} />
            <rect x={HOUSE_X} y={G - 30} width={W - HOUSE_X + 200} height={30} fill={shadowed(palette, "#a8703f", 0.34)} />

            {/* the doorway — genuinely open, warm inside */}
            <rect x={DOOR_X - 6} y={G - 236} width={128} height={236} fill={shadowed(palette, "#5a3420", 0.5)} />
            <rect x={DOOR_X} y={G - 228} width={116} height={228} fill="#3a2418" />
            <rect x={DOOR_X + 4} y={G - 224} width={108} height={224} fill="#f0b878" opacity="0.24" />
            <path
              d={`M ${DOOR_X} ${G} L ${DOOR_X + 116} ${G} L ${DOOR_X + 168} ${G + 92} L ${DOOR_X - 52} ${G + 92} Z`}
              fill="#ffcf90"
              opacity="0.16"
            />
            <rect x={DOOR_X - 20} y={G - 8} width={156} height={10} rx={3} fill={shadowed(palette, "#8a5a38", 0.2)} />

            {/* arched window with the television on inside — the first rectangle of light */}
            <path
              d={`M ${WINDOW_X - 12} ${G - 250} q 64 -56 128 0 l 0 152 l -128 0 Z`}
              fill={shadowed(palette, "#6a4228", 0.4)}
            />
            <GlowWindow x={WINDOW_X} y={G - 232} w={104} h={128} color="#7fd6e8" intensity={0.5} />
            <rect x={WINDOW_X + 48} y={G - 232} width={5} height={128} fill={shadowed(palette, "#5a3420", 0.4)} opacity="0.9" />
            <rect x={WINDOW_X} y={G - 172} width={104} height={5} fill={shadowed(palette, "#5a3420", 0.4)} opacity="0.9" />

            {/* plant pots by the step */}
            {[0, 1].map((i) => (
              <g key={i}>
                <path
                  d={`M ${2270 + i * 250} ${G} l 6 -34 l 40 0 l 6 34 Z`}
                  fill={shadowed(palette, "#a05a38", 0.14)}
                />
                {Array.from({ length: 7 }, (_, k) => (
                  <circle
                    key={k}
                    cx={2276 + i * 250 + r() * 40}
                    cy={G - 36 - r() * 26}
                    r={7 + r() * 7}
                    fill={atmo(palette, "#37522f", 0.05)}
                  />
                ))}
              </g>
            ))}
          </g>

          {/* the year, painted small on the wall by the gate */}
          <WorldLabel x={1030} y={wallTop + 44} text="MOROCCO" p={palette} size={19} opacity={0.3} />
          <WorldLabel x={1030} y={wallTop + 72} text="2010" p={palette} size={15} opacity={0.22} />
        </g>
      );
    },

    // ---- fore: framing. Without this the frame is four stacked bands. -----
    fore: ({ palette }) => {
      const r = rng(211);
      const dark = shadowed(palette, palette.ground, 0.72);
      return (
        <g>
          {/* An overhanging branch across the top corner. Backlit rather than
              black — a silhouette this near the lens still catches sky. */}
          <g opacity="0.8">
            <path
              d={`M -140 -40 Q 120 60 340 30 Q 520 6 640 74`}
              stroke={shadowed(palette, "#54331f", 0.24)}
              strokeWidth="13"
              fill="none"
              strokeLinecap="round"
            />
            {Array.from({ length: 30 }, (_, i) => {
              const t = r();
              const bx = -140 + t * 780;
              const by = -30 + Math.sin(t * 3.1) * 60 + r() * 70;
              return (
                <ellipse
                  key={i}
                  cx={bx}
                  cy={by}
                  rx={12 + r() * 17}
                  ry={8 + r() * 12}
                  fill={shadowed(palette, "#3f6135", 0.16)}
                  opacity={0.72}
                />
              );
            })}
            {Array.from({ length: 14 }, (_, i) => (
              <circle
                key={`f${i}`}
                cx={-120 + r() * 740}
                cy={-20 + r() * 110}
                r={6 + r() * 9}
                fill={palette.accent}
                opacity="0.5"
              />
            ))}
          </g>

          {/* the near bank of scrub the camera looks over */}
          <path
            d={`M -200 900 L -200 ${G + 168} Q 320 ${G + 128} 760 ${G + 176} Q 1300 ${G + 210} 1780 ${G + 150} Q 2260 ${G + 116} ${W + 200} ${G + 178} L ${W + 200} 900 Z`}
            fill={dark}
            opacity="0.42"
          />
          {Array.from({ length: 54 }, (_, i) => {
            const x = -140 + r() * (W + 280);
            const base = G + 150 + r() * 60;
            const h = 30 + r() * 62;
            return (
              <path
                key={i}
                d={`M ${x} ${base} q ${-6 + r() * 12} ${-h * 0.55} ${-9 + r() * 18} ${-h}`}
                stroke={dark}
                strokeWidth={4 + r() * 3}
                fill="none"
                strokeLinecap="round"
                opacity={0.4 + r() * 0.3}
              />
            );
          })}
        </g>
      );
    },
  },

  props: [
    { id: "football", x: 1200, y: G - 15, radius: 120, label: "a football" },
    { id: "doorway", x: DOOR_X + 58, y: G - 120, radius: 150, dive: "room-interior", label: "inside" },
  ],

  beats: [
    {
      id: "yard-arrive",
      at: 240,
      run: (c) => {
        c.caption({ label: "Morocco · 2010", hold: 4200 });
        c.character.express("curious", 0.5);
      },
    },
    {
      id: "yard-football",
      at: 1160,
      run: async (c) => {
        // He notices it before he reaches it.
        c.character.express("joy", 0.75);
        c.camera.apply({ zoom: 1.08, duration: 1.1 });
        await c.wait(900);
        c.camera.release();
        c.character.express("neutral", 1);
      },
    },
    {
      id: "yard-window",
      at: 2020,
      run: async (c) => {
        c.character.stop();
        c.character.express("wonder", 0.9);
        c.camera.apply({ zoom: 1.22, lead: 0.42, duration: 1.4 });
        await c.wait(1500);

        // She is in the doorway. Not introduced — just where the warmth is.
        placeMother(DOOR_X + 58, { look: -1, sway: 0 });
        await c.wait(2600);

        c.caption({ label: "the television was always on", hold: 3400 });
        await c.waitForInput(3600);

        c.camera.release();
        c.character.express("curious", 0.6);
        c.character.resume();
      },
    },
  ],
};
