import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The journey — Yasser Ameur",
  description:
    "The same story the interactive world tells, as text: Morocco, first code, graduation, leaving home, and EPFL.",
  alternates: { canonical: "/journey" },
};

/**
 * The transcript.
 *
 * A real page, not a hidden div — this is what a screen reader, a search engine
 * and anyone in a hurry gets. It carries every beat the world carries, in the
 * same order, and it is the accessibility contract for the whole experience.
 */
export default function JourneyPage() {
  return (
    <main className="transcript">
      <div className="transcript__inner">
        <h1>The journey</h1>
        <p style={{ opacity: 0.7 }}>
          This is the same story the interactive world tells, written out.{" "}
          <Link href="/">Walk through it instead →</Link>
        </p>

        <h2>Morocco · 2010</h2>
        <p>
          A yard off a residential street, late afternoon — the hour before you
          get called inside. A football that has been kicked against the same
          wall a thousand times. A basketball hoop on a slightly bent pole. A
          bicycle against the wall, sandals kicked off by the step.
        </p>
        <p>
          Through the window of the house, a television is on. It is the only
          cool-coloured thing in the whole scene, and he stops to look at it.
          Inside, his mother is in the next room, doing something ordinary. She
          is not introduced. She is simply where the warmth in the picture comes
          from.
        </p>

        <h2>The machine · 2014</h2>
        <p>
          Dusk. The streetlamps come on one at a time as he passes them. Then a
          doorway, and his room at night: a desk, a computer that is clearly not
          new, graph paper with a level sketched on it, more notebooks of ideas
          than finished things.
        </p>
        <p>
          He writes something, and the thing he wrote moves. That is the moment
          the machine stops being something he uses. The first thing he wanted to
          make was a game — websites, then a small Unity game, then Roblox games,
          then more. Every new thing he learned unlocked another layer of what he
          could build.
        </p>
        <p>
          Behind him, the hallway light stays on the whole time he is working. It
          is the last thing to go out.
        </p>

        <h2>School · 2016–2022</h2>
        <p>
          Six years, compressed into one corridor: the same window repeating,
          with the light across it changing every bay. He gets taller. Glasses
          arrive somewhere around the seventh or eighth grade. Neither is
          announced. Work accumulates quietly.
        </p>

        <h2>Graduation · 2022</h2>
        <p>
          The hall opens up — higher ceiling, warmer light, more depth than
          anything before it. He walks up and receives his baccalaureate. He
          graduated as valedictorian — top of the entire school — and among the
          strongest students
          academically in the country.
        </p>
        <p>
          And then the camera leaves him. At the peak of his own scene it pushes
          past the stage into the audience and finds his mother — the only other
          person drawn in full detail in the entire hall. She is not clapping.
          She is just looking at him.
        </p>

        <h2>Leaving Morocco · 2022</h2>
        <p>
          A road out of the neighbourhood, evening, one suitcase. They walk
          together for a long time with nothing happening. Then the path narrows,
          and she stops. He keeps walking.
        </p>
        <p>
          The camera does not cut and does not fade — it keeps following him,
          which means she slides out of the frame on her own, the way people
          actually disappear when you leave. There is no goodbye animation. He
          does not turn around.
        </p>

        <h2>The crossing</h2>
        <p>
          Altitude. No ground for ninety seconds, just cloud layers moving at
          different speeds and a very wide sky.
        </p>

        <h2>Lausanne · EPFL · 2022</h2>
        <p>
          The palette inverts. Where the Moroccan horizon sat a few hundred metres
          away, here it retreats for kilometres — mountains, a lake, concrete and
          glass, conifers, cold morning light. Students moving at speeds that have
          nothing to do with him.
        </p>
        <p>
          Everything is bigger now. He immersed himself in the work, met a lot of
          people, and learned how different university is from school.
        </p>
        <p>
          At the far end of the campus, one window is lit in a warm ochre that
          does not otherwise exist in this half of the world. It is never
          explained.
        </p>

        <h2>What comes after</h2>
        <p>
          The chapters beyond this point are being built: a second semester lost
          to too much League of Legends and the deliberate work of getting out of
          it; learning to notice patterns across code, mathematics, systems and
          people; a second year spent on low-level systems and functional
          programming, going from wanting to build things to wanting to understand
          how they work; the projects; hiking across Switzerland, alone and with
          friends; and the present, which is not an ending.
        </p>
        <p style={{ opacity: 0.7 }}>
          <Link href="/">← Back to the world</Link>
        </p>
      </div>
    </main>
  );
}
