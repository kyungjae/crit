import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/content";
import { FORMAT_LABELS } from "@/lib/schema";
import { formatDate, relativeTime } from "@/lib/format";

type ArticleCardVariant = "list" | "grid" | "featured" | "signal" | "compact";

function getDomain(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function ArticleMeta({ article }: { article: Article }) {
  const domain = getDomain(article.source_url);

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-medium">
      {(article.source_name || domain) && (
        <>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="text-neutral-400 dark:text-neutral-500">
            {article.source_name ?? domain}
          </span>
        </>
      )}
    </div>
  );
}

function ArticleBadges({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
      <time>{formatDate(article.date)}</time>
      <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        {FORMAT_LABELS[article.format]}
      </span>
      {article.format === "rules" && article.ruleCount > 0 && (
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          규칙 {article.ruleCount}개
        </span>
      )}
      {article.format === "deep" && (
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {article.readingMinutes}분
        </span>
      )}
    </div>
  );
}

function Thumbnail({
  article,
  variant,
}: {
  article: Article;
  variant: ArticleCardVariant;
}) {
  const image = article.thumbnail ?? article.hero;
  if (!image) {
    return (
      <div
        className={`relative overflow-hidden bg-neutral-950 dark:bg-neutral-900 ${
          variant === "signal"
            ? "size-16 rounded-xl"
            : variant === "list"
              ? "size-20 rounded-xl"
              : "aspect-[4/3] rounded-2xl"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(108,92,231,0.38),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_45%)]" />

      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800 ${
        variant === "signal"
          ? "size-16 rounded-xl"
          : variant === "list"
            ? "size-20 rounded-xl"
            : "aspect-[4/3] rounded-2xl"
      }`}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes={
          variant === "signal"
            ? "64px"
            : variant === "list"
              ? "80px"
              : "(min-width: 1024px) 33vw, 100vw"
        }
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      {variant !== "list" && variant !== "signal" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70" />
      )}
    </div>
  );
}

export default function ArticleCard({
  article,
  variant = "list",
  commentCount = 0,
  upvoteCount = 0,
  viewCount = 0,
}: {
  article: Article;
  variant?: ArticleCardVariant;
  commentCount?: number;
  upvoteCount?: number;
  viewCount?: number;
}) {
  if (variant === "compact") {
    return (
      <li className="border-b border-neutral-200 py-3 last:border-b-0 dark:border-neutral-800">
        <Link href={`/articles/${article.slug}`} className="group block">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1">
                <ArticleMeta article={article} />
              </div>
              <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-neutral-900 transition group-hover:text-brand dark:text-neutral-100">
                {article.title}
              </h3>
            </div>
          </div>
        </Link>
      </li>
    );
  }

  if (variant === "signal") {
    const domain = getDomain(article.source_url);

    return (
      <li className="min-w-0 border-b border-neutral-200 last:border-b-0 dark:border-neutral-800">
        <div className="px-4 py-4 transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-900">
          <div className="flex min-w-0 items-start gap-3">
            <Link
              href={`/articles/${article.slug}`}
              aria-label={`${article.title} 읽기`}
              className="group shrink-0"
            >
              <Thumbnail article={article} variant="signal" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-medium">
                {domain && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-700">·</span>
                    <span className="text-neutral-400 dark:text-neutral-500">{domain}</span>
                  </>
                )}
              </div>
              <Link href={`/articles/${article.slug}`} className="group block">
                <h2 className="text-[17px] font-bold leading-snug tracking-[-0.025em] text-neutral-950 transition group-hover:text-brand dark:text-neutral-50 md:text-[18px]">
                  {article.title}
                </h2>
              </Link>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                <time dateTime={article.date}>{relativeTime(article.date)}</time>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <span>업보트 {upvoteCount}개</span>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <Link
                  href={`/articles/${article.slug}#comments`}
                  aria-label={`댓글 ${commentCount}개`}
                  className="transition hover:text-brand"
                >
                  댓글 {commentCount}개
                </Link>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <span>조회 {viewCount}회</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }

  if (variant === "grid") {
    return (
      <li>
        <Link
          href={`/articles/${article.slug}`}
          className="group flex h-full flex-col rounded-[1.35rem] border border-neutral-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-neutral-300 hover:bg-neutral-50/70 active:bg-neutral-50 dark:!border-neutral-800 dark:!bg-neutral-900/80 dark:shadow-none dark:hover:!border-neutral-700 dark:hover:!bg-neutral-900 dark:active:!bg-neutral-900"
        >
          <Thumbnail article={article} variant="grid" />
          <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
            <ArticleMeta article={article} />
            <h2 className="mt-2 line-clamp-2 text-[18px] font-semibold leading-snug tracking-[-0.025em] text-neutral-950 dark:text-neutral-50">
              {article.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {article.summary}
            </p>
            <div className="mt-auto pt-4">
              <ArticleBadges article={article} />
            </div>
          </div>
        </Link>
      </li>
    );
  }

  if (variant === "featured") {
    return (
      <li>
        <Link
          href={`/articles/${article.slug}`}
          className="group grid gap-5 rounded-[1.6rem] border border-neutral-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-neutral-300 hover:bg-neutral-50/70 active:bg-neutral-50 dark:!border-neutral-800 dark:!bg-neutral-900/80 dark:shadow-none dark:hover:!border-neutral-700 dark:hover:!bg-neutral-900 md:grid-cols-[1.2fr_1fr] md:p-4"
        >
          <Thumbnail article={article} variant="featured" />
          <div className="flex flex-col justify-between px-1 pb-1 md:py-2">
            <div>
              <ArticleMeta article={article} />
              <h2 className="mt-3 text-[24px] font-bold leading-tight tracking-[-0.04em] text-neutral-950 dark:text-neutral-50 md:text-[30px]">
                {article.title}
              </h2>
              <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {article.summary}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <ArticleBadges article={article} />
            </div>
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/articles/${article.slug}`}
        className="group block rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:border-neutral-300 hover:bg-neutral-50/70 active:bg-neutral-50 dark:!border-neutral-800 dark:!bg-neutral-900/80 dark:shadow-none dark:hover:!border-neutral-700 dark:hover:!bg-neutral-900 dark:active:!bg-neutral-900"
      >
        <div className="flex items-start gap-3.5">
          <div className="min-w-0 flex-1">
            <ArticleMeta article={article} />
            <h2 className="mt-1.5 text-[17px] font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
              {article.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {article.summary}
            </p>
            <div className="mt-2">
              <ArticleBadges article={article} />
            </div>
          </div>
          <Thumbnail article={article} variant="list" />
        </div>
      </Link>
    </li>
  );
}
