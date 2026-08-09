import { randomUUID } from "node:crypto";
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

export function allPublishedArticles(): DigestArticle[] {
  return publishedArticles();
}

export function latestPublishedArticles(limit = 3): DigestArticle[] {
  return publishedArticles().slice(0, limit);
}

export function publishedArticlesBySlugs(slugs: string[]): DigestArticle[] {
  const wanted = new Set(slugs);
  return publishedArticles().filter((article) => wanted.has(article.slug));
}

const SLACK_DELIVERY_CLAIM_TTL_MS = 15 * 60 * 1000;
export const SLACK_DIGEST_BATCH_SIZE = 40;

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

type SlackDeliveryRecord = {
  slug: string;
  status: string;
  claimToken: string | null;
  claimedAt: Date;
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
  findMany(args: { where: SlackDeliveryWhere }): Promise<SlackDeliveryRecord[]>;
};

export type ClaimedSlackDeliveries = {
  slugs: string[];
  claimToken: string;
};

export async function claimSlackDeliveries(
  store: SlackDeliveryClaimStore,
  installationId: string,
  slugs: string[],
  claimToken: string,
  now = new Date(),
): Promise<ClaimedSlackDeliveries | null> {
  const uniqueSlugs = [...new Set(slugs)];
  if (uniqueSlugs.length === 0) return null;

  const claimedBefore = new Date(now.getTime() - SLACK_DELIVERY_CLAIM_TTL_MS);
  const pendingRows = await store.findMany({
    where: {
      installationId,
      status: "pending",
    },
  });
  const staleRows = pendingRows
    .filter((row) => row.claimedAt < claimedBefore && row.claimToken)
    .sort((a, b) => a.claimedAt.getTime() - b.claimedAt.getTime() || a.slug.localeCompare(b.slug));

  if (staleRows.length > 0) {
    const staleClaimToken = staleRows[0].claimToken as string;
    const staleSlugs = staleRows
      .filter((row) => row.claimToken === staleClaimToken)
      .map((row) => row.slug);
    const recovered = await store.updateMany({
      where: {
        installationId,
        slugIn: staleSlugs,
        status: "pending",
        claimToken: staleClaimToken,
        claimedBefore,
      },
      data: { claimedAt: now },
    });
    if (recovered.count !== staleSlugs.length) return null;
    return { slugs: staleSlugs, claimToken: staleClaimToken };
  }

  if (pendingRows.length > 0) return null;

  const existingRows = await store.findMany({
    where: { installationId, slugIn: uniqueSlugs },
  });
  const recorded = new Set(existingRows.map((row) => row.slug));
  const freshSlugs = uniqueSlugs
    .filter((slug) => !recorded.has(slug))
    .slice(0, SLACK_DIGEST_BATCH_SIZE);
  if (freshSlugs.length === 0) return null;

  await store.createMany({
    data: freshSlugs.map((slug) => ({
      installationId,
      slug,
      status: "pending",
      claimToken,
      claimedAt: now,
    })),
  });

  const claimed = await store.findMany({
    where: {
      installationId,
      slugIn: freshSlugs,
      status: "pending",
      claimToken,
    },
  });
  const claimedSlugs = claimed.map((row) => row.slug);
  return claimedSlugs.length > 0 ? { slugs: claimedSlugs, claimToken } : null;
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

type SlackDigestInstallation = { id: string; teamId: string };

type SlackDigestResult = {
  teamId: string;
  ok: boolean;
  sent: boolean;
  error?: string;
};

export type SlackDigestDependencies<TInstallation extends SlackDigestInstallation> = {
  allArticles(): DigestArticle[];
  articlesBySlugs(slugs: string[]): DigestArticle[];
  installations(targetedReplay: boolean): Promise<TInstallation[]>;
  claim(installationId: string, slugs: string[], claimToken: string): Promise<ClaimedSlackDeliveries | null>;
  send(
    installation: TInstallation,
    articles: DigestArticle[],
    clientMessageId: string,
  ): Promise<void>;
  markSent(installationId: string, slugs: string[], claimToken: string): Promise<void>;
};

export async function runSlackDigest<TInstallation extends SlackDigestInstallation>(
  url: URL,
  dependencies: SlackDigestDependencies<TInstallation>,
): Promise<{
  status: number;
  body: { ok: boolean; sent: number; error?: string; results?: SlackDigestResult[] };
}> {
  const slugs = [...new Set(
    url.searchParams.getAll("slug").map((slug) => slug.trim()).filter(Boolean),
  )];
  const targetedReplay = slugs.length > 0;
  if (targetedReplay && slugs.length > SLACK_DIGEST_BATCH_SIZE) {
    return {
      status: 400,
      body: {
        ok: false,
        sent: 0,
        error: `특정 글 재발송은 한 번에 ${SLACK_DIGEST_BATCH_SIZE}건까지만 가능합니다.`,
      },
    };
  }

  const articles = targetedReplay
    ? dependencies.articlesBySlugs(slugs)
    : dependencies.allArticles();
  if (targetedReplay) {
    const publishedSlugs = new Set(articles.map((article) => article.slug));
    const unresolved = slugs.filter((slug) => !publishedSlugs.has(slug));
    if (unresolved.length > 0) {
      return {
        status: 400,
        body: {
          ok: false,
          sent: 0,
          error: `공개 글을 찾을 수 없습니다: ${unresolved.join(", ")}`,
        },
      };
    }
  }
  if (articles.length === 0) return { status: 200, body: { ok: true, sent: 0 } };

  const installations = await dependencies.installations(targetedReplay);
  const results: SlackDigestResult[] = [];

  for (const installation of installations) {
    try {
      let sentAny = false;

      if (targetedReplay) {
        for (let offset = 0; offset < articles.length; offset += SLACK_DIGEST_BATCH_SIZE) {
          const batch = articles.slice(offset, offset + SLACK_DIGEST_BATCH_SIZE);
          await dependencies.send(installation, batch, randomUUID());
          sentAny = true;
        }
      } else {
        let remainingArticles = [...articles];
        while (remainingArticles.length > 0) {
          const requestedClaimToken = randomUUID();
          const claimedDelivery = await dependencies.claim(
            installation.id,
            remainingArticles.map((article) => article.slug),
            requestedClaimToken,
          );
          if (!claimedDelivery) break;

          const claimed = new Set(claimedDelivery.slugs);
          const batch = remainingArticles.filter((article) => claimed.has(article.slug));
          if (batch.length === 0) {
            await dependencies.markSent(
              installation.id,
              claimedDelivery.slugs,
              claimedDelivery.claimToken,
            );
            continue;
          }

          await dependencies.send(installation, batch, claimedDelivery.claimToken);
          await dependencies.markSent(
            installation.id,
            claimedDelivery.slugs,
            claimedDelivery.claimToken,
          );

          sentAny = true;
          remainingArticles = remainingArticles.filter((article) => !claimed.has(article.slug));
        }
      }

      results.push({ teamId: installation.teamId, ok: true, sent: sentAny });
    } catch (error) {
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
