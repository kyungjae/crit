import Link from "next/link";

import {
  buildFeedHref,
  type FeedSort as FeedSortValue,
} from "@/lib/feed";

export default function FeedSort({ sort }: { sort: FeedSortValue }) {
  const options: Array<{ label: string; value: FeedSortValue }> = [
    { label: "최신순", value: "latest" },
    { label: "인기순", value: "popular" },
  ];

  return (
    <nav aria-label="피드 정렬" className="mb-4 flex gap-2">
      {options.map((option) => {
        const isActive = sort === option.value;

        return (
          <Link
            key={option.value}
            href={buildFeedHref({ sort: option.value })}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-neutral-900 text-white dark:bg-brand dark:text-white"
                : "bg-white text-neutral-600 ring-1 ring-neutral-200 dark:!bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
