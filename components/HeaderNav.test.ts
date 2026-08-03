import assert from "node:assert/strict";
import test from "node:test";

import { isNavItemActive } from "./HeaderNav";

test("홈과 아티클 경로에서는 피드 메뉴를 활성화한다", () => {
  assert.equal(isNavItemActive("/", "/"), true);
  assert.equal(isNavItemActive("/articles/example", "/"), true);
});

test("다른 섹션 경로에서는 해당 메뉴만 활성화한다", () => {
  assert.equal(isNavItemActive("/ask/example", "/ask"), true);
  assert.equal(isNavItemActive("/ask/example", "/show"), false);
});
