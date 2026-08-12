import type { Metadata } from "next";
import { StoryWorld } from "@/components/story/story-world";

export const metadata: Metadata = {
  title: "Story",
  description:
    "A journey through the life and becoming of Yasser Ameur — from childhood in Morocco to engineering at EPFL.",
};

export default function StoryPage() {
  return <StoryWorld />;
}
