import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yasser Ameur",
  description:
    "An interactive autobiography — from a childhood in Casablanca to engineering at EPFL, and onward.",
};

/**
 * The portfolio.
 *
 * This serves the self-contained Casablanca build from
 * `public/casablanca/`. It is a complete scroll-driven experience with its own
 * runtime, scroll driver and assets, so it is embedded whole rather than
 * rebuilt — an iframe keeps its internal scrolling intact and leaves the URL
 * clean. (`output: "export"` rules out a rewrite.)
 *
 * The Three.js sequence built in this repo remains at /world.
 */
export default function Page() {
  return (
    <iframe
      src="/casablanca/Casablanca.dc.html"
      title="Yasser Ameur — an interactive autobiography"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        display: "block",
      }}
    />
  );
}
