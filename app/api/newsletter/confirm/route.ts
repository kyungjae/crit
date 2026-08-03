import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/db";
import { hashNewsletterToken } from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

function redirect(status: "success" | "error") {
  return NextResponse.redirect(
    new URL(`/newsletter/confirmed?status=${status}`, SITE_URL)
  );
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const prisma = getPrisma();
  if (!token || !prisma) return redirect("error");

  const subscriber = await prisma.newsletterSubscriber.findFirst({
    where: {
      confirmationTokenHash: hashNewsletterToken(token),
      status: "pending",
    },
    select: { id: true },
  });
  if (!subscriber) return redirect("error");

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: {
      status: "active",
      confirmationTokenHash: null,
      confirmedAt: new Date(),
      unsubscribedAt: null,
    },
  });

  return redirect("success");
}
