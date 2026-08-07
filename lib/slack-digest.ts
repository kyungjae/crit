import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type DigestArticle = {
  title: string;
  summary: string;
  slug: string;
  dateKey: string;
  sourceUrl?: string;
  sourceName?: string;
};

const kstDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dateKey(value: Date): string {
  return kstDateFormatter.format(value);
}

function summaryBullets(summary: string): string {
  const lines = summary.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  const hasBulletLines = lines.some((value) => /^(?:[•●▪◦*-]|\d+[.)])\s+/.test(value));
  if (hasBulletLines) {
    return lines
      .map((value) => value.replace(/^(?:[•●▪◦*-]|\d+[.)])\s+/, "").trim())
      .filter(Boolean)
      .map((value) => `• ${value}`)
      .join("\n");
  }
  const sentences = summary.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).map((value) => value.trim()).filter(Boolean);
  return (sentences.length > 0 ? sentences : [summary.trim()]).map((value) => `• ${value}`).join("\n");
}

function publishedArticles(): DigestArticle[] {
  const todayKst = dateKey(new Date());
  const dir = path.join(process.cwd(), "content", "articles");
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir).filter((file) => file.endsWith(".md")).map((file) => {
    const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const parsedDate = new Date(data.date);
    return {
      title: String(data.title ?? "").trim(),
      summary: String(data.summary ?? "").trim(),
      slug: file.replace(/\.md$/, ""),
      dateKey: Number.isNaN(parsedDate.getTime()) ? "" : dateKey(parsedDate),
      sourceUrl: data.source_url ? String(data.source_url).trim() : undefined,
      sourceName: data.source_name ? String(data.source_name).trim() : undefined,
      draft: data.draft === true,
    };
  }).filter((article) => !article.draft && article.dateKey && article.dateKey <= todayKst)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.title.localeCompare(b.title));
}

export function recentPublishedArticles(days = 1): DigestArticle[] {
  const todayKst = dateKey(new Date());
  const startDate = new Date(`${todayKst}T00:00:00+09:00`);
  startDate.setDate(startDate.getDate() - (days - 1));
  const since = dateKey(startDate);
  return publishedArticles().filter((article) => article.dateKey >= since);
}

export function latestPublishedArticles(limit = 3): DigestArticle[] {
  return publishedArticles().slice(0, limit);
}

export function publishedArticlesBySlugs(slugs: string[]): DigestArticle[] {
  const wanted = new Set(slugs);
  return publishedArticles().filter((article) => wanted.has(article.slug));
}

export function buildSlackDigest(articles: DigestArticle[], siteUrl: string) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const blocks: Array<Record<string, unknown>> = [
    { type: "header", text: { type: "plain_text", text: `crit 새 글 ${articles.length}건`, emoji: false } },
    { type: "context", elements: [{ type: "mrkdwn", text: `${articles[0]?.dateKey ?? "오늘"} · crit.day` }] },
    { type: "divider" },
  ];

  for (const article of articles) {
    blocks.push({ type: "section", text: {
      type: "mrkdwn",
      text: `*<${baseUrl}/articles/${encodeURIComponent(article.slug)}|${article.title}>*\n${summaryBullets(article.summary)}`,
    } });
  }
  return { text: `crit 새 글 ${articles.length}건`, blocks };
}

export function buildSlackWelcome(articles: DigestArticle[], siteUrl: string) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const blocks: Array<Record<string, unknown>> = [
    { type: "header", text: { type: "plain_text", text: "crit 봇이 연결되었습니다", emoji: false } },
    { type: "section", text: {
      type: "mrkdwn",
      text: `이 채널로 매일 새 글을 보내드립니다.\n아래 최근 아티클 3개가 보이면 설치 테스트가 끝난 것입니다.\n\n<${baseUrl}|crit.day에서 더 보기>`,
    } },
    { type: "divider" },
  ];

  for (const article of articles) {
    blocks.push({ type: "section", text: {
      type: "mrkdwn",
      text: `*<${baseUrl}/articles/${encodeURIComponent(article.slug)}|${article.title}>*\n${summaryBullets(article.summary)}`,
    } });
  }

  if (articles.length === 0) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: "아직 공개된 아티클이 없습니다. 새 글이 올라오면 이 채널로 보내드립니다." } });
  }

  return { text: "crit 봇이 연결되었습니다. 최근 아티클을 확인해보세요.", blocks };
}
