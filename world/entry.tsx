"use client";

/**
 * The way in.
 *
 * Not a hero. A name, one line, and a door — over the world, which is already
 * running behind it. Stepping through is a fade, not a navigation.
 */

import { useEffect, useState } from "react";
import { setState } from "@/engine/store";
import { World } from "./world";

export function Entry() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  const begin = () => {
    if (leaving) return;
    setLeaving(true);
    setState({ started: true, phase: "travelling" });
    window.setTimeout(() => setGone(true), 1200);
    // Focus the world so the keyboard works immediately.
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(".world-frame")?.focus();
    }, 60);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gone || leaving) return;
      if (e.code === "Enter" || e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault();
        begin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gone, leaving]);

  return (
    <>
      <World />
      {gone ? null : (
        <div className="threshold" data-leaving={leaving}>
          <div className="threshold__inner">
            <h1 className="threshold__name">Yasser Ameur</h1>
            <p className="threshold__sub">Morocco → Lausanne · still going</p>
            <button type="button" className="threshold__begin" onClick={begin} data-ui>
              Walk through it
            </button>
            <p className="threshold__hint">
              <kbd>→</kbd> forward &nbsp;·&nbsp; <kbd>←</kbd> back &nbsp;·&nbsp;{" "}
              <kbd>space</kbd> continue
              <br />
              <a href="/journey" style={{ color: "#6f685c" }}>
                or read it instead
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
