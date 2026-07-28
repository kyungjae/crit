import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/content";
import { CATEGORY_LABELS } from "@/lib/schema";
import { formatDate } from "@/lib/format";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <li>
      <Link
        href={`/articles/${article.slug}`}
        className="block rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors active:bg-neutral-50"
      >
        <div className="flex items-start gap-3.5">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium">
              <span className="text-brand">
                {CATEGORY_LABELS[article.category]}
              </span>
              {article.source_name && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-400">
                    {article.source_name}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-[17px] font-semibold leading-snug text-neutral-900">
              {article.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-neutral-500">
              {article.summary}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
              <time>{formatDate(article.date)}</time>
              {article.format === "rules" && article.ruleCount > 0 && (
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-500">
                  규칙 {article.ruleCount}개
                </span>
              )}
              {article.format === "deep" && (
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-500">
                  긴 글 · {article.readingMinutes}분
                </span>
              )}
            </div>
          </div>
          {article.thumbnail && (
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src={article.thumbnail}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
