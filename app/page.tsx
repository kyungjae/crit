import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import ArticleCard from "@/components/ArticleCard";
import { getPrisma } from "@/lib/db";

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

async function getCommentCounts(slugs: string[]) {
  const prisma = getPrisma();
  if (!prisma || slugs.length === 0) return {} as Record<string, number>;

  try {
    const counts = await prisma.comment.groupBy({
      by: ["slug"],
      where: { slug: { in: slugs } },
      _count: { slug: true },
    });

    return Object.fromEntries(
      counts.map((item) => [item.slug, item._count.slug])
    ) as Record<string, number>;
  } catch {
    return {} as Record<string, number>;
  }
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

export default async function HomePage() {
  const allArticles = getAllArticles();
  const articles = allArticles;
  const commentCounts = await getCommentCounts(allArticles.map((article) => article.slug));

  return (
    <div>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0">
          <section className="mb-10 border-b border-neutral-200 pb-8 dark:border-neutral-800">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
              crit / journal
            </p>
            <h1 className="mt-3 max-w-2xl text-[34px] font-black leading-[1.12] tracking-[-0.055em] text-neutral-950 dark:text-neutral-50 md:text-[48px]">
              디자이너가 지금 읽어야 할 것들
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              디자인, 제품, AI, 툴, 커리어의 신호를 고르고 읽을 맥락을 덧붙입니다.
            </p>
          </section>

          {articles.length >= 2 && (
            <section className="mb-10">
              <SectionTitle eyebrow="Featured" title="이번 주에 먼저 읽을 글" />
              <ul className="grid gap-4 md:grid-cols-2">
                {articles.slice(0, 2).map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="featured" />
                ))}
              </ul>
            </section>
          )}

          <SectionTitle eyebrow="Latest" title="최신 피드" />

          {articles.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
              아직 등록된 아티클이 없습니다.
            </p>
          ) : (
            <ul className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:!border-neutral-800 dark:!bg-neutral-900/80">
              {articles.slice(articles.length >= 2 ? 2 : 0).map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  variant="signal"
                  commentCount={commentCounts[article.slug] ?? 0}
                />
              ))}
            </ul>
          )}
        </main>

        <SidebarPanel />
      </div>
    </div>
  );
}
