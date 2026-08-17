"use client";

/**
 * The only chrome in the experience.
 *
 * A caption that fades, a hairline showing position in a life, and a sound
 * toggle. No nav bar, no modals, no "click to continue" button — the world is
 * supposed to be the interface.
 */

import { useEffect, useRef, useState } from "react";
import { getState, useWorld } from "@/engine/store";
import { CHAPTERS } from "./chapters";
import { WORLD_END, WORLD_START } from "./journey";

const selectCaption = (s: ReturnType<typeof getState>) => s.caption;
const selectProgress = (s: ReturnType<typeof getState>) => s.progress;
const selectSound = (s: ReturnType<typeof getState>) => s.soundEnabled;
const selectChapter = (s: ReturnType<typeof getState>) => s.chapterId;

export function Hud() {
  const caption = useWorld(selectCaption);
  const progress = useWorld(selectProgress);
  const chapterId = useWorld(selectChapter);

  return (
    <>
      <Caption caption={caption} />
      <ProgressRule progress={progress} chapterId={chapterId} />
      <SoundToggle />
    </>
  );
}

function Caption({ caption }: { caption: ReturnType<typeof selectCaption> }) {
  const [shown, setShown] = useState(caption);
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (caption) {
      setShown(caption);
      setVisible(true);
      if (caption.hold) {
        timer.current = window.setTimeout(() => setVisible(false), caption.hold);
      }
    } else {
      setVisible(false);
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [caption]);

  return (
    <div className="caption-well" aria-live="polite" data-visible={visible}>
      {shown?.label ? <p className="caption-label">{shown.label}</p> : null}
      {shown?.line ? <p className="caption-line">{shown.line}</p> : null}
    </div>
  );
}

function ProgressRule({
  progress,
  chapterId,
}: {
  progress: number;
  chapterId: string;
}) {
  const span = WORLD_END - WORLD_START;
  return (
    <div className="progress-rule" aria-hidden="true">
      <div className="progress-rule__track">
        {CHAPTERS.filter((c) => c.id !== "threshold").map((c) => (
          <span
            key={c.id}
            className="progress-rule__mark"
            data-current={c.id === chapterId}
            style={{ left: `${((c.span[0] - WORLD_START) / span) * 100}%` }}
          />
        ))}
        <div
          className="progress-rule__fill"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}

function SoundToggle() {
  const enabled = useWorld(selectSound);
  return (
    <button
      type="button"
      data-ui
      className="sound-toggle"
      aria-pressed={enabled}
      onClick={() => {
        void import("@/engine/audio").then((m) => m.toggleSound());
      }}
    >
      <span className="sound-toggle__bars" data-on={enabled}>
        <i />
        <i />
        <i />
      </span>
      <span className="sr-only">{enabled ? "Turn sound off" : "Turn sound on"}</span>
    </button>
  );
}
