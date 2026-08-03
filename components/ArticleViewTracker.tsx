"use client";

import { useEffect, useRef } from "react";

import { getDeviceId } from "@/lib/device";

export default function ArticleViewTracker({ slug }: { slug: string }) {
  const recordedSlug = useRef<string | null>(null);

  useEffect(() => {
    if (recordedSlug.current === slug) return;
    recordedSlug.current = slug;

    const controller = new AbortController();
    void fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, viewerId: getDeviceId() }),
      signal: controller.signal,
    }).catch(() => {
      if (!controller.signal.aborted && recordedSlug.current === slug) {
        recordedSlug.current = null;
      }
    });

    return () => controller.abort();
  }, [slug]);

  return null;
}
