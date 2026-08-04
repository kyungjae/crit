"use client";

import { useState } from "react";
import type { Article } from "@/lib/content";
import ArticleCard from "@/components/ArticleCard";
import { sortArticles, type FeedSort } from "@/lib/feed";

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
  const sortedArticles = sortArticles(articles, upvoteCounts, sort);

  function changeSort(nextSort: FeedSort) {
    setSort(nextSort);
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
        <ul className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:!border-neutral-800 dark:!bg-neutral-900/80">
          {sortedArticles.map((article) => (
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
      )}
    </>
  );
}
