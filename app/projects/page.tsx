import type { Metadata } from "next";
import { ProjectWorld } from "@/components/projects/project-world";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Distributed search, notification platforms, agentic systems, event streaming, and the orchestration layer that ties them together — the systems Yasser Ameur builds.",
};

export default function ProjectsPage() {
  return <ProjectWorld />;
}
