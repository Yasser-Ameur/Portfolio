import type { Chapter, ChapterId } from "@/engine/types";
import { threshold } from "./threshold";
import { yard } from "./yard";
import { room } from "./room";
import { school } from "./school";
import { stage } from "./stage";
import { goodbye } from "./goodbye";
import { crossing } from "./crossing";
import { arrival } from "./arrival";

/** In world order. The vertical slice runs threshold → arrival. */
export const CHAPTERS: Chapter[] = [
  threshold,
  yard,
  room,
  school,
  stage,
  goodbye,
  crossing,
  arrival,
];

const byId = new Map<ChapterId, Chapter>(CHAPTERS.map((c) => [c.id, c]));

export function chapterById(id: ChapterId): Chapter {
  return byId.get(id) ?? CHAPTERS[0];
}

export function chapterAt(x: number): Chapter {
  for (const c of CHAPTERS) {
    if (x >= c.span[0] && x < c.span[1]) return c;
  }
  return x < CHAPTERS[0].span[0] ? CHAPTERS[0] : CHAPTERS[CHAPTERS.length - 1];
}
