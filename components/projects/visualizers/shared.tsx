"use client";

import { cn } from "@/lib/utils";

/**
 * Shared pieces for the project worlds. All coordinates are fractions of the
 * visualizer box (0..1), rendered by HTML so text is never distorted. The
 * matching SVG layer uses a 0..100 viewBox stretched to the same box, so
 * shapes, edges, and pulses line up with these targets exactly.
 */

export type NodeSpec = {
  id: string;
  x: number; // 0..1 fraction of width
  y: number; // 0..1 fraction of height
  label: string;
  desc: string;
};

export function NodeTarget({
  node,
  selected,
  dimmed,
  onSelect,
}: {
  node: NodeSpec;
  selected: boolean;
  dimmed?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${node.label} — ${node.desc}`}
      aria-pressed={selected}
      onClick={() => onSelect(node.id)}
      className={cn(
        "group absolute -translate-x-1/2 -translate-y-1/2 rounded-sm px-2 pb-1 pt-2 text-center transition-opacity duration-300",
        dimmed && !selected && "opacity-40 hover:opacity-90",
        selected && "opacity-100"
      )}
      style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
    >
      <span className="block w-max max-w-[6.5rem] rounded-sm border border-white/10 bg-night-950/60 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-starlight-dim backdrop-blur-sm transition-colors duration-200 group-hover:border-ember/40 group-hover:text-ember-bright sm:text-[0.62rem] sm:tracking-[0.18em]">
        {node.label}
      </span>
    </button>
  );
}

export function DescCard({
  node,
  onClose,
}: {
  node: NodeSpec;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label={`${node.label} details`}
      className="pointer-events-auto absolute max-w-xs rounded-lg border border-ember/30 bg-night-900/85 px-4 py-3 shadow-panel backdrop-blur-md"
      style={{
        left: `${node.x * 100}%`,
        top: `calc(${node.y * 100}% - 2.6rem)`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ember-bright">
          {node.label}
        </p>
        <button
          type="button"
          aria-label="Close details"
          onClick={onClose}
          className="-mr-1 -mt-1 rounded-sm px-1 font-mono text-[0.6rem] text-starlight-faint transition-colors hover:text-starlight"
        >
          ✕
        </button>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-starlight-dim">{node.desc}</p>
    </div>
  );
}
