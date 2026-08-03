import assert from "node:assert/strict";
import test from "node:test";

import {
  createNewsletterToken,
  digestArticles,
  hashNewsletterToken,
  newsletterSubscribeSchema,
  renderDigestHtml,
} from "./newsletter";

test("뉴스레터 구독은 유효한 이메일과 명시적 동의를 요구한다", () => {
  assert.equal(
    newsletterSubscribeSchema.safeParse({
      email: "reader@example.com",
      consent: true,
    }).success,
    true
  );
  assert.equal(
    newsletterSubscribeSchema.safeParse({
      email: "reader@example.com",
      consent: false,
    }).success,
    false
  );
});

test("뉴스레터 토큰은 원문을 저장하지 않고 해시로 비교할 수 있다", () => {
  const token = createNewsletterToken();

  assert.equal(token.length, 64);
  assert.equal(hashNewsletterToken(token), hashNewsletterToken(token));
  assert.notEqual(hashNewsletterToken(token), token);
});

test("다이제스트는 최신 아티클을 최대 10개로 제한한다", () => {
  const articles = Array.from({ length: 12 }, (_, index) => ({
    slug: `article-${index}`,
    title: `Article ${index}`,
    summary: "Summary",
    date: `2026-08-${String(12 - index).padStart(2, "0")}`,
  }));

  assert.deepEqual(
    digestArticles(articles).map((article) => article.slug),
    Array.from({ length: 10 }, (_, index) => `article-${index}`)
  );
});

test("다이제스트 HTML은 아티클 링크와 이스케이프된 제목을 포함한다", () => {
  const html = renderDigestHtml(
    [
      {
        slug: "design-systems",
        title: "A <strong>useful</strong> article",
        summary: "A practical summary.",
        date: "2026-08-03",
      },
    ],
    "https://crit.example.com"
  );

  assert.match(html, /https:\/\/crit\.example\.com\/articles\/design-systems/);
  assert.match(html, /A &lt;strong&gt;useful&lt;\/strong&gt; article/);
  assert.doesNotMatch(html, /<strong>useful<\/strong>/);
});
