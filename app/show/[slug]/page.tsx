import { notFound } from "next/navigation";
import Link from "next/link";
import Comments from "@/components/Comments";
import { showItems } from "@/lib/community";

export function generateStaticParams() {
  return showItems.map((item) => ({ slug: item.slug }));
}

export default async function ShowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = showItems.find((entry) => entry.slug === slug);
  if (!item) notFound();

  return (
    <article className="article-reading mx-auto max-w-[620px]">
      <header className="article-header">
        <Link href="/show" className="text-xs font-semibold text-brand hover:underline">
          ← Show crit
        </Link>
        <p className="mt-8 text-[11px] font-black uppercase tracking-[0.18em] text-brand">{item.meta}</p>
        <h1 className="article-title mt-3 text-[32px] font-bold leading-[1.35] tracking-[-0.03em] sm:text-[44px] sm:leading-[1.3]">
          {item.title}
        </h1>
        <p className="article-summary mt-6 text-[17px] leading-[1.8] text-neutral-500 dark:text-neutral-400">
          {item.intro}
        </p>
      </header>

      <div className="article-prose prose prose-neutral mt-14 max-w-none dark:prose-invert">
        {item.sections.map(([title, body]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>

      <section className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800" id="comments">
        <h2 className="text-[24px] font-bold tracking-[-0.03em]">이 작업물에 피드백 남기기</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          잘한 점보다 다음 실험에 도움이 될 구체적인 의견을 나눠주세요.
        </p>
        <Comments slug={`show-${item.slug}`} />
      </section>
    </article>
  );
}
