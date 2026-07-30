import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/schema";
import ArticleCard from "@/components/ArticleCard";
import CategoryTabs from "@/components/CategoryTabs";

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  design: "좋은 화면과 시스템이 만들어지는 방식",
  "ai-design": "AI가 바꾸는 디자인 판단과 워크플로우",
  tools: "새로운 제작 환경과 실무 도구",
  "case-study": "브랜드와 제품이 남긴 설계 방식",
  career: "역할, 시장, 포트폴리오와 채용 신호",
};

function HomeHero({
  today,
  counts,
}: {
  today: string;
  counts: Record<Category, number>;
}) {
  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:!border-neutral-800 dark:!bg-neutral-900/70 md:mb-10 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-brand">
            {today} · Daily design signals
          </p>
          <h1 className="max-w-2xl text-[34px] font-extrabold leading-[1.05] tracking-[-0.055em] text-neutral-950 dark:text-neutral-50 md:text-[56px]">
            디자인이 바뀌는 신호를 매일 읽기 좋게 정리합니다.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400 md:text-[17px]">
            AI, 제품, 브랜드, 도구, 커리어에서 디자이너가 놓치면 안 되는
            변화를 큐레이션합니다. 뉴스가 아니라 실무 판단에 남는 관점을
            쌓습니다.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/?category=${category}`}
              className="group rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition hover:border-neutral-300 hover:bg-white dark:!border-neutral-800 dark:!bg-neutral-950/60 dark:hover:!border-neutral-700 dark:hover:!bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-bold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {CATEGORY_DESCRIPTIONS[category]}
                  </p>
                </div>
                <span className="text-lg text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-brand dark:text-neutral-700">
                  →
                </span>
              </div>
              <p className="mt-3 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                {counts[category]} articles
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

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
  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div>
      <HomeHero today={today} counts={counts} />

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
