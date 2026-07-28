import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/jobs`, changeFrequency: "daily", priority: 0.8 },
    ...getAllArticles().map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: new Date(`${a.date}T00:00:00+09:00`),
      priority: 0.6,
    })),
  ];
}
