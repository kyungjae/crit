import { decryptSlackToken, slackApi } from "@/lib/slack";

type VercelAnalyticsRow = {
  pageviews?: number;
  visitors?: number;
};

type VercelAnalyticsResponse = {
  data?: VercelAnalyticsRow[];
};

function yesterdayKst(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function queryVercelAnalytics(filter?: string): Promise<VercelAnalyticsRow> {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const projectId = process.env.VERCEL_ANALYTICS_PROJECT_ID;
  const teamId = process.env.VERCEL_ANALYTICS_TEAM_ID;
  if (!token || !projectId) return {};

  const date = yesterdayKst();
  const params = new URLSearchParams({
    projectId,
    by: "day",
    since: date,
    until: date,
  });
  if (teamId) params.set("teamId", teamId);
  if (filter) params.set("filter", filter);

  const response = await fetch(`https://api.vercel.com/v1/query/web-analytics/visits/aggregate?${params.toString()}`, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Vercel Web Analytics API HTTP ${response.status}`);
  const result = (await response.json()) as VercelAnalyticsResponse;
  return (result.data ?? []).reduce(
    (total, row) => ({
      pageviews: (total.pageviews ?? 0) + Number(row.pageviews ?? 0),
      visitors: (total.visitors ?? 0) + Number(row.visitors ?? 0),
    }),
    {},
  );
}

export async function fetchAnalyticsNumbers(): Promise<{ visitors: number; articlePageviews: number } | null> {
  if (!process.env.VERCEL_ANALYTICS_TOKEN || !process.env.VERCEL_ANALYTICS_PROJECT_ID) return null;

  const [site, articles] = await Promise.all([
    queryVercelAnalytics(),
    queryVercelAnalytics("startswith(requestPath, '/articles/')"),
  ]);
  return {
    visitors: site.visitors ?? 0,
    articlePageviews: articles.pageviews ?? 0,
  };
}

export function buildSlackReport(
  installationCount: number,
  analytics: { visitors: number; articlePageviews: number } | null,
  siteUrl: string,
) {
  const date = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const analyticsLines = analytics
    ? `• 사이트 방문자수: ${analytics.visitors.toLocaleString("ko-KR")}명\n• 아티클 페이지뷰: ${analytics.articlePageviews.toLocaleString("ko-KR")}회`
    : "• 사이트 방문자수: Vercel Analytics API 설정 필요\n• 아티클 페이지뷰: Vercel Analytics API 설정 필요";
  const text = `crit 일일 리포트 · ${date}\n• 설치된 Slack 워크스페이스 수: ${installationCount}개\n${analyticsLines}`;
  return {
    text,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "crit 일일 리포트", emoji: false } },
      { type: "context", elements: [{ type: "mrkdwn", text: `${date} · <${siteUrl}|crit.day>` }] },
      { type: "divider" },
      { type: "section", text: { type: "mrkdwn", text: `*설치된 Slack 워크스페이스 수:* ${installationCount}개\n${analyticsLines}` } },
    ],
  };
}

export type SlackReportInstallation = {
  teamId: string;
  botTokenEncrypted: string;
  channelId: string | null;
};

export async function sendSlackReport(
  installations: SlackReportInstallation[],
  installationCount: number,
  analytics: { visitors: number; articlePageviews: number } | null,
  siteUrl: string,
) {
  const payload = buildSlackReport(installationCount, analytics, siteUrl);
  const results: Array<{ teamId: string; ok: boolean; error?: string }> = [];
  for (const installation of installations) {
    if (!installation.channelId) continue;
    try {
      await slackApi(decryptSlackToken(installation.botTokenEncrypted), "chat.postMessage", {
        channel: installation.channelId,
        text: payload.text,
        blocks: JSON.stringify(payload.blocks),
      });
      results.push({ teamId: installation.teamId, ok: true });
    } catch (error) {
      results.push({ teamId: installation.teamId, ok: false, error: error instanceof Error ? error.message : "발송 실패" });
    }
  }
  return results;
}
