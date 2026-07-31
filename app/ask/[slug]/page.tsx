import { notFound } from "next/navigation";
import Link from "next/link";
import Comments from "@/components/Comments";
import { askItems } from "@/lib/community";

export function generateStaticParams() {
  return askItems.map((item) => ({ slug: item.slug }));
}

export default async function AskDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = askItems.find((entry) => entry.slug === slug);
  if (!item) notFound();

  return (
    <article className="article-reading mx-auto max-w-[620px]">
      <header className="article-header">
        <Link href="/ask" className="text-xs font-semibold text-brand hover:underline">
          ← Ask crit
        </Link>
        <p className="mt-8 text-[11px] font-black uppercase tracking-[0.18em] text-brand">Question</p>
        <h1 className="article-title mt-3 text-[32px] font-bold leading-[1.35] tracking-[-0.03em] sm:text-[44px] sm:leading-[1.3]">
          {item.title}
        </h1>
        <p className="article-summary mt-6 text-[17px] leading-[1.8] text-neutral-500 dark:text-neutral-400">
          {item.intro}
        </p>
      </header>

      <div className="article-prose prose prose-neutral mt-14 max-w-none dark:prose-invert">
        {item.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800" id="comments">
        <h2 className="text-[24px] font-bold tracking-[-0.03em]">이 질문에 답해보기</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          정답보다 실제 경험과 판단 기준을 나눠주세요.
        </p>
        <Comments slug={`ask-${item.slug}`} />
      </section>
    </article>
  );
}
