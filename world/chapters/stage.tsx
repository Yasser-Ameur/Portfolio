/**
 * 04 · The Stage — graduation
 *
 * The chapter opens up: higher ceiling, warmer key, more depth than anything
 * before it. He walks up the aisle and receives the thing, and he is proud of it.
 *
 * And then the camera leaves him. At the peak of his own scene it pushes past
 * the stage into the audience and finds his mother — the only other figure
 * drawn in full detail in the entire hall. She is standing at the end of a row.
 * She is not clapping. She is just looking at him. Four seconds, no music, no
 * text.
 *
 * The camera choosing her over him is the statement. Everything else in this
 * file exists to make that shot possible.
 */

import type { Chapter } from "@/engine/types";
import { PALETTES, atmo, lit, shadowed } from "../palette";
import { placeMother } from "../mother-bus";
import { Crowd, SeatedRows, GroundStrip, WorldLabel, rng } from "../props";

const P = PALETTES.stage;
const G = 700;
const SPAN: [number, number] = [7200, 9000];
const W = SPAN[1] - SPAN[0];

const MOTHER_LOCAL = 660;
export const MOTHER_X = SPAN[0] + MOTHER_LOCAL;
const PODIUM = 1300;
const STAGE_FRONT = PODIUM - 210;
const STAGE_TOP = G - 66;

export const stage: Chapter = {
  id: "stage",
  span: SPAN,
  palette: P,
  surface: "corridor",

  layers: {
    // ---- far: the hall itself — ceiling, side wall, high windows ----------
    far: ({ palette }) => {
      const d = 0.88;
      const wall = atmo(palette, "#5c4034", d);
      return (
        <g>
          {/* back wall closes the room off — this is an interior, not a night sky */}
          <rect x={-100} y={0} width={W + 200} height={G} fill={atmo(palette, "#4a3128", d)} />

          {/* coffered ceiling, receding */}
          <rect x={-100} y={0} width={W + 200} height={150} fill={atmo(palette, "#3a2620", d)} />
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={-80 + i * 180} y={0} width={26} height={150} fill={atmo(palette, "#2e1d1a", d)} />
          ))}
          <rect x={-100} y={148} width={W + 200} height={14} fill={atmo(palette, lit(palette, "#7a5238", 0.14), d)} />

          {/* tall windows down the far wall, evening light coming through */}
          {Array.from({ length: 5 }, (_, i) => {
            const x = 90 + i * 330;
            return (
              <g key={i}>
                <rect x={x - 8} y={190} width={116} height={300} fill={atmo(palette, "#3a2620", d)} />
                <rect x={x} y={198} width={100} height={284} fill={atmo(palette, "#c9915a", d * 0.7)} opacity="0.5" />
                <rect x={x + 46} y={198} width={7} height={284} fill={atmo(palette, "#3a2620", d)} />
                <rect x={x} y={330} width={100} height={7} fill={atmo(palette, "#3a2620", d)} />
              </g>
            );
          })}

          {/* pilasters */}
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={`p${i}`} x={-40 + i * 330} y={160} width={44} height={G - 160} fill={wall} />
          ))}
          <rect x={-100} y={G - 90} width={W + 200} height={90} fill={atmo(palette, "#3f2a22", d)} />
        </g>
      );
    },

    // ---- mid: the light fixtures that give the hall its warmth -----------
    mid: ({ palette }) => (
      <g>
        {Array.from({ length: 6 }, (_, i) => {
          const x = 60 + i * 320;
          return (
            <g key={i}>
              <rect x={x + 56} y={0} width={4} height={78} fill={shadowed(palette, "#2e1d1a", 0.2)} />
              <path
                d={`M ${x + 10} ${118} L ${x + 106} ${118} L ${x + 88} ${78} L ${x + 28} ${78} Z`}
                fill={lit(palette, "#8a6238", 0.2)}
              />
              <rect x={x + 8} y={116} width={100} height={9} rx={4} fill="#ffd9a0" opacity="0.92" />
              <ellipse cx={x + 58} cy={150} rx={170} ry={110} fill="#ffcf8a" opacity="0.07" />
              {/* the pool it throws on the floor */}
              <ellipse cx={x + 58} cy={G + 26} rx={150} ry={30} fill="#ffcf8a" opacity="0.06" />
            </g>
          );
        })}
      </g>
    ),

    // ---- ground: the aisle, the audience, the stage -----------------------
    ground: ({ palette }) => {
      const r = rng(149);
      return (
        <g>
          <GroundStrip x={0} width={W} ground={G} p={palette} seed={151} color="#523a2c" />
          {/* a runner down the aisle he walks */}
          <rect x={0} y={G + 6} width={W} height={74} fill={shadowed(palette, "#7a3830", 0.24)} opacity="0.6" />
          <rect x={0} y={G + 6} width={W} height={4} fill={lit(palette, "#a85a42", 0.14)} opacity="0.7" />
          <rect x={0} y={G + 76} width={W} height={4} fill={lit(palette, "#a85a42", 0.14)} opacity="0.5" />

          {/* the audience: rows behind the aisle, thinning toward the stage */}
          <SeatedRows x={-40} ground={G - 74} width={1120} rows={4} p={palette} d={0.3} seed={157} scale={0.92} />

          {/* ---- the stage ---------------------------------------------- */}
          <g>
            {/* proscenium — the frame that makes it a stage and not a box */}
            <rect x={STAGE_FRONT - 70} y={70} width={40} height={G - 70} fill={lit(palette, "#5c3f2c", 0.1)} />
            <rect x={STAGE_FRONT - 70} y={70} width={40} height={12} fill={lit(palette, "#8a6440", 0.16)} />
            <rect x={STAGE_FRONT - 36} y={70} width={W - STAGE_FRONT + 76} height={40} fill={lit(palette, "#5c3f2c", 0.08)} />
            <rect x={STAGE_FRONT - 36} y={106} width={W - STAGE_FRONT + 76} height={9} fill={shadowed(palette, "#3a2418", 0.2)} />

            {/* platform */}
            <rect x={STAGE_FRONT} y={STAGE_TOP} width={W - STAGE_FRONT} height={G - STAGE_TOP} fill={shadowed(palette, "#4a3020", 0.16)} />
            <rect x={STAGE_FRONT} y={STAGE_TOP} width={W - STAGE_FRONT} height={10} fill={lit(palette, "#8a6440", 0.2)} />
            {/* steps up */}
            <rect x={STAGE_FRONT - 84} y={G - 24} width={86} height={24} fill={shadowed(palette, "#4a3020", 0.12)} />
            <rect x={STAGE_FRONT - 58} y={G - 45} width={60} height={22} fill={shadowed(palette, "#4a3020", 0.18)} />
            <rect x={STAGE_FRONT - 84} y={G - 26} width={86} height={4} fill={lit(palette, "#8a6440", 0.16)} />

            {/* curtain backdrop, pleated */}
            <rect x={STAGE_FRONT + 40} y={130} width={W - STAGE_FRONT - 60} height={STAGE_TOP - 130} fill={shadowed(palette, "#5e2c2a", 0.2)} />
            {Array.from({ length: 16 }, (_, i) => (
              <rect
                key={i}
                x={STAGE_FRONT + 44 + i * 42}
                y={130}
                width={17}
                height={STAGE_TOP - 130}
                fill={shadowed(palette, "#43201f", 0.16)}
                opacity="0.55"
              />
            ))}
            <path
              d={`M ${STAGE_FRONT + 40} 130 L ${W - 20} 130 L ${W - 20} 168 Q ${(STAGE_FRONT + W) / 2} 210 ${STAGE_FRONT + 40} 168 Z`}
              fill={shadowed(palette, "#43201f", 0.1)}
            />

            {/* banner */}
            <rect x={PODIUM - 130} y={250} width={470} height={78} rx={4} fill={lit(palette, "#3a2622", 0.04)} />
            <rect x={PODIUM - 130} y={250} width={470} height={4} fill={palette.accent} opacity="0.8" />
            <rect x={PODIUM - 130} y={324} width={470} height={4} fill={palette.accent} opacity="0.8" />
            <WorldLabel x={PODIUM + 105} y={299} text="BACCALAURÉAT" p={palette} size={27} opacity={0.66} anchor="middle" />

            {/* lectern, standing on the platform */}
            <path
              d={`M ${PODIUM + 250} ${STAGE_TOP} l 76 0 l -9 -104 l -58 0 Z`}
              fill={lit(palette, "#6b4a30", 0.06)}
            />
            <rect x={PODIUM + 256} y={STAGE_TOP - 116} width={74} height={13} rx={3} fill={lit(palette, "#8a6440", 0.12)} />
            <ellipse cx={PODIUM + 288} cy={STAGE_TOP + 3} rx={54} ry={7} fill="#000" opacity="0.2" />

            {/* two flags, unlabelled */}
            {[0, 1].map((i) => (
              <g key={i}>
                <rect x={STAGE_FRONT + 70 + i * 470} y={STAGE_TOP - 250} width={6} height={250} fill={shadowed(palette, "#3a2a20", 0.2)} />
                <path
                  d={`M ${STAGE_FRONT + 76 + i * 470} ${STAGE_TOP - 250} q 40 14 78 6 l 0 76 q -38 8 -78 -6 Z`}
                  fill={lit(palette, i === 0 ? "#8a3a30" : "#3a5a48", 0.08)}
                />
              </g>
            ))}

            {/* flower arrangements at the stage edge, not scattered dots */}
            {[STAGE_FRONT + 30, W - 90].map((fx, k) => (
              <g key={k}>
                <path d={`M ${fx - 24} ${STAGE_TOP} l 6 -30 l 38 0 l 6 30 Z`} fill={shadowed(palette, "#5a3a28", 0.16)} />
                {Array.from({ length: 11 }, (_, i) => (
                  <circle
                    key={i}
                    cx={fx - 14 + r() * 40}
                    cy={STAGE_TOP - 32 - r() * 34}
                    r={5 + r() * 6}
                    fill={lit(palette, ["#c9556a", "#e0a63c", "#d8d2c4", "#4a6a44"][Math.floor(r() * 4)], 0.08)}
                    opacity="0.9"
                  />
                ))}
              </g>
            ))}

            {/* classmates waiting at the side of the stage */}
            <Crowd x={STAGE_FRONT + 130} ground={STAGE_TOP} width={230} count={4} p={palette} d={0.1} seed={163} height={150} opacity={0.55} />
          </g>

          {/* the photograph on a table by the entrance — a way back into this moment */}
          <g>
            <rect x={250} y={G - 58} width={124} height={10} rx={3} fill={shadowed(palette, "#5a4030", 0.18)} />
            <rect x={262} y={G - 48} width={9} height={48} fill={shadowed(palette, "#4a3428", 0.2)} />
            <rect x={352} y={G - 48} width={9} height={48} fill={shadowed(palette, "#4a3428", 0.2)} />
            <g transform="rotate(-5 302 640)">
              <rect x={276} y={G - 110} width={66} height={54} fill="#efe4cf" />
              <rect x={281} y={G - 105} width={56} height={38} fill={lit(palette, "#8a6a58", 0.1)} />
            </g>
            <ellipse cx={312} cy={G + 2} rx={70} ry={8} fill="#000" opacity="0.18" />
          </g>

          <WorldLabel x={70} y={G - 120} text="2022" p={palette} size={18} opacity={0.32} />
        </g>
      );
    },

    // ---- fore: the backs of the nearest heads ----------------------------
    fore: ({ palette }) => (
      <g opacity="0.72">
        <rect x={-100} y={G + 210} width={W + 200} height={26} rx={8} fill={shadowed(palette, "#2a1a18", 0.4)} />
        {Array.from({ length: 6 }, (_, i) => {
          const x = -30 + i * 380;
          return (
            <g key={i}>
              <ellipse cx={x} cy={G + 150} rx={52} ry={58} fill={shadowed(palette, "#1a1216", 0.42)} />
              <path d={`M ${x - 82} ${G + 262} q 82 -86 164 0 Z`} fill={shadowed(palette, "#1a1216", 0.42)} />
            </g>
          );
        })}
      </g>
    ),
  },

  props: [
    { id: "photograph", x: SPAN[0] + 308, y: G - 86, radius: 130, dive: "photograph", label: "a photograph" },
  ],

  beats: [
    {
      id: "stage-enter",
      at: 7300,
      run: (c) => {
        // She is already there, standing at the end of a row.
        placeMother(MOTHER_X, { look: 1, sway: 0 });
        c.character.express("calm", 0.6);
      },
    },
    {
      id: "stage-receive",
      at: SPAN[0] + STAGE_FRONT - 60,
      run: async (c) => {
        c.character.stop();
        c.character.express("pride", 0.7);
        c.camera.apply({ zoom: 1.18, lead: 0.4, duration: 1.4 });
        await c.wait(1700);

        // --- the shot -----------------------------------------------------
        // Leave him. Find her. She is not clapping.
        c.camera.apply({ hold: "mother", zoom: 1.5, duration: 2.2 });
        await c.wait(4200);

        c.camera.apply({ hold: null, zoom: 1.1, duration: 1.8 });
        await c.wait(1500);

        c.camera.release();
        c.character.express("joy", 0.5);
        c.character.resume();
      },
    },
  ],
};
