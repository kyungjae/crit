import Link from "next/link";
import type { Article } from "@/lib/content";
import { CATEGORY_LABELS } from "@/lib/schema";
import ArticleCard from "@/components/ArticleCard";

function relatedScore(article: Article, current: Article) {
  const sharedTags = article.tags.filter((tag) => current.tags.includes(tag)).length;
  const sameCategory = article.category === current.category ? 2 : 0;
  return sharedTags * 3 + sameCategory;
}

export default function RelatedArticles({
  current,
  articles,
}: {
  current: Article;
  articles: Article[];
}) {
  const related = articles
    .filter((article) => article.slug !== current.slug && !article.draft)
    .map((article) => ({ article, score: relatedScore(article, current) }))
    .sort((a, b) => b.score - a.score || b.article.date.localeCompare(a.article.date))
    .slice(0, 3)
    .map(({ article }) => article);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            Keep reading
          </p>
          <h2 className="mt-2 text-[22px] font-bold tracking-[-0.035em] text-neutral-950 dark:text-neutral-50">
            이어서 읽어볼 아티클
          </h2>
        </div>
        <Link
          href={`/?category=${current.category}`}
          className="shrink-0 text-xs font-medium text-neutral-400 underline-offset-2 hover:text-brand hover:underline dark:text-neutral-500"
        >
          {CATEGORY_LABELS[current.category]} 더 보기 →
        </Link>
      </div>
      <ul className="grid gap-3">
        {related.map((article) => (
          <ArticleCard key={article.slug} article={article} variant="grid" />
        ))}
      </ul>
    </section>
  );
}
