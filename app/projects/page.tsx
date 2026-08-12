import type { Metadata } from "next";
import { WorldPlaceholder } from "@/components/world/world-placeholder";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Distributed systems, backend infrastructure, machine learning, and agentic AI — the systems Yasser Ameur builds.",
};

export default function ProjectsPage() {
  return (
    <WorldPlaceholder
      title="Projects"
      description="A world of connected systems — search engines, event streams, agent networks, and the orchestration layer that ties them together. Coming soon."
    />
  );
}
