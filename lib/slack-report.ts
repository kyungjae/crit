import crypto from "node:crypto";

import { decryptSlackToken, slackApi } from "@/lib/slack";

type AnalyticsReport = {
  rows?: Array<{ metricValues?: Array<{ value?: string }> }>;
};

type GoogleServiceAccount = {
  client_email?: string;
  private_key?: string;
};

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function serviceAccount(): GoogleServiceAccount | null {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GoogleServiceAccount;
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function googleAccessToken(): Promise<string | null> {
  const account = serviceAccount();
  if (!account) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(JSON.stringify({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(account.private_key!, "base64url")}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Google access token HTTP ${response.status}`);
  const result = (await response.json()) as { access_token?: string };
  return result.access_token ?? null;
}

async function runReport(
  accessToken: string,
  body: Record<string, unknown>,
): Promise<AnalyticsReport> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) throw new Error("GA4_PROPERTY_ID가 설정되지 않았습니다.");

  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`GA4 Data API HTTP ${response.status}`);
  return (await response.json()) as AnalyticsReport;
}

function firstMetric(report: AnalyticsReport): number {
  return Number(report.rows?.[0]?.metricValues?.[0]?.value ?? 0);
}

export async function fetchAnalyticsNumbers(): Promise<{ visitors: number; articlePageviews: number } | null> {
  const accessToken = await googleAccessToken();
  if (!accessToken) return null;

  const [visitors, articlePageviews] = await Promise.all([
    runReport(accessToken, {
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      metrics: [{ name: "activeUsers" }],
    }),
    runReport(accessToken, {
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/articles/" },
        },
      },
    }),
  ]);

  return {
    visitors: firstMetric(visitors),
    articlePageviews: (articlePageviews.rows ?? []).reduce(
      (total, row) => total + Number(row.metricValues?.[0]?.value ?? 0),
      0,
    ),
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
    : "• 사이트 방문자수: GA4 API 설정 필요\n• 아티클 페이지뷰: GA4 API 설정 필요";
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
