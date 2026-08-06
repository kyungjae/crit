import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/db";
import { fetchAnalyticsNumbers, sendSlackReport } from "@/lib/slack-report";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const expected = process.env.SLACK_CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DATABASE_URL이 설정되지 않았습니다." }, { status: 503 });

  try {
    const [installationCount, installations, analytics] = await Promise.all([
      prisma.slackInstallation.count({ where: { active: true } }),
      prisma.slackInstallation.findMany({
        where: { active: true, channelId: { not: null } },
        select: { teamId: true, botTokenEncrypted: true, channelId: true },
      }),
      fetchAnalyticsNumbers(),
    ]);
    const results = await sendSlackReport(
      installations,
      installationCount,
      analytics,
      process.env.CRIT_SITE_URL ?? "https://crit.day",
    );
    return NextResponse.json({
      ok: results.every((result) => result.ok),
      installationCount,
      analyticsConfigured: analytics !== null,
      sent: results.filter((result) => result.ok).length,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "일일 리포트 생성에 실패했습니다." }, { status: 502 });
  }
}
