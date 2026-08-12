import type { ReactNode } from "react";
import { Starfield } from "@/components/world/starfield";

/**
 * Shared atmospheric shell for the editorial pages (about, resume, contact).
 * Quieter than the worlds: a deep sky, a slow starfield, and one restrained
 * column of type. The HUD home control stays on top from the root layout.
 */
export function EditorialPage({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-night-950">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #02030a 0%, #050911 45%, #0a1224 75%, #080e1c 100%)",
        }}
      />
      <Starfield className="opacity-45" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 pb-28 pt-28 sm:pt-36">
        <p className="font-mono text-xs uppercase tracking-[0.5em] text-ember">
          {kicker}
        </p>
        <h1 className="mt-6 font-display text-4xl font-light leading-tight text-starlight sm:text-6xl">
          {title}
        </h1>
        {intro && (
          <div className="mt-8 max-w-xl space-y-5 text-base leading-7 text-starlight-dim sm:text-lg sm:leading-8">
            {intro}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function EditorialSection({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-14 border-t border-white/8 pt-8">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-ember">
        {index} · {label}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
