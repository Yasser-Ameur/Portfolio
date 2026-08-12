export const EASINGS = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  outSoft: [0.22, 1, 0.36, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
} as const;

export const DURATION = {
  fast: 0.12,
  base: 0.2,
  slow: 0.4,
  world: 0.9,
  cinematic: 1.4,
} as const;

export const SITE = {
  name: "Yasser Ameur",
  url: "https://yasserameur.me",
  github: "https://github.com/Yasser-Ameur",
  epfl: "École Polytechnique Fédérale de Lausanne",
} as const;
