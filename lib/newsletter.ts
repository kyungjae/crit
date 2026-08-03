import { createHash, createHmac, randomBytes } from "node:crypto";

import { z } from "zod";

const DIGEST_SIZE = 10;

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().email("올바른 이메일을 입력해주세요").max(254).transform((email) => email.toLowerCase()),
  consent: z.literal(true, {
    errorMap: () => ({ message: "뉴스레터 수신에 동의해주세요" }),
  }),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

export type DigestArticle = {
  slug: string;
  title: string;
  summary: string;
  date: string;
};

export function createNewsletterToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashNewsletterToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createUnsubscribeToken(
  subscriberId: string,
  secret: string
): string {
  const signature = createHmac("sha256", secret)
    .update(subscriberId)
    .digest("hex");
  return `${subscriberId}.${signature}`;
}

export function isValidUnsubscribeToken(
  token: string,
  subscriberId: string,
  secret: string
): boolean {
  return token === createUnsubscribeToken(subscriberId, secret);
}

export function digestArticles<T extends DigestArticle>(articles: T[]): T[] {
  return [...articles]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, DIGEST_SIZE);
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character
  );
}

function articleUrl(siteUrl: string, slug: string): string {
  return new URL(`/articles/${encodeURIComponent(slug)}`, siteUrl).toString();
}

export function renderDigestHtml(
  articles: DigestArticle[],
  siteUrl: string,
  unsubscribeUrl?: string
): string {
  const items = digestArticles(articles)
    .map(
      (article) => `
        <li style="margin:0 0 24px">
          <a href="${articleUrl(siteUrl, article.slug)}" style="color:#111827;font-size:18px;font-weight:700;text-decoration:none">
            ${escapeHtml(article.title)}
          </a>
          <p style="color:#6b7280;line-height:1.6;margin:8px 0 0">
            ${escapeHtml(article.summary)}
          </p>
        </li>`
    )
    .join("");

  return `<!doctype html>
<html lang="ko">
  <body style="background:#f9fafb;color:#111827;font-family:Arial,sans-serif;margin:0;padding:32px 16px">
    <main style="background:#fff;margin:0 auto;max-width:640px;padding:32px">
      <p style="color:#7c3aed;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">crit weekly</p>
      <h1 style="font-size:28px;letter-spacing:-.04em;margin:8px 0 12px">이번 주 읽을거리</h1>
      <p style="color:#6b7280;line-height:1.6;margin:0 0 28px">
        이번 주 crit가 고른 아티클을 보내드려요.
      </p>
      <ol style="margin:0;padding-left:24px">${items}</ol>
      <p style="border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;line-height:1.6;margin:32px 0 0;padding-top:20px">
        crit에서 매주 새로운 읽을거리를 받아보세요.
        ${
          unsubscribeUrl
            ? `<br /><a href="${unsubscribeUrl}" style="color:#6b7280">뉴스레터 구독 해지</a>`
            : ""
        }
      </p>
    </main>
  </body>
</html>`;
}
