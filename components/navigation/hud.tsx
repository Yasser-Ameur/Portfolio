"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * A small, unobtrusive escape hatch. Always reachable, never noisy.
 * - top-left "← HOME" control on every non-home world
 * - ESC anywhere returns home
 */
export function Hud() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pathname !== "/") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, router]);

  if (pathname === "/") return null;

  return (
    <div className="fixed left-4 top-4 z-50 flex items-center gap-3">
      <Link
        href="/"
        aria-label="Return home"
        className="group flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-xs uppercase tracking-[0.22em] text-starlight-dim transition-colors duration-200 hover:text-ember-bright"
      >
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-200 ease-out-soft group-hover:-translate-x-1"
        >
          ←
        </span>
        Home
      </Link>
      <span
        aria-hidden="true"
        className="hidden font-mono text-[0.6rem] uppercase tracking-[0.2em] text-starlight-faint sm:inline"
      >
        esc
      </span>
    </div>
  );
}
