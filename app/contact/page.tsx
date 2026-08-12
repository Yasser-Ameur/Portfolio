import type { Metadata } from "next";
import { WorldPlaceholder } from "@/components/world/world-placeholder";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Yasser Ameur.",
};

export default function ContactPage() {
  return (
    <WorldPlaceholder
      title="Contact"
      description="Interested in building something difficult? Let's talk."
    />
  );
}
