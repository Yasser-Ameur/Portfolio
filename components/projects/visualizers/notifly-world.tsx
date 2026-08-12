"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DescCard, NodeTarget, type NodeSpec } from "./shared";

/**
 * NotiFly — a notification delivery pipeline. One event fans out to provider
 * adapters, every message is guaranteed through the transactional outbox,
 * and delivery is tracked end to end.
 */

const NODES: NodeSpec[] = [
  {
    id: "event",
    x: 0.1,
    y: 0.42,
    label: "Event",
    desc: "A domain event fires — user_welcome, order_shipped — and enters the platform through a single REST call with an idempotency key.",
  },
  {
    id: "notification",
    x: 0.3,
    y: 0.42,
    label: "Notification",
    desc: "Per-channel templates render, variables are validated, and the notification is written to the transactional outbox.",
  },
  {
    id: "outbox",
    x: 0.3,
    y: 0.78,
    label: "Outbox",
    desc: "The transactional outbox is the source of truth — the database, not the worker — so no notification is ever lost.",
  },
  {
    id: "email",
    x: 0.58,
    y: 0.2,
    label: "Email",
    desc: "SMTP provider adapter with templated subject and body.",
  },
  {
    id: "slack",
    x: 0.58,
    y: 0.39,
    label: "Slack",
    desc: "Webhook adapter that formats the notification for Slack.",
  },
  {
    id: "discord",
    x: 0.58,
    y: 0.6,
    label: "Discord",
    desc: "Provider adapter behind a capabilities-based interface — one class and a registration line.",
  },
  {
    id: "teams",
    x: 0.58,
    y: 0.8,
    label: "Teams",
    desc: "Microsoft Teams adapter. New channels plug in without touching core logic.",
  },
  {
    id: "delivery",
    x: 0.84,
    y: 0.5,
    label: "Delivery",
    desc: "Tracked and audited end to end — exponential-backoff retries, a dead-letter queue, and correlation IDs.",
  },
];

const EDGES: [string, string][] = [
  ["event", "notification"],
  ["notification", "outbox"],
  ["notification", "email"],
  ["notification", "slack"],
  ["notification", "discord"],
  ["notification", "teams"],
  ["email", "delivery"],
  ["slack", "delivery"],
  ["discord", "delivery"],
  ["teams", "delivery"],
];

const PULSES: [string, string][] = [
  ["event", "notification"],
  ["notification", "email"],
  ["notification", "discord"],
  ["email", "delivery"],
  ["discord", "delivery"],
];

const U = 100;
const byId = (id: string) => NODES.find((n) => n.id === id)!;

export function NotiFlyWorld({ active }: { active: boolean }) {
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
          <linearGradient id="nfEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(143,179,217,0.18)" />
            <stop offset="0.5" stopColor="rgba(143,179,217,0.55)" />
            <stop offset="1" stopColor="rgba(143,179,217,0.18)" />
          </linearGradient>
        </defs>

        {/* edges */}
        {EDGES.map(([a, b]) => {
          const p = pos(a);
          const q = pos(b);
          const dashed = a === "notification" && b === "outbox";
          return (
            <line
              key={`${a}-${b}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke="url(#nfEdge)"
              strokeWidth={dashed ? 0.3 : 0.35}
              strokeDasharray={dashed ? "1.2 1.4" : undefined}
            />
          );
        })}

        {/* messages travelling the spine */}
        {!reduced &&
          active &&
          PULSES.map(([a, b], i) => {
            const p = pos(a);
            const q = pos(b);
            return (
              <motion.g
                key={`pulse-${a}-${b}`}
                animate={{ x: [p.x, q.x], y: [p.y, q.y] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.35,
                }}
              >
                <circle r="0.85" fill="#cfe0f0" />
              </motion.g>
            );
          })}

        {/* node discs */}
        {NODES.map((n) => {
          const isSel = selected === n.id;
          const small = n.id === "outbox";
          return (
            <g key={n.id}>
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r={isSel ? (small ? 4 : 5.2) : small ? 3.2 : 4.2}
                fill="rgba(143,179,217,0.13)"
              />
              <circle
                cx={n.x * U}
                cy={n.y * U}
                r={small ? 1.2 : 1.75}
                fill="#0a101f"
                stroke={isSel ? "#cfe0f0" : "rgba(143,179,217,0.7)"}
                strokeWidth="0.4"
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
