import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { decryptSlackToken, slackApi } from "@/lib/slack";
import {
  allPublishedArticles,
  buildSlackDigest,
  claimSlackDeliveries,
  markSlackDeliveriesSent,
  publishedArticlesBySlugs,
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

  const makeDeliveryStore = (
    database: Pick<Prisma.TransactionClient, "slackDelivery">,
  ): SlackDeliveryClaimStore => ({
    createMany: ({ data }) => database.slackDelivery.createMany({ data, skipDuplicates: true }),
    updateMany: ({ where, data }) => database.slackDelivery.updateMany({
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
    findMany: ({ where }) => database.slackDelivery.findMany({
      where: {
        installationId: where.installationId,
        ...(where.slugIn ? { slug: { in: where.slugIn } } : {}),
        ...(where.status ? { status: where.status } : {}),
        ...(where.claimToken !== undefined ? { claimToken: where.claimToken } : {}),
        ...(where.claimedBefore ? { claimedAt: { lt: where.claimedBefore } } : {}),
      },
      select: { slug: true, status: true, claimToken: true, claimedAt: true },
    }),
  });
  const deliveryStore = makeDeliveryStore(prisma);

  const digestUrl = new URL(request.url);
  const activeInstallations = (includeUninitialized = false) => prisma.slackInstallation.findMany({
    where: {
      active: true,
      channelId: { not: null },
      ...(includeUninitialized ? {} : { digestInitializedAt: { not: null } }),
    },
  });

  // One-time migration/maintenance operation: acknowledge every currently
  // published article without posting it. Normal digests ignore installations
  // until this initialization is complete, so rollout cannot resend the archive.
  if (digestUrl.searchParams.get("baseline") === "current") {
    const articles = allPublishedArticles();
    const installations = await prisma.slackInstallation.findMany({
      where: {
        digestInitializedAt: null,
        active: true,
        channelId: { not: null },
      },
      select: { id: true },
    });
    const slugs = articles.map((article) => article.slug);
    const acknowledgedAt = new Date();
    let acknowledged = 0;

    for (const installation of installations) {
      acknowledged += await prisma.$transaction(async (transaction) => {
        const initialized = await transaction.slackInstallation.updateMany({
          where: { id: installation.id, digestInitializedAt: null },
          data: { digestInitializedAt: acknowledgedAt },
        });
        if (initialized.count === 0 || slugs.length === 0) return 0;

        await transaction.slackDelivery.createMany({
          data: slugs.map((slug) => ({
            installationId: installation.id,
            slug,
            status: "pending",
            claimToken: null,
            claimedAt: acknowledgedAt,
            sentAt: null,
          })),
          skipDuplicates: true,
        });
        const result = await transaction.slackDelivery.updateMany({
          where: { installationId: installation.id, slug: { in: slugs }, status: "pending" },
          data: { status: "sent", claimToken: null, claimedAt: acknowledgedAt, sentAt: acknowledgedAt },
        });
        return result.count;
      });
    }

    return NextResponse.json({
      ok: true,
      baseline: "current",
      articles: articles.length,
      installations: installations.length,
      acknowledged,
    });
  }

  const nextPostAt = new Map<string, number>();
  const result = await runSlackDigest(digestUrl, {
    allArticles: allPublishedArticles,
    articlesBySlugs: publishedArticlesBySlugs,
    installations: activeInstallations,
    claim: (installationId, articleSlugs, claimToken) => prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`
        SELECT pg_advisory_xact_lock(
          hashtextextended(${`crit-slack-digest:${installationId}`}, 0)
        )
      `;
      return claimSlackDeliveries(
        makeDeliveryStore(transaction),
        installationId,
        articleSlugs,
        claimToken,
      );
    }),
    async send(installation, articles, clientMessageId) {
      const waitMs = Math.max(0, (nextPostAt.get(installation.id) ?? 0) - Date.now());
      if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
      const payload = buildSlackDigest(articles, process.env.CRIT_SITE_URL ?? "https://crit.day");
      await slackApi<PostResponse>(decryptSlackToken(installation.botTokenEncrypted), "chat.postMessage", {
        channel: installation.channelId!,
        client_msg_id: clientMessageId,
        text: payload.text,
        blocks: JSON.stringify(payload.blocks),
      });
      nextPostAt.set(installation.id, Date.now() + 1_100);
    },
    markSent: (installationId, articleSlugs, claimToken) => markSlackDeliveriesSent(
      deliveryStore,
      installationId,
      claimToken,
      articleSlugs,
    ),
  });

  return NextResponse.json(result.body, { status: result.status });
}
