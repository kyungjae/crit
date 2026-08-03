import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { UpvoteButton, isUpvoteData } from "@/components/Upvote";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

test("업보트 버튼은 선택/비선택 상태를 aria-pressed로 표현한다", () => {
  const selectedHtml = renderToStaticMarkup(
    React.createElement(UpvoteButton, { total: 12, hasUpvoted: true })
  );
  const unselectedHtml = renderToStaticMarkup(
    React.createElement(UpvoteButton, { total: 0, hasUpvoted: false })
  );

  assert.match(selectedHtml, /aria-pressed="true"/);
  assert.match(selectedHtml, />업보트 12</);
  assert.match(unselectedHtml, /aria-pressed="false"/);
});

test("isUpvoteData는 유효하지 않은 응답 형태를 거부한다", () => {
  // valid shapes
  assert.equal(isUpvoteData({ total: 0, hasUpvoted: false }), true);
  assert.equal(isUpvoteData({ total: 5, hasUpvoted: true, available: true }), true);
  assert.equal(isUpvoteData({ total: 0, hasUpvoted: false, available: false }), true);

  // missing or wrong-typed fields
  assert.equal(isUpvoteData({ error: "unavailable" }), false);
  assert.equal(isUpvoteData(null), false);
  assert.equal(isUpvoteData(undefined), false);
  assert.equal(isUpvoteData({ total: "0", hasUpvoted: false }), false);
  assert.equal(isUpvoteData({ total: 0 }), false);

  // total must be finite nonnegative integer
  assert.equal(isUpvoteData({ total: -1, hasUpvoted: false }), false);
  assert.equal(isUpvoteData({ total: 1.5, hasUpvoted: false }), false);
  assert.equal(isUpvoteData({ total: Infinity, hasUpvoted: false }), false);
  assert.equal(isUpvoteData({ total: NaN, hasUpvoted: false }), false);

  // available must be absent or boolean
  assert.equal(isUpvoteData({ total: 0, hasUpvoted: false, available: "yes" }), false);
  assert.equal(isUpvoteData({ total: 0, hasUpvoted: false, available: null }), false);
  assert.equal(isUpvoteData({ total: 0, hasUpvoted: false, available: 1 }), false);
});
