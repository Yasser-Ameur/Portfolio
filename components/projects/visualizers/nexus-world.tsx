"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DescCard, NodeTarget, type NodeSpec } from "./shared";

/**
 * NEXUS — an autonomous knowledge-discovery platform. An agent orchestrates
 * tools, memory, and a knowledge graph; their outputs feed a distributed
 * workflow that converges on a result.
 */

const NODES: NodeSpec[] = [
  {
    id: "agent",
    x: 0.5,
    y: 0.26,
    label: "Agent",
    desc: "Plans a research goal, decomposes it into tasks, and coordinates the investigation across providers.",
  },
  {
    id: "tool",
    x: 0.2,
    y: 0.48,
    label: "Tool",
    desc: "Tool-driven execution behind a provider interface — model, tools, and memory are all swappable.",
  },
  {
    id: "memory",
    x: 0.8,
    y: 0.48,
    label: "Memory",
    desc: "Episodic experience store that feeds critique, consolidation, and later synthesis.",
  },
  {
    id: "knowledge",
    x: 0.5,
    y: 0.5,
    label: "Knowledge",
    desc: "nexus_knowledge — graph ingest, hybrid retrieval (lexical / vector / entity / graph), and GraphRAG evidence extraction. The runtime's public boundary.",
  },
  {
    id: "workflow",
    x: 0.5,
    y: 0.72,
    label: "Workflow",
    desc: "A cycle-safe distributed task queue with priority aging and worker leases drives the plan to completion.",
  },
  {
    id: "result",
    x: 0.5,
    y: 0.9,
    label: "Result",
    desc: "Synthesis with provenance-complete evidence — returned as scored, budget-aware knowledge-update proposals.",
  },
];

const EDGES: [string, string][] = [
  ["agent", "tool"],
  ["agent", "memory"],
  ["agent", "knowledge"],
  ["tool", "workflow"],
  ["memory", "workflow"],
  ["knowledge", "workflow"],
  ["workflow", "result"],
];

const U = 100;
const byId = (id: string) => NODES.find((n) => n.id === id)!;

const CONSTELLATION: [number, number][] = [
  [0.4, 0.44],
  [0.58, 0.41],
  [0.44, 0.56],
  [0.56, 0.55],
  [0.5, 0.42],
  [0.36, 0.5],
  [0.64, 0.5],
];

export function NexusWorld({ active }: { active: boolean }) {
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
          <linearGradient id="nxEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(143,179,217,0.16)" />
            <stop offset="0.5" stopColor="rgba(143,179,217,0.5)" />
            <stop offset="1" stopColor="rgba(143,179,217,0.16)" />
          </linearGradient>
        </defs>

        {/* constellation of knowledge evidence */}
        {CONSTELLATION.map(([x, y], i) => (
          <circle
            key={i}
            cx={x * U}
            cy={y * U}
            r="0.35"
            fill="rgba(207,224,240,0.5)"
          />
        ))}
        <line
          x1={0.5 * U}
          y1={0.5 * U}
          x2={0.4 * U}
          y2={0.44 * U}
          stroke="rgba(143,179,217,0.25)"
          strokeWidth="0.2"
        />
        <line
          x1={0.5 * U}
          y1={0.5 * U}
          x2={0.58 * U}
          y2={0.41 * U}
          stroke="rgba(143,179,217,0.25)"
          strokeWidth="0.2"
        />
        <line
          x1={0.5 * U}
          y1={0.5 * U}
          x2={0.44 * U}
          y2={0.56 * U}
          stroke="rgba(143,179,217,0.25)"
          strokeWidth="0.2"
        />
        <line
          x1={0.5 * U}
          y1={0.5 * U}
          x2={0.56 * U}
          y2={0.55 * U}
          stroke="rgba(143,179,217,0.25)"
          strokeWidth="0.2"
        />

        {/* edges */}
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
              stroke="url(#nxEdge)"
              strokeWidth="0.35"
            />
          );
        })}

        {/* signals travelling between nodes */}
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
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.32,
                }}
              >
                <circle r="0.75" fill="#cfe0f0" />
              </motion.g>
            );
          })}

        {/* node discs */}
        {NODES.map((n) => {
          const isSel = selected === n.id;
          const hub = n.id === "agent";
          return (
            <g key={n.id}>
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r={isSel ? 6.2 : hub ? 5.6 : 4.4}
                fill="rgba(143,179,217,0.13)"
              />
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r={hub ? 2.1 : 1.75}
                fill="#0a101f"
                stroke={isSel ? "#cfe0f0" : "rgba(143,179,217,0.75)"}
                strokeWidth="0.45"
              />
            </g>
          );
        })}
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
