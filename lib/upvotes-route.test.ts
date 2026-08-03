import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/upvotes/route";

async function withoutDatabase<T>(operation: () => Promise<T>): Promise<T> {
  const databaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    return await operation();
  } finally {
    if (databaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = databaseUrl;
    }
  }
}

test("GET은 유효하지 않은 deviceId를 DB 없이도 400으로 거부한다", async () => {
  const response = await withoutDatabase(() =>
    GET(
      new NextRequest(
        "http://localhost/api/upvotes?slug=2026-07-30-mobbin-long-onboarding&deviceId=short"
      )
    )
  );

  assert.equal(response.status, 400);
});

test("GET은 존재하지 않는 글을 DB 없이도 404로 응답한다", async () => {
  const response = await withoutDatabase(() =>
    GET(
      new NextRequest(
        "http://localhost/api/upvotes?slug=does-not-exist&deviceId=device-123"
      )
    )
  );

  assert.equal(response.status, 404);
});
