import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { decryptSlackToken, slackApi } from "@/lib/slack";
import {
  buildSlackDigest,
  claimSlackDeliveries,
  markSlackDeliveriesSent,
  publishedArticlesBySlugs,
  recentPublishedArticles,
  releaseSlackDeliveryClaims,
  runSlackDigest,
  type SlackDeliveryClaimStore,
} from "@/lib/slack-digest";

type PostResponse = { ts?: string };

export async function POST(request: Request) {
  const expected = process.env.SLACK_CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DATABASE_URL이 설정되지 않았습니다." }, { status: 503 });

  const deliveryStore: SlackDeliveryClaimStore = {
    createMany: ({ data }) => prisma.slackDelivery.createMany({ data, skipDuplicates: true }),
    updateMany: ({ where, data }) => prisma.slackDelivery.updateMany({
      where: {
        installationId: where.installationId,
        ...(where.slug ? { slug: where.slug } : {}),
        ...(where.slugIn ? { slug: { in: where.slugIn } } : {}),
        ...(where.status ? { status: where.status } : {}),
        ...(where.claimToken !== undefined ? { claimToken: where.claimToken } : {}),
        ...(where.claimedBefore ? { claimedAt: { lt: where.claimedBefore } } : {}),
      },
      data,
    }),
    findMany: ({ where }) => prisma.slackDelivery.findMany({
      where: {
        installationId: where.installationId,
        ...(where.slugIn ? { slug: { in: where.slugIn } } : {}),
        ...(where.status ? { status: where.status } : {}),
        ...(where.claimToken !== undefined ? { claimToken: where.claimToken } : {}),
      },
      select: { slug: true },
    }),
    deleteMany: ({ where }) => prisma.slackDelivery.deleteMany({
      where: {
        installationId: where.installationId,
        ...(where.status ? { status: where.status } : {}),
        ...(where.claimToken !== undefined ? { claimToken: where.claimToken } : {}),
      },
    }),
  };

  const result = await runSlackDigest(new URL(request.url), {
    recentArticles: recentPublishedArticles,
    articlesBySlugs: publishedArticlesBySlugs,
    installations: () => prisma.slackInstallation.findMany({
      where: { active: true, channelId: { not: null } },
    }),
    claim: (installationId, articleSlugs, claimToken) => claimSlackDeliveries(
      deliveryStore,
      installationId,
      articleSlugs,
      claimToken,
    ),
    async send(installation, articles, clientMessageId) {
      const payload = buildSlackDigest(articles, process.env.CRIT_SITE_URL ?? "https://crit.day");
      await slackApi<PostResponse>(decryptSlackToken(installation.botTokenEncrypted), "chat.postMessage", {
        channel: installation.channelId!,
        client_msg_id: clientMessageId,
        text: payload.text,
        blocks: JSON.stringify(payload.blocks),
      });
    },
    markSent: (installationId, articleSlugs, claimToken) => markSlackDeliveriesSent(
      deliveryStore,
      installationId,
      claimToken,
      articleSlugs,
    ),
    release: (installationId, _articleSlugs, claimToken) => releaseSlackDeliveryClaims(
      deliveryStore,
      installationId,
      claimToken,
    ),
  });

  return NextResponse.json(result.body, { status: result.status });
}
