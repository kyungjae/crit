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

  const allArticles = getAllArticles();
  const counts = Object.fromEntries(
    CATEGORIES.map((item) => [
      item,
      allArticles.filter((article) => article.category === item).length,
    ])
  ) as Record<Category, number>;
  const articles = active
    ? allArticles.filter((article) => article.category === active)
    : allArticles;
  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div>
      <p className="mb-3 text-[13px] font-medium text-neutral-400 dark:text-neutral-500">
        {today}
      </p>
      <CategoryTabs active={active} counts={counts} total={allArticles.length} />
      {articles.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
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
