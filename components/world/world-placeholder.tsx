import type { ReactNode } from "react";
import { Starfield } from "@/components/world/starfield";
import { Terrain } from "@/components/world/terrain";

/**
 * Temporary shell for worlds that have not been built yet. It keeps the
 * atmosphere alive during development and is replaced as each world lands.
 */
export function WorldPlaceholder({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-night-950">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #02030a 0%, #060b17 55%, #0c1322 100%)",
        }}
      />
      <Starfield className="opacity-60" />
      <Terrain />
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.5em] text-ember">
          {title}
        </p>
        <h1 className="mt-5 max-w-xl font-display text-4xl font-light leading-tight text-starlight sm:text-6xl">
          This world is being built.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-starlight-dim">
          {description}
        </p>
        {children}
      </div>
    </div>
  );
}
