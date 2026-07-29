"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { InspirationItem } from "@/lib/schema";

const INITIAL_COUNT = 14;
const LOAD_STEP = 10;

function mediaType(item: InspirationItem) {
  const image = item.image.toLowerCase();
  const source = item.source_url.toLowerCase();
  if (image.includes(".gif") || item.tags.includes("gif")) return "GIF";
  if (source.includes("youtube.com") || source.includes("vimeo.com") || item.tags.includes("motion")) {
    return "영상";
  }
  if (item.tags.includes("interface")) return "UI";
  if (item.tags.includes("poster")) return "포스터";
  if (item.tags.includes("bi") || item.tags.includes("logo")) return "BI";
  return null;
}

export default function InspirationMasonry({ items }: { items: InspirationItem[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(items.length, count + LOAD_STEP));
        }
      },
      { rootMargin: "600px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length]);

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
        아직 큐레이션된 이미지가 없습니다.
      </p>
    );
  }

  return (
    <>
      <div className="columns-2 gap-2.5 sm:columns-3 sm:gap-3 [&>*]:mb-2.5 sm:[&>*]:mb-3">
        {visibleItems.map((item, index) => {
          const type = mediaType(item);
          return (
            <a
              key={item.id}
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block break-inside-avoid overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm shadow-neutral-200/40 transition-transform duration-300 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900/80 dark:shadow-none"
            >
              <div className="relative overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading={index < 8 ? "eager" : "lazy"}
                  className="w-full transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
                  {type && (
                    <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                      {type}
                    </span>
                  )}
                  {item.tags.slice(0, 1).map((tag) => (
                    <span
                      key={tag}
                      className="ml-auto rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-neutral-600 backdrop-blur dark:bg-neutral-950/75 dark:text-neutral-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-2.5 py-2.5">
                <p className="line-clamp-2 text-xs font-semibold leading-snug text-neutral-800 dark:text-neutral-100">
                  {item.title}
                </p>
                {item.source_name && (
                  <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                    {item.source_name} ↗
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>

      <div ref={sentinelRef} className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
        {visibleCount < items.length ? "더 불러오는 중…" : "오늘의 영감 끝"}
      </div>
    </>
  );
}
