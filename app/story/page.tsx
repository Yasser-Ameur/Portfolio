import type { Metadata } from "next";
import { WorldPlaceholder } from "@/components/world/world-placeholder";

export const metadata: Metadata = {
  title: "Story",
  description:
    "A journey through the life and becoming of Yasser Ameur — from childhood in Morocco to engineering at EPFL.",
};

export default function StoryPage() {
  return (
    <WorldPlaceholder
      title="My Story"
      description="A side-scrolling journey through a life — from a curious child in Marrakech to an engineer under Swiss skies. Coming soon."
    />
  );
}
