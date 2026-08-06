/**
 * 최근 게시된 crit 아티클을 Slack Incoming Webhook으로 보낸다.
 *
 * 사용:
 *   npm run slack:digest -- --days 1
 *   npm run slack:digest -- --days 1 --dry-run
 *
 * 실제 발송에는 SLACK_WEBHOOK_URL 환경변수가 필요하다.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ROOT = process.cwd();
const articlesDir = path.join(ROOT, "content", "articles");
const args = process.argv.slice(2);
const daysIndex = args.indexOf("--days");
const days = daysIndex >= 0 ? Number(args[daysIndex + 1]) || 1 : 1;
const dryRun = args.includes("--dry-run");
const siteUrl = process.env.CRIT_SITE_URL ?? "https://crit.day";
const kstDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dateKey(value: Date): string {
  return kstDateFormatter.format(value);
}

const todayKst = dateKey(new Date());
const startDate = new Date(`${todayKst}T00:00:00+09:00`);
startDate.setDate(startDate.getDate() - (days - 1));
const sinceDateKey = dateKey(startDate);

type Article = {
  title: string;
  summary: string;
  date: string;
  dateKey: string;
  sourceUrl?: string;
  sourceName?: string;
  slug: string;
  draft: boolean;
};

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function loadRecentArticles(): Article[] {
  if (!fs.existsSync(articlesDir)) return [];

  return fs
    .readdirSync(articlesDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const filename = path.join(articlesDir, file);
      const { data } = matter(fs.readFileSync(filename, "utf8"));
      const slug = file.replace(/\.md$/, "");
      const parsedDate = new Date(data.date);
      const date = normalize(data.date);
      return {
        title: normalize(data.title),
        summary: normalize(data.summary),
        date,
        dateKey: Number.isNaN(parsedDate.getTime()) ? "" : dateKey(parsedDate),
        sourceUrl: normalize(data.source_url) || undefined,
        sourceName: normalize(data.source_name) || undefined,
        slug,
        draft: data.draft === true,
      };
    })
    .filter((article) => {
      return !article.draft && article.dateKey >= sinceDateKey && article.dateKey <= todayKst;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

function articleUrl(article: Article): string {
  return `${siteUrl.replace(/\/$/, "")}/articles/${encodeURIComponent(article.slug)}`;
}

function summaryBullets(summary: string): string {
  const sentences = summary
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return (sentences.length > 0 ? sentences : [summary.trim()])
    .map((sentence) => `• ${sentence}`)
    .join("\n");
}

function slackPayload(articles: Article[]) {
  const blocks: Array<Record<string, unknown>> = [
    {
      type: "header",
      text: { type: "plain_text", text: `crit 새 글 ${articles.length}건`, emoji: false },
    },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `${sinceDateKey}~${todayKst} · <${siteUrl}|crit.day>` }],
    },
    { type: "divider" },
  ];

  for (const article of articles) {
    const source = article.sourceUrl
      ? ` · 출처: <${article.sourceUrl}|${article.sourceName ?? "원문"}>`
      : "";
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${articleUrl(article)}|${article.title}>*\n${summaryBullets(article.summary)}${source}`,
      },
    });
  }

  return { text: `crit 새 글 ${articles.length}건`, blocks };
}

async function main() {
  const articles = loadRecentArticles();
  const payload = slackPayload(articles);

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("SLACK_WEBHOOK_URL 환경변수가 없습니다.");
  }

  if (articles.length === 0) {
    console.log(`최근 ${days}일 내 새 글이 없어 Slack 발송을 건너뜁니다.`);
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack Webhook 실패 (${response.status}): ${body.slice(0, 200)}`);
  }

  console.log(`Slack에 ${articles.length}건을 발송했습니다.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
