import ArticleCard from "@/components/ArticleCard";
import type { FeedArticle } from "@/lib/content";

export default function HomeLead({
  articles,
  viewCounts,
}: {
  articles: FeedArticle[];
  viewCounts: Record<string, number>;
}) {
  const featured = articles[0];
  if (!featured) return null;

  const popular = [...articles]
    .filter((article) => article.slug !== featured.slug)
    .sort((first, second) => {
      const difference =
        (viewCounts[second.slug] ?? 0) - (viewCounts[first.slug] ?? 0);
      return difference || second.date.localeCompare(first.date);
    })
    .slice(0, 5);

  return (
    <section aria-labelledby="today-heading" className="border-b border-neutral-300 pb-9 dark:border-neutral-800">
      <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <h1 id="today-heading" className="text-[12px] font-black uppercase tracking-[0.16em] text-neutral-950 dark:text-neutral-50">
          오늘의 큐레이션
        </h1>
        <p className="hidden text-[11px] font-medium text-neutral-500 dark:text-neutral-400 sm:block">
          디자인과 AI에서 건질 신호만 빠르게
        </p>
      </div>

      <div className="grid min-w-0 gap-8 lg:grid-cols-[230px_minmax(0,820px)]">
        <section aria-labelledby="popular-heading" className="hidden border-t border-neutral-300 pt-3 dark:border-neutral-800 lg:block">
          <h2 id="popular-heading" className="text-[11px] font-black uppercase tracking-[0.14em] text-brand">
            많이 읽는 글
          </h2>
          <ol className="mt-1">
            {popular.map((article, index) => (
              <ArticleCard key={article.slug} article={article} variant="compact" rank={index + 1} />
            ))}
          </ol>
        </section>

        <section aria-label="대표 아티클" className="min-w-0">
          <ul>
            <ArticleCard article={featured} variant="featured" />
          </ul>
        </section>

      </div>
    </section>
  );
}
