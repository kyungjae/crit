import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { POST } from "@/app/api/views/route";

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

test("조회 API는 짧은 viewerId를 400으로 거부한다", async () => {
  const response = await withoutDatabase(() =>
    POST(
      new NextRequest("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          slug: "2026-07-30-mobbin-long-onboarding",
          viewerId: "short",
        }),
      })
    )
  );

  assert.equal(response.status, 400);
});

test("조회 API는 존재하지 않는 아티클을 404로 거부한다", async () => {
  const response = await withoutDatabase(() =>
    POST(
      new NextRequest("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          slug: "does-not-exist",
          viewerId: "viewer-12345678",
        }),
      })
    )
  );

  assert.equal(response.status, 404);
});

test("조회 API는 DB가 없으면 503을 반환한다", async () => {
  const response = await withoutDatabase(() =>
    POST(
      new NextRequest("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          slug: "2026-07-30-mobbin-long-onboarding",
          viewerId: "viewer-12345678",
        }),
      })
    )
  );

  assert.equal(response.status, 503);
});
