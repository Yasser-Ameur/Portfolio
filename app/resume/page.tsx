import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage, EditorialSection } from "@/components/ui/editorial-page";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Yasser Ameur — Computer Science student at EPFL. Distributed systems, search, agentic AI, and event streaming.",
};

const SKILLS: { group: string; items: string }[] = [
  { group: "Languages", items: "Java, Python, Go, TypeScript, JavaScript, C, Scala, SQL" },
  { group: "Systems & infrastructure", items: "Raft, gossip, gRPC, HTTP/RPC, event streaming, durable logs, Docker, Kubernetes" },
  { group: "Search & ML", items: "BM25, PageRank, HNSW, hybrid retrieval, GraphRAG, knowledge graphs" },
  { group: "Web & data", items: "Next.js, React, FastAPI, Spring Boot, PostgreSQL, Redis, SQLite" },
  { group: "Practices", items: "Clean architecture, plugin SDKs, transactional outbox, testing, CI" },
];

const FEATURED = [
  { slug: "minigoogle", name: "MiniGoogle", line: "A distributed search engine built from the ground up — crawling, indexing, Raft consensus, and hybrid retrieval." },
  { slug: "nexus", name: "NEXUS", line: "A knowledge intelligence engine paired with a fault-tolerant research runtime." },
  { slug: "flowos", name: "FlowOS", line: "A workflow automation platform with a plugin SDK and cleanly separated layers." },
  { slug: "pulse", name: "Pulse", line: "A durable event-streaming platform written in Go, from the log format up." },
  { slug: "notifly", name: "NotiFly", line: "A notification platform built around guaranteed delivery and provider extensibility." },
];

export default function ResumePage() {
  return (
    <EditorialPage
      kicker="Resume"
      title="The story, condensed."
      intro={
        <p>
          Computer Science student at EPFL who builds distributed systems,
          search infrastructure, and agentic AI — verified work lives in{" "}
          <a
            href="https://github.com/Yasser-Ameur"
            target="_blank"
            rel="noopener noreferrer"
            className="text-starlight underline decoration-ember/40 underline-offset-4 transition-colors hover:text-ember-bright"
          >
            the repositories
          </a>
          , not in claims.
        </p>
      }
    >
      <EditorialSection index="01" label="Education">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-light text-starlight">
            École Polytechnique Fédérale de Lausanne
          </h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-starlight-dim">
          Bachelor’s in Computer Science — coursework across systems programming,
          functional programming, machine learning, and digital design.
        </p>
      </EditorialSection>

      <EditorialSection index="02" label="Achievement">
        <p className="text-sm leading-6 text-starlight">
          Valedictorian of the high-school promotion — the milestone that
          preceded the move to Switzerland.
        </p>
      </EditorialSection>

      <EditorialSection index="03" label="Selected projects">
        <ul className="space-y-5">
          {FEATURED.map((p) => (
            <li key={p.slug}>
              <a
                href={`/projects/${p.slug}`}
                className="group block"
              >
                <h2 className="font-display text-lg font-light text-starlight transition-colors group-hover:text-ember-bright">
                  {p.name}
                </h2>
                <p className="mt-0.5 text-sm leading-6 text-starlight-dim">
                  {p.line}
                </p>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-6 text-starlight-dim">
          Supporting work: an API governance platform, a 14-language client app,
          and a research prototype for agent memory. Explore all of them in the{" "}
          <Link
            href="/projects"
            className="text-starlight underline decoration-ember/40 underline-offset-4 transition-colors hover:text-ember-bright"
          >
            project world
          </Link>
          .
        </p>
      </EditorialSection>

      <EditorialSection index="04" label="Engineering">
        <ul className="space-y-4">
          {SKILLS.map((s) => (
            <li key={s.group}>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember">
                {s.group}
              </p>
              <p className="mt-1 text-sm leading-6 text-starlight-dim">
                {s.items}
              </p>
            </li>
          ))}
        </ul>
      </EditorialSection>

      <EditorialSection index="05" label="Contact">
        <ul className="space-y-3 text-sm">
          <li>
            <a
              href="mailto:yasserameur.dev@gmail.com"
              className="text-starlight underline decoration-ember/40 underline-offset-4 transition-colors hover:text-ember-bright"
            >
              yasserameur.dev@gmail.com
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Yasser-Ameur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-starlight underline decoration-ember/40 underline-offset-4 transition-colors hover:text-ember-bright"
            >
              github.com/Yasser-Ameur
            </a>
          </li>
          <li>
            <a
              href="https://linkedin.com/in/yasser-ameur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-starlight underline decoration-ember/40 underline-offset-4 transition-colors hover:text-ember-bright"
            >
              linkedin.com/in/yasser-ameur
            </a>
          </li>
        </ul>
      </EditorialSection>
    </EditorialPage>
  );
}
