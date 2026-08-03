import { Resend } from "resend";

import { getPrisma } from "@/lib/db";
import {
  createNewsletterToken,
  hashNewsletterToken,
  newsletterSubscribeSchema,
} from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

const GENERIC_SUCCESS_MESSAGE =
  "입력한 이메일로 구독 확인 링크를 보냈어요. 메일함을 확인해주세요.";

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

function getFromEmail(): string | null {
  return process.env.NEWSLETTER_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "요청 형식이 올바르지 않습니다" }, 400);
  }

  const parsed = newsletterSubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: parsed.error.issues[0]?.message ?? "이메일을 확인해주세요" },
      400
    );
  }

  const prisma = getPrisma();
  const resend = getResend();
  const from = getFromEmail();
  if (!prisma || !resend || !from || !process.env.NEWSLETTER_TOKEN_SECRET) {
    return json({ error: "뉴스레터 기능은 준비 중이에요." }, 503);
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: parsed.data.email },
    select: { status: true },
  });
  if (existing?.status === "active") {
    return json({ ok: true, message: GENERIC_SUCCESS_MESSAGE }, 202);
  }

  const confirmationToken = createNewsletterToken();
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    create: {
      email: parsed.data.email,
      confirmationTokenHash: hashNewsletterToken(confirmationToken),
    },
    update: {
      status: "pending",
      confirmationTokenHash: hashNewsletterToken(confirmationToken),
      confirmedAt: null,
      unsubscribedAt: null,
      consentAt: new Date(),
    },
    select: { status: true },
  });

  const confirmationUrl = new URL(
    `/api/newsletter/confirm?token=${confirmationToken}`,
    SITE_URL
  ).toString();

  const { error } = await resend.emails.send({
    from,
    to: parsed.data.email,
    subject: "crit 뉴스레터 구독을 확인해주세요",
    text: `crit 뉴스레터를 구독하려면 다음 링크를 열어주세요:\n${confirmationUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h1>crit 뉴스레터 구독 확인</h1>
        <p>아래 버튼을 눌러 매주 새로운 읽을거리를 받아보세요.</p>
        <p><a href="${confirmationUrl}">구독 확인하기</a></p>
        <p style="color:#6b7280;font-size:12px">직접 신청하지 않았다면 이 메일을 무시해주세요.</p>
      </div>
    `,
  });

  if (error) {
    return json({ error: "확인 메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요." }, 502);
  }

  return json({ ok: true, message: GENERIC_SUCCESS_MESSAGE }, 202);
}
