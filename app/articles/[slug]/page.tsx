import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, getArticle } from "@/lib/content";
import ArticleBody from "@/components/ArticleBody";
import { CATEGORY_LABELS } from "@/lib/schema";
import { formatDate } from "@/lib/format";
import Rating from "@/components/Rating";
import Comments from "@/components/Comments";

export function generateStaticParams() {
  // draft도 URL로 미리보기할 수 있게 빌드에 포함한다 (피드·사이트맵에는 없음)
  return getAllArticles(undefined, { includeDrafts: true }).map((a) => ({
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
    <article>
      {article.draft && (
        <p className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900">
          초안 — 피드에 노출되지 않습니다
          <Link href="/drafts" className="shrink-0 underline underline-offset-2">
            목록
          </Link>
        </p>
      )}

      {article.hero && (
        <div className="-mx-4 mb-5 sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.hero}
            alt=""
            className="aspect-[4/3] w-full bg-neutral-100 object-cover sm:rounded-2xl dark:bg-neutral-800"
          />
        </div>
      )}

      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">
          {CATEGORY_LABELS[article.category]}
        </span>
        <time className="text-neutral-400 dark:text-neutral-500">{formatDate(article.date)}</time>
        {article.format !== "brief" && (
          <span className="text-neutral-400 dark:text-neutral-500">
            · {article.readingMinutes}분 읽기
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold leading-snug tracking-[-0.02em]">
        {article.title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {article.summary}
      </p>

      {article.source_url && (
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand underline underline-offset-2"
        >
          원문 보기{article.source_name ? ` — ${article.source_name}` : ""} ↗
        </a>
      )}

      <ArticleBody markdown={article.body} format={article.format} />

      {article.credits.length > 0 && (
        <dl className="mt-8 rounded-xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
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
        <Rating slug={article.slug} />
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <Comments slug={article.slug} />
      </div>
    </article>
  );
}
