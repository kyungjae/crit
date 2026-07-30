import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/schema";
import ArticleCard, { getSignalScore } from "@/components/ArticleCard";
import CategoryTabs from "@/components/CategoryTabs";

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 border-b border-neutral-200 pb-3 dark:border-neutral-800">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
        {eyebrow}
      </p>
      <div className="mt-1 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <h2 className="text-[22px] font-black tracking-[-0.045em] text-neutral-950 dark:text-neutral-50">
          {title}
        </h2>
        {description && (
          <p className="max-w-md text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function Masthead({ total }: { total: number }) {
  return (
    <section className="mb-6 border-b border-neutral-200 pb-6 dark:border-neutral-800">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
            Designer feed
          </p>
          <h1 className="mt-2 max-w-3xl text-[30px] font-black leading-[1.05] tracking-[-0.055em] text-neutral-950 dark:text-neutral-50 md:text-[44px]">
            오늘 볼 디자인 링크와 관점을 한 곳에.
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            news.hada.io처럼 빠르게 훑되, 읽어야 할 글에 crit의 짧은 판단
            단서와 토론 입구를 붙입니다. 매거진보다 가볍고, 단순 링크
            목록보다는 더 해석적인 디자이너 피드입니다.
          </p>
        </div>
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white text-center dark:!border-neutral-800 dark:!bg-neutral-900/80 md:w-[330px]">
          <div className="border-r border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-[20px] font-black tabular-nums text-neutral-950 dark:text-neutral-50">
              {total}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-neutral-400">links</p>
          </div>
          <div className="border-r border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-[20px] font-black text-neutral-950 dark:text-neutral-50">Ask</p>
            <p className="mt-0.5 text-[11px] font-semibold text-neutral-400">questions</p>
          </div>
          <div className="p-3">
            <p className="text-[20px] font-black text-neutral-950 dark:text-neutral-50">Show</p>
            <p className="mt-0.5 text-[11px] font-semibold text-neutral-400">works</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SidebarPanel() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:!border-neutral-800 dark:!bg-neutral-900/80">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">
          Community
        </p>
        <h3 className="mt-2 text-[18px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
          질문과 작업물을 피드로 끌어오기
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          커뮤니티 기능은 큰 섹션보다 작은 입구로 둡니다. 읽다가 바로 질문하거나
          작업물을 공유할 수 있으면 충분합니다.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/ask"
            className="rounded-full bg-neutral-950 px-3 py-2 text-center text-[12px] font-bold text-white dark:bg-brand"
          >
            Ask crit
          </Link>
          <Link
            href="/show"
            className="rounded-full border border-neutral-200 px-3 py-2 text-center text-[12px] font-bold text-neutral-700 dark:!border-neutral-700 dark:!bg-neutral-800 dark:!text-neutral-100"
          >
            Show crit
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:!border-neutral-700 dark:!bg-neutral-900/45">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">
          Submit
        </p>
        <h3 className="mt-2 text-[18px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
          좋은 링크 제보
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          디자인, 제품, AI, 툴, 채용 관련해서 같이 읽을 만한 글을 발견하면
          crit 피드 후보로 모읍니다.
          초기에는 폼 연결 전 안내 모듈로 둡니다.
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-950 p-4 text-white dark:!border-neutral-800 dark:!bg-neutral-900">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
          Weekly
        </p>
        <h3 className="mt-2 text-[18px] font-black tracking-[-0.04em]">
          이번 주 읽어야 할 글 10개
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-white/55">
          Sidebar처럼 날짜별 링크가 쌓이면, 주간 다이제스트는 자연스럽게
          뉴스레터/구독 상품으로 이어집니다.
        </p>
      </section>
    </aside>
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
  const popularArticles = [...allArticles]
    .sort((a, b) => getSignalScore(b) - getSignalScore(a))
    .slice(0, 5);

  return (
    <div>
      <Masthead total={allArticles.length} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main>
          <SectionTitle
            eyebrow="Today"
            title={active ? `${CATEGORY_LABELS[active]} 링크` : "최신 피드"}
            description="도메인, 제목, crit 관점, 토론 입구만 남겨 빠르게 정리했습니다."
          />
          <CategoryTabs active={active} counts={counts} total={allArticles.length} />

          {articles.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
              아직 등록된 아티클이 없습니다.
            </p>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:!border-neutral-800 dark:!bg-neutral-900/80">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  variant="signal"
                  rank={index + 1}
                />
              ))}
            </ul>
          )}

          <section className="mt-8">
            <SectionTitle
              eyebrow="Popular"
              title="많이 읽을 글"
              description="점수는 임시 편집 점수입니다. 나중에 추천/댓글 데이터로 대체할 수 있습니다."
            />
            <ul className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:!border-neutral-800 dark:!bg-neutral-900/80">
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
        </main>

        <SidebarPanel />
      </div>
    </div>
  );
}
