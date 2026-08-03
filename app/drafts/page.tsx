import type { Metadata } from "next";
import Link from "next/link";
import DraftDeleteButton from "@/components/DraftDeleteButton";
import DraftEditor from "@/components/DraftEditor";
import DraftPublishButton from "@/components/DraftPublishButton";
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
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        검수 후 카드의 발행 버튼을 누르면 frontmatter의{" "}
        <code className="text-[13px]">draft: true</code> 가 제거되어 발행됩니다.
      </p>

      {drafts.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400 dark:text-neutral-500">
          검수 대기 중인 초안이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {drafts.map((article) => {
            const warnings = getDraftWarnings(article);
            return (
              <li
                key={article.slug}
                className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-colors dark:border-neutral-800 dark:bg-neutral-900/80"
              >
                <Link href={`/articles/${article.slug}`} className="block active:bg-neutral-50 dark:active:bg-neutral-900">
                  {article.hero && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.hero}
                      alt=""
                      loading="lazy"
                      className="aspect-[16/9] w-full bg-neutral-100 object-cover dark:bg-neutral-800"
                    />
                  )}
                </Link>
                <div className="p-4">
                  <Link href={`/articles/${article.slug}`} className="block">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="rounded bg-neutral-900 px-1.5 py-0.5 font-medium text-white dark:bg-brand dark:text-white">
                        {FORMAT_LABELS[article.format]}
                      </span>
                      <span className="font-medium text-brand">
                        {CATEGORY_LABELS[article.category]}
                      </span>
                      <time className="text-neutral-400 dark:text-neutral-500">
                        {formatDate(article.date)}
                      </time>
                    </div>

                    <h2 className="text-base font-semibold leading-snug">
                      {article.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {article.summary}
                    </p>
                  </Link>

                  {warnings.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {warnings.map((w) => (
                        <span
                          key={w}
                          className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DraftPublishButton
                      slug={article.slug}
                      title={article.title}
                      warnings={warnings}
                    />
                    <DraftDeleteButton slug={article.slug} title={article.title} />
                  </div>

                  <DraftEditor
                    slug={article.slug}
                    initialTitle={article.title}
                    initialSummary={article.summary}
                    initialBody={article.body}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
