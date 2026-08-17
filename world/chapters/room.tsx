/**
 * 02 · The Machine — first code
 *
 * Dusk drains the gold out of the street and the lamps come on one at a time as
 * he passes them — the first time the world reacts to him. Then a doorway, and
 * a room at night.
 *
 * The wanting-to-make-games origin lives here in objects, not sentences: graph
 * paper with a level sketched on it, an engine open behind the code, more
 * notebooks of ideas than finished things.
 *
 * And the hallway light behind him stays on the whole time he is working. It is
 * the last thing to go out. Nobody mentions it.
 */

import type { Chapter } from "@/engine/types";
import { PALETTES, atmo, lit, shadowed } from "../palette";
import { placeMother, dismissMother } from "../mother-bus";
import {
  GlowWindow,
  GroundStrip,
  Rooftops,
  StreetLamp,
  WorldLabel,
  rng,
} from "../props";

const P = PALETTES.room;
const G = 700;
const SPAN: [number, number] = [2600, 5000];
const W = SPAN[1] - SPAN[0];

/** Local coordinates inside this chapter's SVG. */
const INTERIOR = 1150;
const DESK = 1330;
const HALL_DOOR = 1180;

export const room: Chapter = {
  id: "room",
  span: SPAN,
  palette: P,
  surface: "carpet",

  layers: {
    far: ({ palette }) => (
      <g>
        <circle cx={620} cy={190} r={26} fill="#e8eef8" opacity="0.85" />
        <circle cx={620} cy={190} r={90} fill="#cfe0f5" opacity="0.07" />
        {Array.from({ length: 40 }, (_, i) => {
          const r = rng(i * 7 + 3);
          return (
            <circle
              key={i}
              cx={r() * 1100}
              cy={60 + r() * 300}
              r={0.8 + r() * 1.4}
              fill="#dfe9f7"
              opacity={0.2 + r() * 0.45}
            />
          );
        })}
        <rect x={0} y={G - 40} width={1150} height={40} fill={atmo(palette, "#2a3550", 0.9)} />
      </g>
    ),

    mid: ({ palette }) => (
      <g>
        <Rooftops x={-60} ground={G - 18} width={1240} base={220} p={palette} d={0.62} seed={53} color="#3a4258" />
      </g>
    ),

    ground: ({ palette }) => {
      const r = rng(307);
      const wallTop = 120;
      return (
        <g>
          {/* ---- the dusk street ------------------------------------------ */}
          <GroundStrip x={-200} width={INTERIOR + 200} ground={G} p={palette} seed={61} color="#2f3346" />
          <StreetLamp x={180} ground={G} h={210} p={palette} d={0} />
          <StreetLamp x={620} ground={G} h={210} p={palette} d={0} />
          <StreetLamp x={1010} ground={G} h={210} p={palette} d={0} />

          {/* the house he lives in, seen from outside at night */}
          <rect x={860} y={300} width={INTERIOR - 860 + 10} height={G - 300} fill={shadowed(palette, "#2e3040", 0.2)} />
          <rect x={846} y={286} width={INTERIOR - 846 + 24} height={20} fill={shadowed(palette, "#22242f", 0.2)} />

          {/* ---- the interior --------------------------------------------- */}
          <g>
            {/* back wall + floor — occludes the night behind it */}
            <rect x={INTERIOR} y={wallTop} width={W - INTERIOR + 200} height={G - wallTop} fill={lit(palette, "#3a3446", 0.06)} />
            <rect x={INTERIOR} y={wallTop} width={W - INTERIOR + 200} height={14} fill={shadowed(palette, "#262232", 0.2)} />
            <rect x={INTERIOR} y={G} width={W - INTERIOR + 200} height={200} fill={shadowed(palette, "#4a3a30", 0.18)} />
            <rect x={INTERIOR} y={G} width={W - INTERIOR + 200} height={7} fill={lit(palette, "#5c4838", 0.16)} />
            {/* a rug with a geometric pattern */}
            <g opacity="0.9">
              <rect x={DESK - 210} y={G + 22} width={520} height={62} rx={4} fill={shadowed(palette, "#7a4438", 0.24)} />
              {Array.from({ length: 12 }, (_, i) => (
                <path
                  key={i}
                  d={`M ${DESK - 200 + i * 42} ${G + 30} l 16 22 l -16 22 l -16 -22 Z`}
                  fill={lit(palette, "#c08a5a", 0.1)}
                  opacity="0.5"
                />
              ))}
            </g>

            {/* the hallway door, left ajar. She is still up. */}
            <rect x={HALL_DOOR - 92} y={G - 250} width={96} height={250} fill="#191622" />
            <GlowWindow x={HALL_DOOR - 60} y={G - 238} w={40} h={238} color="#ffbf6e" intensity={0.36} />
            <rect x={HALL_DOOR - 16} y={G - 258} width={20} height={258} fill={shadowed(palette, "#2a2534", 0.3)} />

            {/* the desk */}
            <g>
              <rect x={DESK - 130} y={G - 128} width={330} height={16} rx={3} fill={lit(palette, "#6b533a", 0.1)} />
              <rect x={DESK - 118} y={G - 112} width={13} height={112} fill={shadowed(palette, "#4a3a2a", 0.2)} />
              <rect x={DESK + 175} y={G - 112} width={13} height={112} fill={shadowed(palette, "#4a3a2a", 0.2)} />

              {/* the monitor — the rectangle of light, now something he makes things in */}
              <rect x={DESK - 12} y={G - 268} width={22} height={44} fill={shadowed(palette, "#22202c", 0.2)} />
              <rect x={DESK - 46} y={G - 130} width={92} height={10} rx={3} fill={shadowed(palette, "#22202c", 0.2)} />
              <rect x={DESK - 96} y={G - 356} width={190} height={96} rx={5} fill="#15141d" />
              <GlowWindow x={DESK - 88} y={G - 348} w={174} h={80} color="#5fd4e8" intensity={0.5}>
                {/* code on the left, the shape it makes on the right */}
                {Array.from({ length: 7 }, (_, i) => (
                  <rect
                    key={i}
                    x={DESK - 80}
                    y={G - 340 + i * 9}
                    width={22 + rng(i + 11)() * 46}
                    height={3.4}
                    fill="#0d2b33"
                    opacity="0.75"
                  />
                ))}
                <path
                  d={`M ${DESK + 30} ${G - 296} l 22 -14 l 22 14 l 0 26 l -22 14 l -22 -14 Z`}
                  fill="#0d2b33"
                  opacity="0.5"
                />
              </GlowWindow>

              {/* keyboard, mouse, a mug that has been there a while */}
              <rect x={DESK - 74} y={G - 138} width={128} height={12} rx={3} fill={shadowed(palette, "#3a3648", 0.2)} />
              <ellipse cx={DESK + 84} cy={G - 132} rx={12} ry={8} fill={shadowed(palette, "#3a3648", 0.2)} />
              <rect x={DESK + 122} y={G - 152} width={26} height={26} rx={3} fill={lit(palette, "#8a7a68", 0.1)} />

              {/* graph paper with a level sketched on it */}
              <g transform={`rotate(-6 ${DESK - 150} ${G - 120})`}>
                <rect x={DESK - 186} y={G - 132} width={74} height={54} fill="#e8e2d0" opacity="0.86" />
                {Array.from({ length: 5 }, (_, i) => (
                  <rect key={i} x={DESK - 182} y={G - 126 + i * 10} width={66} height={0.7} fill="#8a9aa8" opacity="0.5" />
                ))}
                <path d={`M ${DESK - 180} ${G - 92} l 18 0 l 0 -12 l 20 0 l 0 -14 l 24 0`} stroke="#3a5a7a" strokeWidth="2" fill="none" />
                <rect x={DESK - 176} y={G - 100} width={6} height={6} fill="#c05a4a" />
              </g>
            </g>

            {/* the chair */}
            <g>
              <rect x={DESK + 12} y={G - 96} width={12} height={96} fill={shadowed(palette, "#2e2a38", 0.2)} />
              <rect x={DESK - 26} y={G - 104} width={92} height={13} rx={4} fill={shadowed(palette, "#3a3446", 0.15)} />
              <rect x={DESK + 46} y={G - 190} width={14} height={92} rx={5} fill={shadowed(palette, "#3a3446", 0.15)} />
            </g>

            {/* bookshelf: more notebooks of ideas than finished things */}
            <g>
              <rect x={1900} y={G - 300} width={220} height={300} fill={shadowed(palette, "#4a3a2c", 0.2)} />
              {[0, 1, 2].map((shelf) => (
                <g key={shelf}>
                  <rect x={1900} y={G - 300 + shelf * 96 + 86} width={220} height={9} fill={shadowed(palette, "#2e2418", 0.2)} />
                  {Array.from({ length: 9 }, (_, i) => {
                    const rr = rng(shelf * 31 + i * 7);
                    const h = 46 + rr() * 36;
                    const colors = ["#7a4438", "#3a5a6a", "#8a7a4a", "#5a4a6a", "#6a3a4a"];
                    return (
                      <rect
                        key={i}
                        x={1908 + i * 23}
                        y={G - 300 + shelf * 96 + 86 - h}
                        width={12 + rr() * 8}
                        height={h}
                        fill={lit(palette, colors[Math.floor(rr() * colors.length)], 0.08)}
                      />
                    );
                  })}
                </g>
              ))}
            </g>

            {/* the bed, made carelessly */}
            <g>
              <rect x={2210} y={G - 96} width={280} height={96} rx={4} fill={shadowed(palette, "#3e3850", 0.15)} />
              <rect x={2210} y={G - 116} width={280} height={26} rx={8} fill={lit(palette, "#54607a", 0.08)} />
              <rect x={2216} y={G - 138} width={82} height={30} rx={9} fill={lit(palette, "#8a92a8", 0.1)} />
            </g>

            {/* window onto the blue evening he is no longer looking at */}
            <rect x={1660} y={G - 400} width={150} height={132} fill={shadowed(palette, "#1a1826", 0.3)} />
            <GlowWindow x={1668} y={G - 392} w={134} h={116} color="#2a4a72" intensity={0.55} />
            <rect x={1732} y={G - 392} width={5} height={116} fill={shadowed(palette, "#1a1826", 0.2)} />

            {/* things pinned above the desk */}
            <g opacity="0.85">
              <rect x={DESK - 96} y={G - 428} width={54} height={40} fill="#d8cfc0" transform={`rotate(-3 ${DESK - 70} ${G - 408})`} />
              <rect x={DESK - 26} y={G - 434} width={44} height={34} fill="#c8bda8" transform={`rotate(4 ${DESK - 4} ${G - 416})`} />
              <rect x={DESK + 32} y={G - 428} width={58} height={38} fill="#cfc4b0" transform={`rotate(-2 ${DESK + 60} ${G - 408})`} />
            </g>

            {r() > 2 ? null : null}
          </g>

          <WorldLabel x={420} y={G - 210} text="2014" p={palette} size={16} opacity={0.24} />
        </g>
      );
    },
  },

  props: [
    { id: "monitor", x: SPAN[0] + DESK, y: G - 300, radius: 170, dive: "the-screen", label: "the screen" },
  ],

  beats: [
    {
      id: "room-street",
      at: 2700,
      run: (c) => {
        c.character.express("calm", 0.4);
      },
    },
    {
      id: "room-discovery",
      at: SPAN[0] + DESK - 40,
      run: async (c) => {
        c.character.stop();
        c.character.express("focus", 0.85);
        c.camera.apply({ zoom: 1.34, lead: 0.44, duration: 1.6 });

        // She is in the hallway behind him. Never remarked on.
        placeMother(SPAN[0] + HALL_DOOR - 130, { look: 1, sway: 0 });

        await c.wait(2200);
        // the moment the thing he wrote does something
        c.character.express("wonder", 1);
        await c.wait(1400);
        c.caption({
          line: "The first thing I wanted to make was a game.",
          hold: 5200,
        });
        await c.waitForInput(5400);

        dismissMother();
        c.camera.release();
        c.character.express("joy", 0.55);
        c.character.resume();
      },
    },
  ],
};
