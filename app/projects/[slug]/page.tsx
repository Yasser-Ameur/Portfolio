import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PipelineStrip } from "@/components/projects/pipeline-strip";
import { Starfield } from "@/components/world/starfield";
import { PROJECTS, getProject } from "@/content/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

const PIPELINES: Record<string, string[]> = {
  minigoogle: ["Client", "Query Router", "Shards", "Retrieval", "Ranking"],
  notifly: ["Event", "Notification", "Outbox", "Provider", "Delivery"],
  nexus: ["Agent", "Tools", "Knowledge", "Workflow", "Result"],
  pulse: ["Producer", "Partitions", "Consumers"],
  flowos: ["Workflow", "Compile", "Plan", "Execute", "Resume"],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

function Section({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/8 py-10">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-ember">
        {index} · {label}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const currentIndex = PROJECTS.findIndex((p) => p.slug === slug);
  const prev = PROJECTS[(currentIndex - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(currentIndex + 1) % PROJECTS.length];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-night-950">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, #0a1222 0%, #05080f 55%, #02040a 100%)",
        }}
      />
      <Starfield className="opacity-50" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-28 pt-24 sm:pt-32">
        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-starlight-dim transition-colors duration-200 hover:text-ember-bright"
        >
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 ease-out-soft group-hover:-translate-x-1"
          >
            ←
          </span>
          Projects
        </Link>

        <p
          className="mt-12 font-mono text-xs uppercase tracking-[0.42em]"
          style={{ color: project.accent }}
        >
          {project.tagline}
        </p>
        <h1 className="mt-4 font-display text-5xl font-light text-starlight sm:text-7xl">
          {project.name}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-starlight-dim sm:text-lg">
          {project.description}
        </p>

        <div className="mt-10">
          <PipelineStrip
            labels={PIPELINES[project.worldType]}
            accent={project.accent}
          />
        </div>

        <Section index="01" label="Why I built it">
          <ul className="space-y-3">
            {project.detail.why.map((p) => (
              <li key={p} className="text-sm leading-7 text-starlight">
                {p}
              </li>
            ))}
          </ul>
        </Section>

        <Section index="02" label="Architecture">
          <h3 className="font-display text-xl font-light text-starlight">
            {project.detail.architecture.heading}
          </h3>
          <ul className="mt-4 space-y-3">
            {project.detail.architecture.points.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-6 text-starlight-dim">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: project.accent }}
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section index="03" label="Key engineering decisions">
          <ul className="space-y-3">
            {project.detail.decisions.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-6 text-starlight-dim">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: project.accent }}
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section index="04" label="Technology">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {project.detail.technology.map((t) => (
              <li
                key={t}
                className="rounded-sm border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-starlight-dim"
              >
                {t}
              </li>
            ))}
          </ul>
        </Section>

        <Section index="05" label="Results &amp; scale">
          <ul className="space-y-3">
            {project.detail.results.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-6 text-starlight-dim">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: project.accent }}
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section index="06" label="What I learned">
          <ul className="space-y-3">
            {project.detail.learned.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-6 text-starlight-dim">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: project.accent }}
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Section>

        <div className="mt-14 flex flex-wrap items-center gap-6 border-t border-white/8 pt-8">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-ember/40 px-6 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-ember-bright transition-colors duration-300 hover:border-ember hover:bg-ember/10"
          >
            View on GitHub
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              ↗
            </span>
          </a>
          <Link
            href="/projects"
            className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-starlight-dim transition-colors duration-200 hover:text-ember-bright"
          >
            Back to the system map
          </Link>
        </div>

        <nav
          aria-label="Other projects"
          className="mt-16 grid gap-4 border-t border-white/8 pt-8 sm:grid-cols-2"
        >
          <Link
            href={`/projects/${prev.slug}`}
            className="group rounded-sm px-3 py-2 transition-colors duration-200 hover:bg-white/[0.03]"
          >
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-starlight-faint">
              ← Previous
            </p>
            <p className="mt-1 font-display text-xl font-light text-starlight transition-colors group-hover:text-ember-bright">
              {prev.name}
            </p>
          </Link>
          <Link
            href={`/projects/${next.slug}`}
            className="group rounded-sm px-3 py-2 text-right transition-colors duration-200 hover:bg-white/[0.03]"
          >
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-starlight-faint">
              Next →
            </p>
            <p className="mt-1 font-display text-xl font-light text-starlight transition-colors group-hover:text-ember-bright">
              {next.name}
            </p>
          </Link>
        </nav>
      </div>
    </div>
  );
}
