import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, changeFrequency: "daily", priority: 0.8 },
    ...getAllArticles().map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: new Date(`${a.date}T00:00:00+09:00`),
      priority: 0.6,
    })),
  ];
}
