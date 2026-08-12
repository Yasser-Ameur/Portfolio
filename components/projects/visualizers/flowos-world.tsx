"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DescCard, NodeTarget, type NodeSpec } from "./shared";

/**
 * FlowOS — the orchestration layer, drawn as the brain of the ecosystem.
 * Workflows reach out to the systems built across the same engineering
 * journey: MiniGoogle, NEXUS, NotiFly, and Pulse.
 */

const NODES: NodeSpec[] = [
  {
    id: "flowos",
    x: 0.5,
    y: 0.44,
    label: "FlowOS",
    desc: "The orchestration layer — a workflow compiles once into a validated plan and executes with durable checkpoints and retries.",
  },
  {
    id: "minigoogle",
    x: 0.14,
    y: 0.34,
    label: "MiniGoogle",
    desc: "Wired in as a search node — the engine is vendored as a submodule, with integration guides for the plugin.",
  },
  {
    id: "nexus",
    x: 0.22,
    y: 0.7,
    label: "NEXUS",
    desc: "The agentic knowledge platform of the same engineering journey — durable task queues and provider-neutral execution, the same design language FlowOS uses.",
  },
  {
    id: "notifly",
    x: 0.86,
    y: 0.36,
    label: "NotiFly",
    desc: "Ships a first-party, typed SDK so notification workflows integrate in minutes.",
  },
  {
    id: "pulse",
    x: 0.78,
    y: 0.7,
    label: "Pulse",
    desc: "The durable messaging backbone of the ecosystem — event-driven workflows subscribe to its streams.",
  },
];

const EDGES: [string, string][] = [
  ["flowos", "minigoogle"],
  ["flowos", "nexus"],
  ["flowos", "notifly"],
  ["flowos", "pulse"],
];

const U = 100;
const byId = (id: string) => NODES.find((n) => n.id === id)!;

export function FlowOSWorld({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<string | null>(null);

  const pos = (id: string) => {
    const n = byId(id);
    return { x: n.x * U, y: n.y * U };
  };

  return (
    <div className="absolute inset-x-0 bottom-[34%] top-8 sm:bottom-[36%]">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${U} ${U}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="foEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(220,181,134,0.2)" />
            <stop offset="0.5" stopColor="rgba(220,181,134,0.6)" />
            <stop offset="1" stopColor="rgba(220,181,134,0.2)" />
          </linearGradient>
        </defs>

        {/* connections radiating from the hub */}
        {EDGES.map(([a, b]) => {
          const p = pos(a);
          const q = pos(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke="url(#foEdge)"
              strokeWidth="0.4"
            />
          );
        })}

        {/* orchestration signals */}
        {!reduced &&
          active &&
          EDGES.map(([a, b], i) => {
            const p = pos(a);
            const q = pos(b);
            return (
              <motion.g
                key={`pulse-${a}-${b}`}
                animate={{ x: [p.x, q.x], y: [p.y, q.y] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.45,
                }}
              >
                <circle r="0.8" fill="#e8cda4" />
              </motion.g>
            );
          })}

        {/* satellites */}
        {NODES.filter((n) => n.id !== "flowos").map((n) => {
          const isSel = selected === n.id;
          return (
            <g key={n.id}>
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r={isSel ? 5.2 : 4.2}
                fill="rgba(220,181,134,0.12)"
              />
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r="1.7"
                fill="#0a101f"
                stroke={isSel ? "#e8cda4" : "rgba(220,181,134,0.7)"}
                strokeWidth="0.4"
              />
            </g>
          );
        })}

        {/* the hub */}
        <circle
          cx={0.5 * U}
          cy={0.44 * U}
          r="7.5"
          fill="rgba(220,181,134,0.16)"
        />
        <circle
          cx={0.5 * U}
          cy={0.44 * U}
          r="5.5"
          fill="none"
          stroke="rgba(220,181,134,0.4)"
          strokeWidth="0.5"
          strokeDasharray="1.6 1.3"
        />
        <circle
          cx={0.5 * U}
          cy={0.44 * U}
          r="2.4"
          fill="#0a101f"
          stroke={selected === "flowos" ? "#e8cda4" : "rgba(220,181,134,0.85)"}
          strokeWidth="0.5"
        />
      </svg>

      {NODES.map((n) => (
        <NodeTarget
          key={n.id}
          node={n}
          selected={selected === n.id}
          dimmed={selected !== null && selected !== n.id}
          onSelect={(id) => setSelected(id === selected ? null : id)}
        />
      ))}

      {selected &&
        (() => {
          const node = byId(selected);
          return (
            <DescCard
              key={node.id}
              node={node}
              onClose={() => setSelected(null)}
            />
          );
        })()}
    </div>
  );
}
