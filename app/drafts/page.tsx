import type { Metadata } from "next";
import Link from "next/link";
import { getDraftArticles, getDraftWarnings } from "@/lib/content";
import { CATEGORY_LABELS, FORMAT_LABELS } from "@/lib/schema";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "초안",
  // 검수용 내부 페이지 — 색인 금지
  robots: { index: false, follow: false },
};

export default function DraftsPage() {
  const drafts = getDraftArticles();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">초안</h1>
      <p className="mb-4 text-sm text-neutral-500">
        검수 후 frontmatter의 <code className="text-[13px]">draft</code> 를 지우면
        발행됩니다
      </p>

      {drafts.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">
          검수 대기 중인 초안이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {drafts.map((article) => {
            const warnings = getDraftWarnings(article);
            return (
              <li key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="block overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-colors active:bg-neutral-50"
                >
                  {article.hero && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.hero}
                      alt=""
                      loading="lazy"
                      className="aspect-[16/9] w-full bg-neutral-100 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="rounded bg-neutral-900 px-1.5 py-0.5 font-medium text-white">
                        {FORMAT_LABELS[article.format]}
                      </span>
                      <span className="font-medium text-brand">
                        {CATEGORY_LABELS[article.category]}
                      </span>
                      <time className="text-neutral-400">
                        {formatDate(article.date)}
                      </time>
                    </div>

                    <h2 className="text-base font-semibold leading-snug">
                      {article.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-neutral-500">
                      {article.summary}
                    </p>

                    {warnings.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {warnings.map((w) => (
                          <span
                            key={w}
                            className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
