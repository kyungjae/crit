import { Resend } from "resend";

import { getAllArticles } from "@/lib/content";
import { getPrisma } from "@/lib/db";
import {
  createUnsubscribeToken,
  digestArticles,
  renderDigestHtml,
} from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

function getFromEmail(): string | null {
  return process.env.NEWSLETTER_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? null;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const prisma = getPrisma();
  const apiKey = process.env.RESEND_API_KEY;
  const from = getFromEmail();
  const tokenSecret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!prisma || !apiKey || !from || !tokenSecret) {
    return Response.json({ error: "뉴스레터 기능은 준비 중이에요." }, { status: 503 });
  }

  const articles = digestArticles(getAllArticles());
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: "active" },
    select: { id: true, email: true },
  });
  const resend = new Resend(apiKey);
  let sent = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    const unsubscribeUrl = new URL(
      `/api/newsletter/unsubscribe?token=${createUnsubscribeToken(
        subscriber.id,
        tokenSecret
      )}`,
      SITE_URL
    ).toString();
    const { error } = await resend.emails.send({
      from,
      to: subscriber.email,
      subject: "crit 이번 주 읽을거리",
      html: renderDigestHtml(articles, SITE_URL, unsubscribeUrl),
    });

    if (error) {
      failed += 1;
    } else {
      sent += 1;
    }
  }

  return Response.json({ ok: failed === 0, sent, failed, total: subscribers.length });
}
