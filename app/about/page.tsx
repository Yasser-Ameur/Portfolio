import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage, EditorialSection } from "@/components/ui/editorial-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "Yasser Ameur — Computer Science student at EPFL interested in distributed systems, backend engineering, machine learning, and agentic AI.",
};

const INTERESTS: { name: string; blurb: string }[] = [
  {
    name: "Distributed systems",
    blurb: "Consensus, membership, replication — systems that keep working when their parts don't.",
  },
  {
    name: "Backend engineering",
    blurb: "Durable services, clean boundaries, and infrastructure that is boring on purpose.",
  },
  {
    name: "Machine learning",
    blurb: "Retrieval, ranking, and the systems that make models useful in production.",
  },
  {
    name: "Information retrieval",
    blurb: "Inverted indexes, hybrid lexical–semantic search, and relevance that survives scale.",
  },
  {
    name: "Agentic AI",
    blurb: "Agents as engineered systems — planning, tool use, and durable state.",
  },
  {
    name: "Systems architecture",
    blurb: "Choosing the boundary that keeps a system coherent as it grows.",
  },
];

const PRINCIPLES: string[] = [
  "Evidence over claims — anything built is also measured.",
  "Own the pipeline — understanding every layer beats composing black boxes.",
  "Durable and boring beats clever and fragile.",
  "Honest about what is implemented and what is still being designed.",
];

export default function AboutPage() {
  return (
    <EditorialPage
      kicker="About"
      title="Understanding systems from the inside."
      intro={
        <>
          <p>
            I’m a Computer Science student at EPFL. I like understanding systems
            from the inside — how they’re wired, where they break, and why they
            behave the way they do.
          </p>
          <p>
            I enjoy building software where the architecture matters as much as
            the interface. Search engines, message brokers, notification
            platforms, agent runtimes — the kind of systems you rarely see, but
            that everything else runs on.
          </p>
        </>
      }
    >
      <EditorialSection index="01" label="Where my interest lies">
        <ul className="space-y-4">
          {INTERESTS.map((item) => (
            <li key={item.name} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-ember"
              />
              <div>
                <h2 className="font-display text-lg font-light text-starlight">
                  {item.name}
                </h2>
                <p className="mt-0.5 text-sm leading-6 text-starlight-dim">
                  {item.blurb}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </EditorialSection>

      <EditorialSection index="02" label="Engineering philosophy">
        <ul className="space-y-3">
          {PRINCIPLES.map((p) => (
            <li key={p} className="flex gap-3 text-sm leading-6 text-starlight">
              <span aria-hidden="true" className="text-ember">
                —
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </EditorialSection>

      <p className="mt-14 text-sm leading-7 text-starlight-dim">
        The story is the how.{" "}
        <Link href="/story" className="text-starlight underline decoration-ember/40 underline-offset-4 transition-colors hover:text-ember-bright">
          The story
        </Link>{" "}
        is how I got here, and{" "}
        <Link href="/projects" className="text-starlight underline decoration-ember/40 underline-offset-4 transition-colors hover:text-ember-bright">
          the projects
        </Link>{" "}
        are what I build.
      </p>
    </EditorialPage>
  );
}
