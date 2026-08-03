import type { Article } from "@/lib/content";

export type FeedSort = "latest" | "popular";

export function parseFeedSort(value?: string): FeedSort {
  return value === "popular" ? "popular" : "latest";
}

export function sortArticles(
  articles: Article[],
  counts: Record<string, number>,
  sort: FeedSort
): Article[] {
  const sorted = [...articles];
  if (sort === "latest") return sorted;

  return sorted.sort((first, second) => {
    const countDifference =
      (counts[second.slug] ?? 0) - (counts[first.slug] ?? 0);
    if (countDifference !== 0) return countDifference;

    return second.date.localeCompare(first.date);
  });
}

export function buildFeedHref({ sort }: { sort: FeedSort }): string {
  const params = new URLSearchParams();
  if (sort === "popular") params.set("sort", sort);

  const query = params.toString();
  return query ? `/?${query}` : "/";
}
