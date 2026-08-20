import Link from "next/link";
import Image from "next/image";
import type { FeedArticle } from "@/lib/content";
import { FORMAT_LABELS } from "@/lib/schema";
import { formatDate, relativeTime } from "@/lib/format";
import { SummaryText } from "@/components/SummaryText";

type ArticleCardVariant = "list" | "grid" | "featured" | "signal" | "compact";

function getDomain(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function ArticleMeta({ article }: { article: FeedArticle }) {
  const domain = getDomain(article.source_url);
  const source = article.source_name ?? domain;
  if (!source) return null;

  return (
    <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
      {source}
    </div>
  );
}

function ArticleBadges({ article }: { article: FeedArticle }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
      <time dateTime={article.date}>{formatDate(article.date)}</time>
      <span className="text-neutral-300 dark:text-neutral-700">/</span>
      <span>{FORMAT_LABELS[article.format]}</span>
      {article.format === "rules" && article.ruleCount > 0 && (
        <>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span>규칙 {article.ruleCount}개</span>
        </>
      )}
      {article.format === "deep" && (
        <>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span>{article.readingMinutes}분</span>
        </>
      )}
    </div>
  );
}

function Thumbnail({
  article,
  variant,
}: {
  article: FeedArticle;
  variant: ArticleCardVariant;
}) {
  const image = article.thumbnail ?? article.hero;
  const shape =
    variant === "signal"
      ? "h-[60px] w-[90px] rounded-md sm:h-[68px] sm:w-[102px]"
      : variant === "list"
        ? "size-20 rounded-lg"
        : variant === "featured"
          ? "aspect-video rounded-sm"
          : "aspect-[4/3] rounded-xl";

  if (!image) {
    return null;
  }

  return (
    <div className={`relative shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800 ${shape}`}>
      <Image
        src={image}
        alt=""
        fill
        priority={variant === "featured"}
        sizes={
          variant === "signal"
            ? "(min-width: 640px) 102px, 90px"
            : variant === "list"
              ? "80px"
              : variant === "featured"
                ? "(min-width: 1280px) 820px, (min-width: 1024px) calc(100vw - 310px), calc(100vw - 32px)"
                : "(min-width: 1024px) 33vw, 100vw"
        }
        className="object-cover transition-opacity duration-200 group-hover:opacity-90"
      />
      {variant !== "list" && variant !== "signal" && variant !== "featured" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
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
  rank,
}: {
  article: FeedArticle;
  variant?: ArticleCardVariant;
  commentCount?: number;
  upvoteCount?: number;
  viewCount?: number;
  rank?: number;
}) {
  if (variant === "compact") {
    return (
      <li className="border-b border-neutral-200 py-3.5 last:border-b-0 dark:border-neutral-800">
        <Link prefetch={false} href={`/articles/${article.slug}`} className="group block">
          <div className="flex items-start gap-3.5">
            {rank && (
              <span className="w-5 shrink-0 pt-0.5 text-[13px] font-black tabular-nums text-brand">
                {String(rank).padStart(2, "0")}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1">
                <ArticleMeta article={article} />
              </div>
              <h3 className="line-clamp-2 text-[15px] font-bold leading-[1.4] tracking-[-0.018em] text-neutral-900 transition group-hover:text-brand dark:text-neutral-100">
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
    const hasImage = Boolean(article.thumbnail ?? article.hero);

    return (
      <li className="min-w-0 border-b border-neutral-200 last:border-b-0 dark:border-neutral-800">
        <div className="py-4 transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.025] sm:px-1">
          <div className="flex min-w-0 items-start gap-3.5">
            {hasImage && (
              <Link
                prefetch={false}
                href={`/articles/${article.slug}`}
                aria-label={`${article.title} 읽기`}
                className="group shrink-0"
              >
                <Thumbnail article={article} variant="signal" />
              </Link>
            )}
            <div className="min-w-0 flex-1">
              {domain && (
                <div className="mb-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  {domain}
                </div>
              )}
              <Link prefetch={false} href={`/articles/${article.slug}`} className="group block">
                <h2 className="text-[17px] font-bold leading-[1.4] tracking-[-0.025em] text-neutral-950 transition group-hover:text-brand dark:text-neutral-50 md:text-[18px]">
                  {article.title}
                </h2>
              </Link>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                <time dateTime={article.date}>{relativeTime(article.date)}</time>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <span>업보트 {upvoteCount}</span>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <span>조회 {viewCount}</span>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <Link
                  prefetch={false}
                  href={`/articles/${article.slug}#comments`}
                  aria-label={`댓글 ${commentCount}개`}
                  className="transition hover:text-brand"
                >
                  댓글 {commentCount}
                </Link>
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
          prefetch={false}
          href={`/articles/${article.slug}`}
          className="group flex h-full flex-col border-t border-neutral-200 pt-3 dark:border-neutral-800"
        >
          <Thumbnail article={article} variant="grid" />
          <div className="flex flex-1 flex-col pt-4">
            <ArticleMeta article={article} />
            <h2 className="mt-2 line-clamp-2 text-[18px] font-bold leading-snug tracking-[-0.025em] text-neutral-950 transition group-hover:text-brand dark:text-neutral-50">
              {article.title}
            </h2>
            <p className="mt-2 whitespace-pre-line line-clamp-3 text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              <SummaryText summary={article.summary} />
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
        <Link prefetch={false} href={`/articles/${article.slug}`} className="group block">
          <Thumbnail article={article} variant="featured" />
          <div className="pt-4">
            <ArticleMeta article={article} />
            <h2 className="mt-2 text-[26px] font-black leading-[1.25] tracking-[-0.04em] text-neutral-950 transition group-hover:text-brand dark:text-neutral-50 md:text-[34px]">
              {article.title}
            </h2>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.7] text-neutral-500 dark:text-neutral-400 md:text-[15px]">
              <SummaryText summary={article.summary} maxBulletItems={2} />
            </p>
            <div className="mt-4">
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
        prefetch={false}
        href={`/articles/${article.slug}`}
        className="group block border-t border-neutral-200 py-4 transition-colors dark:border-neutral-800"
      >
        <div className="flex items-start gap-3.5">
          <div className="min-w-0 flex-1">
            <ArticleMeta article={article} />
            <h2 className="mt-1.5 text-[17px] font-semibold leading-snug text-neutral-900 transition group-hover:text-brand dark:text-neutral-100">
              {article.title}
            </h2>
            <p className="mt-1.5 whitespace-pre-line line-clamp-2 text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              <SummaryText summary={article.summary} />
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
