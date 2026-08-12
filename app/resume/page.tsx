import type { Metadata } from "next";
import { WorldPlaceholder } from "@/components/world/world-placeholder";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume of Yasser Ameur — Computer Science student at EPFL.",
};

export default function ResumePage() {
  return (
    <WorldPlaceholder
      title="Resume"
      description="The story, condensed into one page."
    />
  );
}
