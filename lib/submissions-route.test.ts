import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { POST } from "@/app/api/submissions/route";
import { POST as POST_RESOURCE } from "@/app/api/resource-submissions/route";
import { GET as GET_ADMIN } from "@/app/api/admin/submissions/route";
import { GET as GET_ADMIN_RESOURCE } from "@/app/api/admin/resource-submissions/route";

async function withoutDatabase<T>(operation: () => Promise<T>): Promise<T> {
  const databaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    return await operation();
  } finally {
    if (databaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = databaseUrl;
  }
}

test("제보 API는 잘못된 URL을 DB 조회 전에 400으로 거부한다", async () => {
  const response = await withoutDatabase(() =>
    POST(
      new NextRequest("http://localhost/api/submissions", {
        method: "POST",
        body: JSON.stringify({
          url: "javascript:alert(1)",
          note: "추천 이유를 충분히 입력했습니다.",
        }),
      })
    )
  );

  assert.equal(response.status, 400);
});

test("제보 API는 DB가 없으면 503을 반환한다", async () => {
  const response = await withoutDatabase(() =>
    POST(
      new NextRequest("http://localhost/api/submissions", {
        method: "POST",
        body: JSON.stringify({
          url: "https://example.com/article",
          note: "추천 이유를 충분히 입력했습니다.",
        }),
      })
    )
  );

  assert.equal(response.status, 503);
});

test("관리자 제보 목록은 토큰 없이 401을 반환한다", async () => {
  const previousToken = process.env.CRIT_ADMIN_TOKEN;
  process.env.CRIT_ADMIN_TOKEN = "test-admin-token";
  try {
    const response = await GET_ADMIN(
      new NextRequest("https://example.com/api/admin/submissions")
    );
    assert.equal(response.status, 401);
  } finally {
    if (previousToken === undefined) delete process.env.CRIT_ADMIN_TOKEN;
    else process.env.CRIT_ADMIN_TOKEN = previousToken;
  }
});

test("리소스 제보 API는 DB가 없으면 503을 반환한다", async () => {
  const response = await withoutDatabase(() =>
    POST_RESOURCE(
      new NextRequest("http://localhost/api/resource-submissions", {
        method: "POST",
        body: JSON.stringify({
          url: "https://example.com/tool",
          name: "Example Tool",
          description: "디자이너가 사용할 수 있는 리소스입니다.",
          category: "ai-tools",
        }),
      })
    )
  );

  assert.equal(response.status, 503);
});

test("관리자 리소스 제보 목록은 토큰 없이 401을 반환한다", async () => {
  const previousToken = process.env.CRIT_ADMIN_TOKEN;
  process.env.CRIT_ADMIN_TOKEN = "test-admin-token";
  try {
    const response = await GET_ADMIN_RESOURCE(
      new NextRequest("https://example.com/api/admin/resource-submissions")
    );
    assert.equal(response.status, 401);
  } finally {
    if (previousToken === undefined) delete process.env.CRIT_ADMIN_TOKEN;
    else process.env.CRIT_ADMIN_TOKEN = previousToken;
  }
});
