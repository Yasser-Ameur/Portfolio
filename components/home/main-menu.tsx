"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type MenuItem = {
  label: string;
  href: string;
  hint?: string;
};

export function MainMenu({
  items,
  onHoverChange,
  className,
}: {
  items: MenuItem[];
  onHoverChange?: (hovered: boolean) => void;
  className?: string;
}) {
  return (
    <nav
      aria-label="Main menu"
      className={cn("flex flex-col items-center gap-2", className)}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group relative rounded-sm px-8 py-2 font-mono text-sm font-medium uppercase",
            "tracking-[0.28em] text-starlight-dim transition-all duration-200 ease-out-soft",
            "hover:tracking-[0.42em] hover:text-ember-bright focus-visible:tracking-[0.42em] focus-visible:text-ember-bright"
          )}
        >
          {/* soft glow behind the option */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 scale-90 rounded-full bg-ember/10 opacity-0 blur-md transition-all duration-200 ease-out-soft group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
          />
          <span
            aria-hidden="true"
            className="absolute -left-1 top-1/2 -translate-y-1/2 translate-x-1 text-ember-bright opacity-0 transition-all duration-200 ease-out-soft group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          >
            ›
          </span>
          <span className="relative">{item.label}</span>
          {item.hint ? (
            <span
              aria-hidden="true"
              className="ml-2 text-[0.7em] tracking-[0.18em] opacity-50"
            >
              {item.hint}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
