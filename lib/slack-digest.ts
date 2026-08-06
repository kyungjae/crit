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

export function recentPublishedArticles(days = 1): DigestArticle[] {
  const todayKst = dateKey(new Date());
  const startDate = new Date(`${todayKst}T00:00:00+09:00`);
  startDate.setDate(startDate.getDate() - (days - 1));
  const since = dateKey(startDate);
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
  }).filter((article) => !article.draft && article.dateKey >= since && article.dateKey <= todayKst)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.title.localeCompare(b.title));
}

export function buildSlackDigest(articles: DigestArticle[], siteUrl: string) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const blocks: Array<Record<string, unknown>> = [
    { type: "header", text: { type: "plain_text", text: `crit 새 글 ${articles.length}건`, emoji: false } },
    { type: "context", elements: [{ type: "mrkdwn", text: `${articles[0]?.dateKey ?? "오늘"} · <${baseUrl}|crit.day>` }] },
    { type: "divider" },
  ];

  for (const article of articles) {
    const source = article.sourceUrl ? `\n출처: <${article.sourceUrl}|${article.sourceName ?? "원문"}>` : "";
    blocks.push({ type: "section", text: {
      type: "mrkdwn",
      text: `*<${baseUrl}/articles/${encodeURIComponent(article.slug)}|${article.title}>*\n${summaryBullets(article.summary)}${source}`,
    } });
  }
  return { text: `crit 새 글 ${articles.length}건`, blocks };
}
