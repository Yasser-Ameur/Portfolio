import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/ui/editorial-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Yasser Ameur.",
};

const LINKS = [
  {
    label: "Email",
    value: "yasserameur.dev@gmail.com",
    href: "mailto:yasserameur.dev@gmail.com",
    external: false,
  },
  {
    label: "GitHub",
    value: "github.com/Yasser-Ameur",
    href: "https://github.com/Yasser-Ameur",
    external: true,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/yasser-ameur",
    href: "https://linkedin.com/in/yasser-ameur",
    external: true,
  },
];

export default function ContactPage() {
  return (
    <EditorialPage
      kicker="Contact"
      title="Interested in building something difficult?"
      intro={<p>Let’s talk.</p>}
    >
      <ul className="mt-12 border-t border-white/8">
        {LINKS.map((link) => (
          <li key={link.label} className="border-b border-white/8">
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="group flex items-center justify-between gap-4 py-5"
            >
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-starlight-faint transition-colors group-hover:text-ember-bright sm:text-xs">
                {link.label}
              </span>
              <span className="text-sm text-starlight transition-colors group-hover:text-ember-bright sm:text-base">
                {link.value}
                {link.external && (
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block text-starlight-faint transition-transform duration-200 ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  >
                    ↗
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm leading-7 text-starlight-dim">
        If you’re hiring, collaborating, or just curious about a system — the
        quickest route is an email. The longest route is{" "}
        <Link
          href="/story"
          className="text-starlight underline decoration-ember/40 underline-offset-4 transition-colors hover:text-ember-bright"
        >
          the story
        </Link>
        .
      </p>
    </EditorialPage>
  );
}
