import type { MetadataRoute } from "next";
import { PROJECTS } from "@/content/projects";

const BASE = "https://yasserameur.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/story", "/projects", "/about", "/resume", "/contact"];
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE}${route}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...PROJECTS.map((p) => ({
      url: `${BASE}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
