export type Milestone = {
  id: string;
  stage: number; // character growth 0..6
  location: string; // mono label
  caption: string[];
  note?: string[];
};

/**
 * The verified narrative arc. Visual interpretation only — no invented events.
 */
export const MILESTONES: Milestone[] = [
  {
    id: "childhood",
    stage: 0,
    location: "The Beginning",
    caption: ["It started with curiosity.", "Football, games, and an endless desire to explore."],
  },
  {
    id: "marrakech",
    stage: 1,
    location: "Morocco · Marrakech",
    caption: ["Morocco shaped where I came from."],
  },
  {
    id: "programming",
    stage: 2,
    location: "The Discovery",
    caption: ["Then I discovered something different.", "I could build worlds of my own."],
  },
  {
    id: "highschool",
    stage: 3,
    location: "High School",
    caption: ["Hard work accumulated quietly.", "Until one day, I looked back and realized how far I'd come."],
  },
  {
    id: "flight",
    stage: 4,
    location: "The Journey",
    caption: ["One suitcase.", "A new sky ahead."],
  },
  {
    id: "epfl",
    stage: 5,
    location: "EPFL · Lausanne",
    caption: ["At EPFL, curiosity became engineering."],
    note: ["Algorithms. Systems. Machine learning.", "And a lot of things that refused to work on the first try."],
  },
  {
    id: "mountains",
    stage: 6,
    location: "The High Country",
    caption: ["The journey is far from finished.", "There is still a lot to build."],
  },
];
