import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/schema";
import ArticleCard from "@/components/ArticleCard";
import CategoryTabs from "@/components/CategoryTabs";

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[24px] font-bold tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
          {title}
        </h2>
      </div>
      {description && (
        <p className="max-w-md text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}

function NewsletterCTA() {
  return (
    <section className="mt-10 rounded-[1.75rem] border border-neutral-200 bg-neutral-950 p-5 text-white dark:!border-neutral-800 dark:!bg-neutral-900 dark:!text-neutral-50 md:p-7">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 dark:text-white/45">
            Newsletter
          </p>
          <h2 className="mt-2 text-[25px] font-bold leading-tight tracking-[-0.045em] md:text-[32px]">
            매일 아침, 디자이너가 봐야 할 변화를 받아보세요.
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/62 dark:text-white/60">
            AI, 제품, 브랜드, 도구, 커리어 신호를 짧게 읽고 바로 판단할 수
            있게 정리합니다.
          </p>
        </div>
        <Link
          href="/links"
          className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
        >
          읽을거리 더 보기
        </Link>
      </div>
    </section>
  );
}

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
  const [featured, ...restArticles] = articles;
  const latestArticles = featured ? restArticles : articles;

  return (
    <div>
      {featured && (
        <section className="mb-10">
          <SectionHeader
            eyebrow="Editor’s pick"
            title={active ? `${CATEGORY_LABELS[active]} 주요 글` : "오늘의 주요 글"}
            description="지금 crit에서 가장 먼저 읽기 좋은 신호입니다."
          />
          <ul>
            <ArticleCard article={featured} variant="featured" />
          </ul>
        </section>
      )}

      <section>
        <SectionHeader
          eyebrow="Latest"
          title={active ? `${CATEGORY_LABELS[active]} 아티클` : "최신 아티클"}
          description="카테고리별로 빠르게 훑고, 데스크톱에서는 매거진 그리드로 탐색합니다."
        />
        <CategoryTabs active={active} counts={counts} total={allArticles.length} />
        {articles.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
            아직 등록된 아티클이 없습니다.
          </p>
        ) : latestArticles.length === 0 ? (
          <p className="rounded-2xl border border-neutral-200 bg-white py-10 text-center text-sm text-neutral-400 dark:!border-neutral-800 dark:!bg-neutral-900/70 dark:text-neutral-500">
            더 표시할 아티클이 없습니다.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-3 md:hidden">
              {latestArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </ul>
            <ul className="hidden grid-cols-2 gap-4 md:grid lg:grid-cols-3">
              {latestArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="grid" />
              ))}
            </ul>
          </>
        )}
      </section>

      <NewsletterCTA />
    </div>
  );
}
