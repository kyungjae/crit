import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { GET as GET_CRON } from "@/app/api/cron/newsletter/route";
import { POST as POST_SUBSCRIBE } from "@/app/api/newsletter/subscribe/route";

async function withoutNewsletterConfig<T>(operation: () => Promise<T>): Promise<T> {
  const previous = {
    databaseUrl: process.env.DATABASE_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.NEWSLETTER_FROM_EMAIL,
    tokenSecret: process.env.NEWSLETTER_TOKEN_SECRET,
  };
  delete process.env.DATABASE_URL;
  delete process.env.RESEND_API_KEY;
  delete process.env.NEWSLETTER_FROM_EMAIL;
  delete process.env.NEWSLETTER_TOKEN_SECRET;

  try {
    return await operation();
  } finally {
    if (previous.databaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous.databaseUrl;
    if (previous.resendApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous.resendApiKey;
    if (previous.fromEmail === undefined) delete process.env.NEWSLETTER_FROM_EMAIL;
    else process.env.NEWSLETTER_FROM_EMAIL = previous.fromEmail;
    if (previous.tokenSecret === undefined) delete process.env.NEWSLETTER_TOKEN_SECRET;
    else process.env.NEWSLETTER_TOKEN_SECRET = previous.tokenSecret;
  }
}

test("뉴스레터 API는 잘못된 이메일과 동의를 400으로 거부한다", async () => {
  const response = await withoutNewsletterConfig(() =>
    POST_SUBSCRIBE(
      new NextRequest("http://localhost/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email", consent: false }),
      })
    )
  );

  assert.equal(response.status, 400);
});

test("뉴스레터 API는 필요한 외부 설정이 없으면 503을 반환한다", async () => {
  const response = await withoutNewsletterConfig(() =>
    POST_SUBSCRIBE(
      new NextRequest("http://localhost/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({
          email: "reader@example.com",
          consent: true,
        }),
      })
    )
  );

  assert.equal(response.status, 503);
});

test("뉴스레터 Cron은 인증 없는 요청을 401로 거부한다", async () => {
  const previousSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "cron-secret";
  try {
    const response = await GET_CRON(
      new NextRequest("https://example.com/api/cron/newsletter")
    );
    assert.equal(response.status, 401);
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
  }
});
