import Link from "next/link";
import type { Article } from "@/lib/content";
import { CATEGORY_LABELS } from "@/lib/schema";
import { formatDate } from "@/lib/format";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <li>
      <Link
        href={`/articles/${article.slug}`}
        className="block rounded-2xl border border-neutral-200 bg-white p-4 transition-colors active:bg-neutral-50"
      >
        <div className="mb-1.5 flex items-center gap-2 text-xs">
          <span className="font-medium text-brand">
            {CATEGORY_LABELS[article.category]}
          </span>
          <time className="text-neutral-400">{formatDate(article.date)}</time>
          {article.source_name && (
            <span className="text-neutral-400">· {article.source_name}</span>
          )}
        </div>
        <h2 className="text-base font-semibold leading-snug">
          {article.title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500">
          {article.summary}
        </p>
      </Link>
    </li>
  );
}
