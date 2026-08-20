import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import ArticleCard from "@/components/ArticleCard";
import type { Article } from "@/lib/content";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const article: Article = {
  title: "테스트 아티클",
  summary: "테스트 요약",
  category: "design",
  format: "brief",
  tags: [],
  date: "2026-08-02",
  source_url: "https://example.com/article",
  source_name: "Example",
  thumbnail: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  credits: [],
  draft: false,
  author: "crit agent",
  slug: "test-article",
  body: "",
  readingMinutes: 1,
  ruleCount: 0,
};

test("signal 카드 제목 아래에 날짜와 댓글 수만 표시한다", () => {
  const originalNow = Date.now;
  Date.now = () => new Date("2026-08-03T00:00:00Z").getTime();

  try {
    const html = renderToStaticMarkup(
      React.createElement(ArticleCard, {
        article,
        variant: "signal",
        commentCount: 2,
      })
    );

    assert.match(html, />1일 전</);
    assert.match(html, />댓글 2</);
    assert.doesNotMatch(html, /업보트/);
    assert.doesNotMatch(html, /조회/);
    assert.match(html, /data:image\/gif/);
    assert.match(html, /href="\/articles\/test-article#comments"/);
    assert.doesNotMatch(html, />2026년 8월 2일</);
  } finally {
    Date.now = originalNow;
  }
});

test("featured 카드는 불릿 요약을 두 개까지만 표시한다", () => {
  const html = renderToStaticMarkup(
    React.createElement(ArticleCard, {
      article: {
        ...article,
        summary: "• 첫 번째 요약\n• 두 번째 요약\n• 세 번째 요약",
        format: "deep",
      },
      variant: "featured",
    })
  );

  assert.match(html, /첫 번째 요약/);
  assert.match(html, /두 번째 요약/);
  assert.doesNotMatch(html, /세 번째 요약/);
});

test("이미지가 없는 signal 카드는 가짜 썸네일을 렌더링하지 않는다", () => {
  const html = renderToStaticMarkup(
    React.createElement(ArticleCard, {
      article: { ...article, thumbnail: undefined },
      variant: "signal",
    })
  );

  assert.doesNotMatch(html, /<img/);
  assert.doesNotMatch(html, /radial-gradient/);
  assert.match(html, /테스트 아티클/);
});
