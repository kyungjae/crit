import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import FeedClient from "@/components/FeedClient";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getPrisma } from "@/lib/db";
import { parseFeedSort } from "@/lib/feed";
import {
  createUpvoteStore,
  getUpvoteCounts,
} from "@/lib/upvotes";
import { createViewStore, getViewCounts } from "@/lib/views";

const SIDEBAR_CARD_CLASS =
  "rounded-2xl border border-neutral-200 bg-white p-4 dark:!border-neutral-800 dark:!bg-neutral-900/80";

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

async function getFeedUpvoteCounts(
  slugs: string[]
): Promise<Record<string, number>> {
  const prisma = getPrisma();
  if (!prisma || slugs.length === 0) return {};

  try {
    return await getUpvoteCounts(createUpvoteStore(prisma), slugs);
  } catch {
    return {};
  }
}

async function getFeedViewCounts(
  slugs: string[]
): Promise<Record<string, number>> {
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
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <section className={SIDEBAR_CARD_CLASS}>
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">
          Community
        </p>
        <h3 className="mt-2 text-[18px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
          Ask와 Show로 함께 성장하기
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Ask에서 질문하고 Show에서 작업물을 공유해보세요. 커뮤니티의 피드백과
          다양한 의견이 다음 시도를 더 나은 방향으로 이끌어줍니다.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/ask"
            className="rounded-full border border-neutral-300 px-3 py-2 text-center text-[12px] font-bold text-neutral-700 transition hover:border-brand hover:text-brand dark:!border-neutral-700 dark:!text-neutral-200"
          >
            Ask crit
          </Link>
          <Link
            href="/show"
            className="rounded-full border border-neutral-300 px-3 py-2 text-center text-[12px] font-bold text-neutral-700 transition hover:border-brand hover:text-brand dark:!border-neutral-700 dark:!text-neutral-200"
          >
            Show crit
          </Link>
        </div>
      </section>

      <section className={SIDEBAR_CARD_CLASS}>
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">
          Submit
        </p>
        <h3 className="mt-2 text-[18px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
          함께 채우는 피드와 링크
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          피드에 소개할 아티클과 다시 찾고 싶은 리소스 링크를 각각 제보해주세요.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/submit"
            className="rounded-full border border-neutral-300 px-3 py-2 text-center text-[12px] font-bold text-neutral-700 transition hover:border-brand hover:text-brand dark:!border-neutral-700 dark:!text-neutral-200"
          >
            아티클 제보
          </Link>
          <Link
            href="/links/submit"
            className="rounded-full border border-neutral-300 px-3 py-2 text-center text-[12px] font-bold text-neutral-700 transition hover:border-brand hover:text-brand dark:!border-neutral-700 dark:!text-neutral-200"
          >
            링크 추가
          </Link>
        </div>
      </section>

      <section className={SIDEBAR_CARD_CLASS}>
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">
          Weekly
        </p>
        <h3 className="mt-2 text-[18px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
          이번 주 읽을거리, 이메일로 받기
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          매주 crit가 고른 아티클 10개를 한 번에 보내드려요.
        </p>
        <NewsletterSignup />
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

  return (
    <div>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0">
          <FeedClient
            articles={allArticles}
            commentCounts={commentCounts}
            upvoteCounts={upvoteCounts}
            viewCounts={viewCounts}
            initialSort={sort}
          />
        </main>

        <SidebarPanel />
      </div>
    </div>
  );
}
