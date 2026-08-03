import assert from "node:assert/strict";
import test from "node:test";

import { getViewCounts, recordView, type ViewStore } from "./views";

function createMemoryStore() {
  const records: Array<{ slug: string; viewerId: string }> = [];
  const duplicateError = new Error("duplicate");

  const store: ViewStore = {
    create: async ({ data }) => {
      if (
        records.some(
          (record) =>
            record.slug === data.slug && record.viewerId === data.viewerId
        )
      ) {
        throw duplicateError;
      }
      records.push(data);
    },
    count: async ({ where }) =>
      records.filter((record) => record.slug === where.slug).length,
    groupBy: async ({ where }) =>
      where.slug.in.flatMap((slug) => {
        const count = records.filter((record) => record.slug === slug).length;
        return count > 0 ? [{ slug, _count: { slug: count } }] : [];
      }),
    isDuplicateError: (error) => error === duplicateError,
  };

  return store;
}

test("같은 기기의 같은 아티클 조회는 한 번만 집계한다", async () => {
  const store = createMemoryStore();

  await recordView(store, "article", "viewer-a");
  await recordView(store, "article", "viewer-a");

  assert.equal(await store.count({ where: { slug: "article" } }), 1);
});

test("다른 기기의 조회는 같은 아티클에 별도로 집계한다", async () => {
  const store = createMemoryStore();

  await recordView(store, "article", "viewer-a");
  const count = await recordView(store, "article", "viewer-b");

  assert.equal(count, 2);
});

test("피드용 조회 수는 아티클별로 반환한다", async () => {
  const store = createMemoryStore();
  await recordView(store, "article-a", "viewer-a");
  await recordView(store, "article-b", "viewer-a");

  assert.deepEqual(
    await getViewCounts(store, ["article-a", "article-b", "missing"]),
    { "article-a": 1, "article-b": 1 }
  );
});
