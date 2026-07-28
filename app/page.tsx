import { getAllArticles } from "@/lib/content";
import { CATEGORIES, type Category } from "@/lib/schema";
import ArticleCard from "@/components/ArticleCard";
import CategoryTabs from "@/components/CategoryTabs";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = CATEGORIES.includes(category as Category)
    ? (category as Category)
    : undefined;

  const articles = getAllArticles(active);

  return (
    <div>
      <CategoryTabs active={active} />
      {articles.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">
          아직 등록된 아티클이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </ul>
      )}
    </div>
  );
}
