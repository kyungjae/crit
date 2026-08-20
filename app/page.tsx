import Link from "next/link";
import { getAllArticles, type FeedArticle } from "@/lib/content";
import FeedClient from "@/components/FeedClient";
import HomeLead from "@/components/HomeLead";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getPrisma } from "@/lib/db";
import { parseFeedSort } from "@/lib/feed";
import { createUpvoteStore, getUpvoteCounts } from "@/lib/upvotes";
import { createViewStore, getViewCounts } from "@/lib/views";

const SIDEBAR_SECTION_CLASS =
  "border-t border-neutral-300 pt-4 dark:border-neutral-800";

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

async function getFeedUpvoteCounts(slugs: string[]): Promise<Record<string, number>> {
  const prisma = getPrisma();
  if (!prisma || slugs.length === 0) return {};

  try {
    return await getUpvoteCounts(createUpvoteStore(prisma), slugs);
  } catch {
    return {};
  }
}

async function getFeedViewCounts(slugs: string[]): Promise<Record<string, number>> {
  const prisma = getPrisma();
  if (!prisma || slugs.length === 0) return {};

  try {
    return await getViewCounts(createViewStore(prisma), slugs);
  } catch {
    return {};
  }
}

function SidebarPanel() {
  return (
    <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start">
      <section className={SIDEBAR_SECTION_CLASS}>
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand">
          Weekly
        </p>
        <h2 className="mt-2 text-[19px] font-black tracking-[-0.035em] text-neutral-950 dark:text-neutral-50">
          이번 주 읽을거리
        </h2>
        <p className="mt-2 text-[13px] leading-[1.7] text-neutral-500 dark:text-neutral-400">
          매주 crit가 고른 아티클 10개를 한 번에 보냅니다.
        </p>
        <NewsletterSignup />
      </section>

      <section className={SIDEBAR_SECTION_CLASS}>
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand">
          Contribute
        </p>
        <h2 className="mt-2 text-[19px] font-black tracking-[-0.035em] text-neutral-950 dark:text-neutral-50">
          좋은 글과 자료 제보하기
        </h2>
        <p className="mt-2 text-[13px] leading-[1.7] text-neutral-500 dark:text-neutral-400">
          crit가 함께 읽으면 좋을 아티클과 링크를 알려주세요.
        </p>
        <nav aria-label="콘텐츠 제보" className="mt-4 grid grid-cols-2 border-y border-neutral-200 text-[12px] font-bold dark:border-neutral-800">
          {[
            ["/submit", "아티클 제보"],
            ["/links/submit", "링크 추가"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="border-b border-neutral-200 py-2.5 text-neutral-600 transition hover:text-brand odd:pr-2 even:border-l even:pl-3 dark:border-neutral-800 dark:text-neutral-300"
            >
              {label} ↗
            </Link>
          ))}
        </nav>
      </section>
    </aside>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sort = parseFeedSort(sortParam);

  const allArticles = getAllArticles();
  const slugs = allArticles.map((article) => article.slug);
  const [commentCounts, upvoteCounts, viewCounts] = await Promise.all([
    getCommentCounts(slugs),
    getFeedUpvoteCounts(slugs),
    getFeedViewCounts(slugs),
  ]);
  const feedArticles: FeedArticle[] = allArticles.map(({ body: _body, ...article }) => article);
  const leadSlugs = feedArticles.slice(0, 1).map((article) => article.slug);

  return (
    <div>
      <HomeLead articles={feedArticles} viewCounts={viewCounts} />

      <div className="mt-10 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main className="min-w-0">
          <FeedClient
            articles={feedArticles}
            commentCounts={commentCounts}
            upvoteCounts={upvoteCounts}
            initialSort={sort}
            latestExcludedSlugs={leadSlugs}
          />
        </main>

        <SidebarPanel />
      </div>
    </div>
  );
}
