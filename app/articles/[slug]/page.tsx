import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllArticles, getArticle } from "@/lib/content";
import ArticleBody from "@/components/ArticleBody";
import { CATEGORY_LABELS } from "@/lib/schema";
import { formatDate } from "@/lib/format";
import Rating from "@/components/Rating";
import Comments from "@/components/Comments";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
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
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">
          {CATEGORY_LABELS[article.category]}
        </span>
        <time className="text-neutral-400">{formatDate(article.date)}</time>
      </div>

      <h1 className="text-2xl font-bold leading-snug">{article.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
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

      <ArticleBody markdown={article.body} />

      {article.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-neutral-200 pt-6">
        <Rating slug={article.slug} />
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-6">
        <Comments slug={article.slug} />
      </div>
    </article>
  );
}
