"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DescCard, NodeTarget, type NodeSpec } from "./shared";

/**
 * Pulse — a durable event-streaming platform. Events flow from a producer
 * into ordered, append-only partitions and are consumed downstream.
 * Acknowledged messages are fsynced before anything is confirmed.
 */

const NODES: NodeSpec[] = [
  {
    id: "producer",
    x: 0.1,
    y: 0.5,
    label: "Producer",
    desc: "Publishes events as ordered batches — acknowledged only after the segment is fsynced, so acknowledged messages are never lost.",
  },
  {
    id: "p0",
    x: 0.34,
    y: 0.28,
    label: "Partition 0",
    desc: "An ordered, append-only partition. Sparse offset indexes make replay fast and cheap.",
  },
  {
    id: "p1",
    x: 0.34,
    y: 0.5,
    label: "Partition 1",
    desc: "Total order within a partition. Checksummed batches and CRC-validated truncation recover torn writes.",
  },
  {
    id: "p2",
    x: 0.34,
    y: 0.72,
    label: "Partition 2",
    desc: "The durable segment log is the source of truth — consumers replay from any offset.",
  },
  {
    id: "consumer-a",
    x: 0.88,
    y: 0.38,
    label: "Consumer",
    desc: "Consumes with acknowledgements and a deterministic shutdown sequence.",
  },
  {
    id: "consumer-b",
    x: 0.88,
    y: 0.62,
    label: "Consumer",
    desc: "Replayable delivery — a new consumer group is an adapter, not a rewrite.",
  },
];

const LANES = [
  { y: 0.28, events: 7 },
  { y: 0.5, events: 6 },
  { y: 0.72, events: 7 },
];

const U = 100;
const byId = (id: string) => NODES.find((n) => n.id === id)!;

export function PulseWorld({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="absolute inset-x-0 bottom-[34%] top-8 sm:bottom-[36%]">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${U} ${U}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="puEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(192,106,74,0.2)" />
            <stop offset="0.5" stopColor="rgba(192,106,74,0.6)" />
            <stop offset="1" stopColor="rgba(192,106,74,0.2)" />
          </linearGradient>
          <linearGradient id="puLane" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(192,106,74,0.05)" />
            <stop offset="0.5" stopColor="rgba(192,106,74,0.14)" />
            <stop offset="1" stopColor="rgba(192,106,74,0.05)" />
          </linearGradient>
        </defs>

        {/* producer → lanes */}
        {LANES.map((l) => (
          <line
            key={`in-${l.y}`}
            x1={0.1 * U}
            y1={0.5 * U}
            x2={0.3 * U}
            y2={l.y * U}
            stroke="url(#puEdge)"
            strokeWidth="0.3"
          />
        ))}

        {/* partition lanes */}
        {LANES.map((l) => (
          <g key={`lane-${l.y}`}>
            <rect
              x={0.3 * U}
              y={(l.y - 0.055) * U}
              width={0.44 * U}
              height={0.11 * U}
              rx={0.055 * U}
              fill="url(#puLane)"
              stroke="rgba(192,106,74,0.3)"
              strokeWidth="0.25"
            />
            {/* offset ticks */}
            {[0.4, 0.5, 0.6, 0.68].map((t) => (
              <line
                key={t}
                x1={t * U}
                y1={(l.y - 0.045) * U}
                x2={t * U}
                y2={(l.y + 0.045) * U}
                stroke="rgba(192,106,74,0.18)"
                strokeWidth="0.15"
              />
            ))}
          </g>
        ))}

        {/* lanes → consumers */}
        {LANES.map((l) => (
          <g key={`out-${l.y}`}>
            <line
              x1={0.74 * U}
              y1={l.y * U}
              x2={0.88 * U}
              y2={0.38 * U}
              stroke="rgba(192,106,74,0.28)"
              strokeWidth="0.25"
            />
            <line
              x1={0.74 * U}
              y1={l.y * U}
              x2={0.88 * U}
              y2={0.62 * U}
              stroke="rgba(192,106,74,0.28)"
              strokeWidth="0.25"
            />
          </g>
        ))}

        {/* events streaming through the partitions */}
        {!reduced &&
          active &&
          LANES.map((l) =>
            Array.from({ length: l.events }).map((_, i) => (
              <motion.g
                key={`ev-${l.y}-${i}`}
                animate={{ x: [0.345, 0.695] }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: (i / l.events) * 5.5,
                }}
                style={{ y: l.y * U }}
              >
                <circle r="0.5" fill="#e0a284" />
              </motion.g>
            ))
          )}

        {/* producer + consumers */}
        {(["producer", "consumer-a", "consumer-b"] as const).map((id) => {
          const n = byId(id);
          const isSel = selected === n.id;
          return (
            <g key={id}>
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r={isSel ? 5.2 : 4.2}
                fill="rgba(192,106,74,0.13)"
              />
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r="1.75"
                fill="#0a101f"
                stroke={isSel ? "#e0a284" : "rgba(192,106,74,0.75)"}
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
