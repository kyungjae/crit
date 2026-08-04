"use client";

import { useState } from "react";
import type { Article } from "@/lib/content";
import ArticleCard from "@/components/ArticleCard";
import { sortArticles, type FeedSort } from "@/lib/feed";

const PAGE_SIZE = 15;

export default function FeedClient({
  articles,
  commentCounts,
  upvoteCounts,
  viewCounts,
  initialSort,
}: {
  articles: Article[];
  commentCounts: Record<string, number>;
  upvoteCounts: Record<string, number>;
  viewCounts: Record<string, number>;
  initialSort: FeedSort;
}) {
  const [sort, setSort] = useState<FeedSort>(initialSort);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sortedArticles = sortArticles(articles, upvoteCounts, sort);
  const visibleArticles = sortedArticles.slice(0, visibleCount);
  const remainingCount = sortedArticles.length - visibleArticles.length;

  function changeSort(nextSort: FeedSort) {
    setSort(nextSort);
    setVisibleCount(PAGE_SIZE);
    const url = nextSort === "popular" ? "/?sort=popular" : "/";
    window.history.replaceState(window.history.state, "", url);
  }

  return (
    <>
      <nav aria-label="피드 정렬" className="mb-4 flex gap-2">
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
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-900 text-white dark:bg-brand dark:text-white"
                  : "bg-white text-neutral-600 ring-1 ring-neutral-200 dark:!bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800"
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {sortedArticles.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
          아직 등록된 아티클이 없습니다.
        </p>
      ) : (
        <>
          <ul
            id="feed-list"
            className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:!border-neutral-800 dark:!bg-neutral-900/80"
          >
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
            <div className="flex justify-center py-6">
              <button
                type="button"
                aria-controls="feed-list"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-brand hover:text-brand dark:!border-neutral-700 dark:!bg-neutral-900 dark:!text-neutral-200 dark:hover:!border-brand dark:hover:!text-brand"
              >
                더보기 · {Math.min(PAGE_SIZE, remainingCount)}개
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
