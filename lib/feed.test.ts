import assert from "node:assert/strict";
import test from "node:test";

import type { Article } from "@/lib/content";
import {
  buildFeedHref,
  parseFeedSort,
  sortArticles,
} from "@/lib/feed";

const baseArticle: Article = {
  title: "테스트 아티클",
  summary: "테스트 요약",
  category: "design",
  format: "brief",
  tags: [],
  date: "2026-08-02",
  source_url: "https://example.com/article",
  source_name: "Example",
  credits: [],
  draft: false,
  author: "crit agent",
  slug: "base",
  body: "",
  readingMinutes: 1,
  ruleCount: 0,
};

const olderPopular: Article = {
  ...baseArticle,
  slug: "old",
  date: "2026-08-01",
};
const newerQuiet: Article = {
  ...baseArticle,
  slug: "new",
  date: "2026-08-02",
};

test("parseFeedSort는 popular만 인기순으로 해석한다", () => {
  assert.equal(parseFeedSort("popular"), "popular");
  assert.equal(parseFeedSort("latest"), "latest");
  assert.equal(parseFeedSort("unknown"), "latest");
  assert.equal(parseFeedSort(), "latest");
});

test("latest 정렬은 저장소 순서를 유지한 새 배열을 반환한다", () => {
  const articles = [olderPopular, newerQuiet];

  const sorted = sortArticles(articles, { old: 5, new: 1 }, "latest");

  assert.deepEqual(
    sorted.map((article) => article.slug),
    ["old", "new"]
  );
  assert.notStrictEqual(sorted, articles);
});

test("popular 정렬은 전체 업보트 수가 많은 글을 먼저 반환한다", () => {
  assert.deepEqual(
    sortArticles(
      [olderPopular, newerQuiet],
      { old: 5, new: 1 },
      "popular"
    ).map((article) => article.slug),
    ["old", "new"]
  );
});

test("popular 정렬은 업보트 동률일 때 최신 글을 먼저 반환한다", () => {
  assert.deepEqual(
    sortArticles(
      [olderPopular, newerQuiet],
      { old: 1, new: 1 },
      "popular"
    ).map((article) => article.slug),
    ["new", "old"]
  );
});

test("popular 정렬은 업보트와 날짜가 같으면 입력 순서를 유지한다", () => {
  const first = { ...baseArticle, slug: "first" };
  const second = { ...baseArticle, slug: "second" };

  assert.deepEqual(
    sortArticles(
      [first, second],
      { first: 1, second: 1 },
      "popular"
    ).map((article) => article.slug),
    ["first", "second"]
  );
});

test("buildFeedHref는 popular 정렬만 쿼리로 남긴다", () => {
  assert.equal(buildFeedHref({ sort: "popular" }), "/?sort=popular");
  assert.equal(buildFeedHref({ sort: "latest" }), "/");
});
