"use client";

import { useState } from "react";
import type { FeedArticle } from "@/lib/content";
import ArticleCard from "@/components/ArticleCard";
import { sortArticles, type FeedSort } from "@/lib/feed";

const PAGE_SIZE = 15;

export default function FeedClient({
  articles,
  commentCounts,
  upvoteCounts,
  viewCounts,
  initialSort,
  latestExcludedSlugs = [],
}: {
  articles: FeedArticle[];
  commentCounts: Record<string, number>;
  upvoteCounts: Record<string, number>;
  viewCounts: Record<string, number>;
  initialSort: FeedSort;
  latestExcludedSlugs?: string[];
}) {
  const [sort, setSort] = useState<FeedSort>(initialSort);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const excluded = new Set(latestExcludedSlugs);
  const candidates =
    sort === "latest"
      ? articles.filter((article) => !excluded.has(article.slug))
      : articles;
  const sortedArticles = sortArticles(candidates, upvoteCounts, sort);
  const visibleArticles = sortedArticles.slice(0, visibleCount);
  const remainingCount = sortedArticles.length - visibleArticles.length;

  function changeSort(nextSort: FeedSort) {
    setSort(nextSort);
    setVisibleCount(PAGE_SIZE);
    const url = nextSort === "popular" ? "/?sort=popular" : "/";
    window.history.replaceState(window.history.state, "", url);
  }

  return (
    <section aria-labelledby="feed-heading">
      <div className="flex items-end justify-between gap-4 border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <h2 id="feed-heading" className="text-[20px] font-black tracking-[-0.035em] text-neutral-950 dark:text-neutral-50">
          전체 피드
        </h2>
        <nav aria-label="피드 정렬" className="flex gap-4">
          {([
            ["최신순", "latest"],
            ["인기순", "popular"],
          ] as const).map(([label, value]) => {
            const isActive = sort === value;

            return (
              <button
                key={value}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => changeSort(value)}
                className={`relative py-1 text-[12px] font-bold transition-colors ${
                  isActive
                    ? "text-neutral-950 after:absolute after:inset-x-0 after:-bottom-[13px] after:h-0.5 after:bg-brand dark:text-neutral-50"
                    : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {sortedArticles.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
          아직 등록된 아티클이 없습니다.
        </p>
      ) : (
        <>
          <ul id="feed-list" className="min-w-0">
            {visibleArticles.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                variant="signal"
                commentCount={commentCounts[article.slug] ?? 0}
                upvoteCount={upvoteCounts[article.slug] ?? 0}
                viewCount={viewCounts[article.slug] ?? 0}
              />
            ))}
          </ul>

          {remainingCount > 0 && (
            <div className="border-t border-neutral-300 py-5 text-center dark:border-neutral-800">
              <button
                type="button"
                aria-controls="feed-list"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="text-[13px] font-bold text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-brand dark:text-neutral-300 dark:decoration-neutral-700"
              >
                다음 {Math.min(PAGE_SIZE, remainingCount)}개 보기 ↓
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
