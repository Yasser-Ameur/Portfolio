"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DescCard, NodeTarget, type NodeSpec } from "./shared";

/**
 * MiniGoogle — a distributed search engine. The visual is a query flow:
 * client → query router → shards (a raft/gossip ring) → retrieval → ranking.
 * Click a node to inspect what it does.
 */

const NODES: NodeSpec[] = [
  {
    id: "client",
    x: 0.12,
    y: 0.5,
    label: "Client",
    desc: "Submits a query over REST — POST /api/v1/search — and gets a ranked result list back.",
  },
  {
    id: "router",
    x: 0.31,
    y: 0.5,
    label: "Query Router",
    desc: "Plans the query (lexer → parser → AST) and fans it out across the shards that own the relevant index slice.",
  },
  {
    id: "shard0",
    x: 0.55,
    y: 0.37,
    label: "Shard 0",
    desc: "Owns a slice of the inverted index. Consistent hashing maps document keys to shards.",
  },
  {
    id: "shard1",
    x: 0.663,
    y: 0.565,
    label: "Shard 1",
    desc: "Serves its local posting lists. Raft + gossip keep consensus, membership, and shard health in sync.",
  },
  {
    id: "shard2",
    x: 0.437,
    y: 0.565,
    label: "Shard 2",
    desc: "When the cluster rebalances, shards move automatically between nodes — no manual partitioning.",
  },
  {
    id: "retrieval",
    x: 0.77,
    y: 0.5,
    label: "Retrieval",
    desc: "BM25 scoring and PageRank over each shard's local results, fused into one candidate set.",
  },
  {
    id: "ranking",
    x: 0.9,
    y: 0.5,
    label: "Ranking",
    desc: "Cross-encoder re-ranking merges lexical and semantic signals — hybrid retrieval — into the final ranked list.",
  },
];

const EDGES: [string, string][] = [
  ["client", "router"],
  ["router", "shard0"],
  ["router", "shard1"],
  ["router", "shard2"],
  ["shard0", "retrieval"],
  ["shard1", "retrieval"],
  ["shard2", "retrieval"],
  ["retrieval", "ranking"],
];

const U = 100; // viewBox spans 0..100
const byId = (id: string) => NODES.find((n) => n.id === id)!;

export function MiniGoogleWorld({ active }: { active: boolean }) {
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
          <linearGradient id="mgEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(217,154,91,0.18)" />
            <stop offset="0.5" stopColor="rgba(217,154,91,0.5)" />
            <stop offset="1" stopColor="rgba(217,154,91,0.18)" />
          </linearGradient>
        </defs>

        {/* raft/gossip ring behind the shards */}
        <circle
          cx={0.55 * U}
          cy={0.5 * U}
          r={0.14 * U}
          fill="none"
          stroke="rgba(217,154,91,0.22)"
          strokeWidth="0.35"
          strokeDasharray="1.6 1.4"
          opacity="0.7"
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
              stroke="url(#mgEdge)"
              strokeWidth="0.35"
            />
          );
        })}

        {/* data pulses travelling along the flow */}
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
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.22,
                }}
                style={{ opacity: 0.9 }}
              >
                <circle r="0.85" fill="#f0bd7d" />
              </motion.g>
            );
          })}

        {/* node discs */}
        {NODES.map((n) => {
          const isSel = selected === n.id;
          return (
            <g key={n.id}>
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r={isSel ? 5.2 : 4.2}
                fill="rgba(217,154,91,0.14)"
              />
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r="1.75"
                fill="#0a101f"
                stroke={isSel ? "#f0bd7d" : "rgba(217,154,91,0.7)"}
                strokeWidth="0.4"
              />
            </g>
          );
        })}
      </svg>

      {/* interactive targets */}
      {NODES.map((n) => (
        <NodeTarget
          key={n.id}
          node={n}
          selected={selected === n.id}
          dimmed={selected !== null && selected !== n.id}
          onSelect={(id) => setSelected(id === selected ? null : id)}
        />
      ))}

      {/* cluster ring caption */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: "55%", top: "50%" }}
      >
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-starlight-faint sm:text-[0.6rem]">
          Raft · Gossip
        </span>
      </div>

      {/* detail card */}
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
