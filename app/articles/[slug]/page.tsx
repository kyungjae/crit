import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, getArticle, getDraftWarnings } from "@/lib/content";
import ArticleBody from "@/components/ArticleBody";
import { SummaryText } from "@/components/SummaryText";

import { formatDate } from "@/lib/format";
import Upvote from "@/components/Upvote";
import Comments from "@/components/Comments";
import YouTubePlayer from "@/components/embeds/YouTubePlayer";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import DraftEditor from "@/components/DraftEditor";
import DraftPublishButton from "@/components/DraftPublishButton";

function youtubeId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return match?.[1] ?? null;
}

export function generateStaticParams() {
  // 초안은 Production 정적 경로에 포함하지 않는다. /drafts에서 인증된 검수자가
  // 직접 열 수 있는 동적 preview 경로만 유지한다.
  return getAllArticles().map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  if (article.draft) {
    return {
      title: article.title,
      description: article.summary,
      robots: { index: false, follow: false },
    };
  }
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: `${article.date}T00:00:00+09:00`,
      ...(article.thumbnail && { images: [article.thumbnail] }),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article className="article-reading mx-auto max-w-[620px]">
      <ArticleViewTracker slug={article.slug} />
      {article.draft && (
        <div className="mb-5 space-y-3">
          <p className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900">
            초안 — 피드에 노출되지 않습니다
            <Link href="/drafts" className="shrink-0 underline underline-offset-2">
              초안 목록
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <DraftPublishButton
              slug={article.slug}
              title={article.title}
              warnings={getDraftWarnings(article)}
            />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              이 페이지에서 바로 수정하고 저장할 수 있습니다.
            </span>
          </div>
          <DraftEditor
            slug={article.slug}
            initialTitle={article.title}
            initialSummary={article.summary}
            initialBody={article.body}
          />
        </div>
      )}

      {article.hero && !youtubeId(article.source_url) && (
        <div className="-mx-4 mb-5 sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.hero}
            alt=""
            className="aspect-[4/3] w-full bg-neutral-100 object-cover sm:rounded-2xl dark:bg-neutral-800"
          />
        </div>
      )}

      {youtubeId(article.source_url) && (
        <YouTubePlayer id={youtubeId(article.source_url)!} />
      )}

      <header className="article-header">
        <div className="mb-4 flex items-center gap-2 text-xs">
          <time className="text-neutral-400 dark:text-neutral-500">{formatDate(article.date)}</time>
          {article.format !== "brief" && (
            <span className="text-neutral-400 dark:text-neutral-500">
              · {article.readingMinutes}분 읽기
            </span>
          )}
        </div>

        <h1 className="article-title text-[32px] font-bold leading-[1.35] tracking-[-0.03em] sm:text-[44px] sm:leading-[1.3]">
          {article.title}
        </h1>
        <p className="article-summary mt-6 whitespace-pre-line text-[17px] leading-[1.8] text-neutral-500 dark:text-neutral-400">
          <SummaryText summary={article.summary} />
        </p>

        {article.source_url && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand underline underline-offset-2"
          >
            원문 보기{article.source_name ? ` — ${article.source_name}` : ""} ↗
          </a>
        )}
      </header>

      <ArticleBody markdown={article.body} format={article.format} />

      {article.credits.length > 0 && (
        <dl className="mt-8 rounded-xl border border-neutral-200/80 bg-white p-4 dark:!border-neutral-800 dark:!bg-neutral-900/80">
          <dt className="mb-2 text-[11px] font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            크레딧
          </dt>
          {article.credits.map((credit) => (
            <dd key={credit} className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {credit}
            </dd>
          ))}
        </dl>
      )}

      {article.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <Upvote slug={article.slug} />
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <Comments slug={article.slug} />
      </div>
    </article>
  );
}
