import assert from "node:assert/strict";
import test from "node:test";

import {
  createLinkSubmissionSchema,
  createResourceSubmissionSchema,
  normalizeSubmissionUrl,
  RESOURCE_CATEGORIES,
  SUBMISSION_REASONS,
  SUBMISSION_STATUSES,
} from "./submissions";

test("제보 URL은 hash를 제거해 중복 비교 가능한 형태로 정규화한다", () => {
  assert.equal(
    normalizeSubmissionUrl(" https://example.com/article#comments "),
    "https://example.com/article"
  );
});

test("제보 입력은 URL과 추천 이유를 검증한다", () => {
  const result = createLinkSubmissionSchema.safeParse({
    url: "javascript:alert(1)",
    note: "좋은 글입니다.",
  });

  assert.equal(result.success, false);
});

test("선택 입력의 빈 문자열은 undefined로 정리한다", () => {
  const result = createLinkSubmissionSchema.parse({
    url: "https://example.com/article",
    note: "실무에 도움이 되는 글입니다.",
    category: "",
    submitterName: "",
    submitterEmail: "",
  });

  assert.equal(result.category, undefined);
  assert.equal(result.submitterName, undefined);
  assert.equal(result.submitterEmail, undefined);
});

test("선택한 추천 이유를 검수용 note 문장으로 변환한다", () => {
  const result = createLinkSubmissionSchema.parse({
    url: "https://example.com/article",
    reasons: ["practical", "perspective"],
  });

  assert.equal(result.note, "실무에 바로 적용할 수 있어요 · 새로운 관점을 얻을 수 있어요");
});

test("제보 상태는 검수 흐름에 필요한 값만 허용한다", () => {
  assert.deepEqual(SUBMISSION_STATUSES, [
    "pending",
    "reviewed",
    "rejected",
    "published",
  ]);
});

test("추천 이유 목록은 비어 있지 않다", () => {
  assert.ok(SUBMISSION_REASONS.length >= 3);
});

test("리소스 제보는 이름, 설명, 리소스 카테고리를 별도로 검증한다", () => {
  const result = createResourceSubmissionSchema.parse({
    url: "https://example.com/tool",
    name: "Example Tool",
    description: "디자이너가 빠르게 참고할 수 있는 리소스입니다.",
    category: "ai-tools",
  });

  assert.equal(result.category, "ai-tools");
  assert.equal(result.name, "Example Tool");
});

test("리소스 카테고리 목록은 링크 페이지 분류와 일치한다", () => {
  assert.deepEqual(RESOURCE_CATEGORIES, [
    "reference",
    "fonts",
    "color",
    "icons",
    "photo-mockup",
    "ai-tools",
    "ux-research",
  ]);
});
