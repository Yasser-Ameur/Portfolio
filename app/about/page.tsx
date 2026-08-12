import type { Metadata } from "next";
import { WorldPlaceholder } from "@/components/world/world-placeholder";

export const metadata: Metadata = {
  title: "About",
  description:
    "Yasser Ameur — Computer Science student at EPFL interested in distributed systems, backend engineering, machine learning, and agentic AI.",
};

export default function AboutPage() {
  return (
    <WorldPlaceholder
      title="About"
      description="Understanding systems from the inside. The philosophy and focus of the person behind the projects."
    />
  );
}
