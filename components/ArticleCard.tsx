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
            <time className="mt-2 block text-[11px] text-neutral-400">
              {formatDate(article.date)}
            </time>
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
