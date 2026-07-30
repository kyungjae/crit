import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/schema";
import ArticleCard, { getSignalScore } from "@/components/ArticleCard";
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

function HomeHero({ total }: { total: number }) {
  const stats = [
    { label: "오늘 읽을 신호", value: `${total}` },
    { label: "Ask / Show", value: "open" },
    { label: "Weekly digest", value: "soon" },
  ];

  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900/80 md:p-7">
      <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
            Designer GeekNews
          </p>
          <h1 className="mt-3 max-w-3xl text-[34px] font-black leading-[0.98] tracking-[-0.065em] text-neutral-950 dark:text-neutral-50 md:text-[56px]">
            디자이너가 오늘 봐야 할 변화를 빠르게 훑는 피드.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400 md:text-[16px]">
            개발자에게 GeekNews가 있다면, 디자이너에게는 crit. 제품, AI,
            툴, 케이스, 커리어 신호를 모으고 crit의 한 줄 관점으로 판단의
            단서를 붙입니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="#feed"
              className="inline-flex h-10 items-center rounded-full bg-neutral-950 px-4 text-[13px] font-bold text-white transition hover:bg-neutral-800 dark:bg-brand dark:hover:bg-brand-dark"
            >
              최신 신호 보기
            </Link>
            <Link
              href="/ask"
              className="inline-flex h-10 items-center rounded-full border border-neutral-200 px-4 text-[13px] font-bold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Ask crit
            </Link>
            <Link
              href="/show"
              className="inline-flex h-10 items-center rounded-full border border-neutral-200 px-4 text-[13px] font-bold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Show crit
            </Link>
          </div>
        </div>
        <div className="grid gap-2 rounded-[1.4rem] bg-neutral-50 p-3 dark:bg-neutral-950/70">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="text-[12px] font-semibold text-neutral-500 dark:text-neutral-400">
                {item.label}
              </span>
              <span className="text-[18px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunityPanel() {
  const items = [
    {
      href: "/ask",
      title: "Ask crit",
      body: "커리어, 포트폴리오, 툴 선택, 팀 운영 질문을 디자이너 관점으로 던집니다.",
      cta: "질문 보기",
    },
    {
      href: "/show",
      title: "Show crit",
      body: "작업물, 사이드 프로젝트, 디자인 시스템, 작은 툴을 공유하는 공간입니다.",
      cta: "공유물 보기",
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <Link
          href={item.href}
          key={item.href}
          className="group rounded-[1.35rem] border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">
            Community
          </p>
          <h3 className="mt-2 text-[20px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
            {item.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            {item.body}
          </p>
          <p className="mt-4 text-[12px] font-bold text-neutral-700 transition group-hover:text-brand dark:text-neutral-200">
            {item.cta} →
          </p>
        </Link>
      ))}
    </section>
  );
}

function WeeklyDigestCTA() {
  return (
    <section className="mt-10 rounded-[1.75rem] border border-neutral-200 bg-neutral-950 p-5 text-white dark:!border-neutral-800 dark:!bg-neutral-900 dark:!text-neutral-50 md:p-7">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 dark:text-white/45">
            Weekly Digest
          </p>
          <h2 className="mt-2 text-[25px] font-bold leading-tight tracking-[-0.045em] md:text-[32px]">
            이번 주 디자이너가 놓치면 아쉬운 10개 신호.
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/62 dark:text-white/60">
            AI × 디자인 변화, 툴 업데이트, 케이스, 커리어/채용 신호를 주간
            단위로 묶는 digest 모듈을 준비했습니다.
          </p>
        </div>
        <Link
          href="/links"
          className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 dark:bg-brand dark:text-white dark:hover:bg-brand-dark"
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
  const [featured, ...latestArticles] = articles;
  const popularArticles = [...allArticles]
    .sort((a, b) => getSignalScore(b) - getSignalScore(a))
    .slice(0, 5);

  return (
    <div>
      <HomeHero total={allArticles.length} />

      {featured && (
        <section className="mb-8">
          <SectionHeader
            eyebrow="Editor’s signal"
            title={active ? `${CATEGORY_LABELS[active]} 주요 신호` : "오늘의 주요 신호"}
            description="긴 설명보다 먼저 판단 단서를 주는 crit의 선택입니다."
          />
          <ul>
            <ArticleCard article={featured} variant="featured" />
          </ul>
        </section>
      )}

      <section id="feed" className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <SectionHeader
            eyebrow="Latest feed"
            title={active ? `${CATEGORY_LABELS[active]} 피드` : "최신 피드"}
            description="원문, crit 관점, 토론 진입점을 한 화면에서 빠르게 훑습니다."
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
            <ul className="flex flex-col gap-3">
              {latestArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="signal" />
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.35rem] border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
            <SectionHeader
              eyebrow="Popular"
              title="많이 볼 신호"
              description="편집 신호 점수 기준 정렬입니다."
            />
            <ul>
              {popularArticles.map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  variant="compact"
                  rank={index + 1}
                />
              ))}
            </ul>
          </section>

          <section className="rounded-[1.35rem] border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/45">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">
              Submit
            </p>
            <h3 className="mt-2 text-[19px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
              좋은 링크를 crit에 제보하세요.
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              디자인, 제품, AI, 툴, 채용 신호를 먼저 발견했다면 제보 흐름으로
              이어질 수 있게 자리를 만들었습니다.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/ask"
                className="rounded-full bg-neutral-950 px-3 py-2 text-[12px] font-bold text-white dark:bg-brand"
              >
                Ask 열기
              </Link>
              <Link
                href="/show"
                className="rounded-full border border-neutral-200 px-3 py-2 text-[12px] font-bold text-neutral-700 dark:border-neutral-800 dark:text-neutral-200"
              >
                Show 열기
              </Link>
            </div>
          </section>
        </aside>
      </section>

      <div className="mt-10">
        <SectionHeader
          eyebrow="Ask / Show"
          title="글만 읽는 곳에서, 디자이너가 링크와 질문을 던지는 곳으로."
          description="초기 버전은 커뮤니티 입구와 운영 가이드를 먼저 보여줍니다."
        />
        <CommunityPanel />
      </div>

      <WeeklyDigestCTA />
    </div>
  );
}
