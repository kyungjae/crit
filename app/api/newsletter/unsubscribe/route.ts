import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/db";
import { isValidUnsubscribeToken } from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const prisma = getPrisma();
  const secret = process.env.NEWSLETTER_TOKEN_SECRET;
  const subscriberId = token?.split(".")[0];
  if (token && subscriberId && secret && prisma) {
    const isValid = isValidUnsubscribeToken(token, subscriberId, secret);
    const subscriber = isValid
      ? await prisma.newsletterSubscriber.findUnique({
          where: { id: subscriberId },
          select: { id: true },
        })
      : null;

    if (!subscriber) {
      return NextResponse.redirect(new URL("/newsletter/unsubscribed", SITE_URL));
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "unsubscribed",
        unsubscribedAt: new Date(),
        confirmationTokenHash: null,
      },
    });
  }

  return NextResponse.redirect(new URL("/newsletter/unsubscribed", SITE_URL));
}
