import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { decryptSlackToken, slackApi } from "@/lib/slack";
import { buildSlackDigest, publishedArticlesBySlugs, recentPublishedArticles } from "@/lib/slack-digest";

type PostResponse = { ts?: string };

export async function POST(request: Request) {
  const expected = process.env.SLACK_CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DATABASE_URL이 설정되지 않았습니다." }, { status: 503 });

  const url = new URL(request.url);
  const slugs = url.searchParams.getAll("slug").map((slug) => slug.trim()).filter(Boolean);
  const requestedDays = Number(url.searchParams.get("days") ?? "1");
  const days = Number.isInteger(requestedDays) ? Math.min(Math.max(requestedDays, 1), 30) : 1;
  const articles = slugs.length > 0 ? publishedArticlesBySlugs(slugs) : recentPublishedArticles(days);
  if (articles.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const installations = await prisma.slackInstallation.findMany({
    where: { active: true, channelId: { not: null } },
  });
  const payload = buildSlackDigest(articles, process.env.CRIT_SITE_URL ?? "https://crit.day");
  const results: Array<{ teamId: string; ok: boolean; error?: string }> = [];

  for (const installation of installations) {
    try {
      await slackApi<PostResponse>(decryptSlackToken(installation.botTokenEncrypted), "chat.postMessage", {
        channel: installation.channelId!,
        text: payload.text,
        blocks: JSON.stringify(payload.blocks),
      });
      results.push({ teamId: installation.teamId, ok: true });
    } catch (error) {
      results.push({ teamId: installation.teamId, ok: false, error: error instanceof Error ? error.message : "발송 실패" });
    }
  }

  return NextResponse.json({ ok: results.every((result) => result.ok), sent: results.filter((result) => result.ok).length, results });
}
