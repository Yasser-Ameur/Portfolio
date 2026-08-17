import type { MetadataRoute } from "next";

const BASE = "https://yasserameur.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // The world lives at `/`; `/journey` is the same story as readable text and is
  // what search engines and screen readers actually get to index.
  return ["", "/journey"].map((route) => ({
    url: `${BASE}${route}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
