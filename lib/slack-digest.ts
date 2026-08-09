import { createHash, randomUUID } from "node:crypto";
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

const SLACK_DELIVERY_CLAIM_TTL_MS = 15 * 60 * 1000;

type PendingSlackDelivery = {
  installationId: string;
  slug: string;
  status: "pending";
  claimToken: string;
  claimedAt: Date;
};

type SlackDeliveryWhere = {
  installationId: string;
  slug?: string;
  slugIn?: string[];
  status?: "pending" | "sent";
  claimToken?: string | null;
  claimedBefore?: Date;
};

export type SlackDeliveryClaimStore = {
  createMany(args: { data: PendingSlackDelivery[] }): Promise<{ count: number }>;
  updateMany(args: {
    where: SlackDeliveryWhere;
    data: {
      status?: "pending" | "sent";
      claimToken?: string | null;
      claimedAt?: Date;
      sentAt?: Date | null;
    };
  }): Promise<{ count: number }>;
  findMany(args: { where: SlackDeliveryWhere }): Promise<Array<{ slug: string }>>;
  deleteMany(args: { where: SlackDeliveryWhere }): Promise<{ count: number }>;
};

export async function claimSlackDeliveries(
  store: SlackDeliveryClaimStore,
  installationId: string,
  slugs: string[],
  claimToken: string,
  now = new Date(),
): Promise<string[]> {
  const uniqueSlugs = [...new Set(slugs)];
  if (uniqueSlugs.length === 0) return [];

  await store.createMany({
    data: uniqueSlugs.map((slug) => ({
      installationId,
      slug,
      status: "pending",
      claimToken,
      claimedAt: now,
    })),
  });

  const claimedBefore = new Date(now.getTime() - SLACK_DELIVERY_CLAIM_TTL_MS);
  await Promise.all(uniqueSlugs.map((slug) => store.updateMany({
    where: { installationId, slug, status: "pending", claimedBefore },
    data: { claimToken, claimedAt: now },
  })));

  const claims = await store.findMany({
    where: { installationId, slugIn: uniqueSlugs, status: "pending", claimToken },
  });
  const claimed = new Set(claims.map((claim) => claim.slug));
  return uniqueSlugs.filter((slug) => claimed.has(slug));
}

export async function markSlackDeliveriesSent(
  store: SlackDeliveryClaimStore,
  installationId: string,
  claimToken: string,
  slugs: string[],
  sentAt = new Date(),
): Promise<void> {
  if (slugs.length === 0) return;
  const result = await store.updateMany({
    where: { installationId, slugIn: slugs, status: "pending", claimToken },
    data: { status: "sent", claimToken: null, sentAt },
  });
  if (result.count !== new Set(slugs).size) {
    throw new Error("Slack delivery sent 상태를 모두 기록하지 못했습니다.");
  }
}

export async function releaseSlackDeliveryClaims(
  store: SlackDeliveryClaimStore,
  installationId: string,
  claimToken: string,
): Promise<void> {
  await store.deleteMany({
    where: { installationId, status: "pending", claimToken },
  });
}

type SlackDigestInstallation = { id: string; teamId: string };

type SlackDigestResult = {
  teamId: string;
  ok: boolean;
  sent: boolean;
  error?: string;
};

export function slackDigestClientMessageId(
  installationId: string,
  slugs: string[],
): string {
  const hex = createHash("sha256")
    .update(JSON.stringify([installationId, [...new Set(slugs)].sort()]))
    .digest("hex")
    .slice(0, 32)
    .split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const value = hex.join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export type SlackDigestDependencies<TInstallation extends SlackDigestInstallation> = {
  recentArticles(days: number): DigestArticle[];
  articlesBySlugs(slugs: string[]): DigestArticle[];
  installations(): Promise<TInstallation[]>;
  claim(installationId: string, slugs: string[], claimToken: string): Promise<string[]>;
  send(
    installation: TInstallation,
    articles: DigestArticle[],
    clientMessageId: string,
  ): Promise<void>;
  markSent(installationId: string, slugs: string[], claimToken: string): Promise<void>;
  release(installationId: string, slugs: string[], claimToken: string): Promise<void>;
};

export async function runSlackDigest<TInstallation extends SlackDigestInstallation>(
  url: URL,
  dependencies: SlackDigestDependencies<TInstallation>,
): Promise<{
  status: number;
  body: { ok: boolean; sent: number; results?: SlackDigestResult[] };
}> {
  const slugs = url.searchParams.getAll("slug").map((slug) => slug.trim()).filter(Boolean);
  const targetedReplay = slugs.length > 0;
  const requestedDays = Number(url.searchParams.get("days") ?? "2");
  const days = Number.isInteger(requestedDays) ? Math.min(Math.max(requestedDays, 1), 30) : 2;
  const articles = targetedReplay
    ? dependencies.articlesBySlugs(slugs)
    : dependencies.recentArticles(days);
  if (articles.length === 0) return { status: 200, body: { ok: true, sent: 0 } };

  const installations = await dependencies.installations();
  const results: SlackDigestResult[] = [];

  for (const installation of installations) {
    const claimToken = randomUUID();
    let claimedSlugs: string[] = [];
    let slackAccepted = false;
    try {
      claimedSlugs = targetedReplay
        ? articles.map((article) => article.slug)
        : await dependencies.claim(
            installation.id,
            articles.map((article) => article.slug),
            claimToken,
          );
      const claimed = new Set(claimedSlugs);
      const pendingArticles = targetedReplay
        ? articles
        : articles.filter((article) => claimed.has(article.slug));
      if (pendingArticles.length === 0) {
        results.push({ teamId: installation.teamId, ok: true, sent: false });
        continue;
      }

      const clientMessageId = targetedReplay
        ? randomUUID()
        : slackDigestClientMessageId(installation.id, claimedSlugs);
      await dependencies.send(installation, pendingArticles, clientMessageId);
      slackAccepted = true;
      if (!targetedReplay) {
        await dependencies.markSent(installation.id, claimedSlugs, claimToken);
      }
      results.push({ teamId: installation.teamId, ok: true, sent: true });
    } catch (error) {
      if (!targetedReplay && !slackAccepted) {
        try {
          await dependencies.release(installation.id, claimedSlugs, claimToken);
        } catch (releaseError) {
          console.error("Slack delivery claim release failed", releaseError);
        }
      }
      results.push({
        teamId: installation.teamId,
        ok: false,
        sent: false,
        error: error instanceof Error ? error.message : "발송 실패",
      });
    }
  }

  const ok = results.every((result) => result.ok);
  return {
    status: ok ? 200 : 502,
    body: { ok, sent: results.filter((result) => result.sent).length, results },
  };
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
