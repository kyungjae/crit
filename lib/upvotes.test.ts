import assert from "node:assert/strict";
import test from "node:test";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  createUpvoteStore,
  getUpvoteData,
  toggleUpvote,
} from "./upvotes";

type StoredVote = { id: string; slug: string; deviceId: string };

function createStore(initial: StoredVote[] = []) {
  const votes = [...initial];
  const operations = {
    count: async ({ where }: { where: { slug: string } }) =>
      votes.filter((vote) => vote.slug === where.slug).length,
    findUnique: async ({
      where,
    }: {
      where: { slug_deviceId: { slug: string; deviceId: string } };
    }) =>
      votes.find(
        (vote) =>
          vote.slug === where.slug_deviceId.slug &&
          vote.deviceId === where.slug_deviceId.deviceId
      ) ?? null,
    create: async ({ data }: { data: { slug: string; deviceId: string } }) => {
      const vote = { id: String(votes.length + 1), ...data };
      votes.push(vote);
      return vote;
    },
    delete: async ({
      where,
    }: {
      where: { slug_deviceId: { slug: string; deviceId: string } };
    }) => {
      const index = votes.findIndex(
        (vote) =>
          vote.slug === where.slug_deviceId.slug &&
          vote.deviceId === where.slug_deviceId.deviceId
      );
      return votes.splice(index, 1)[0];
    },
    groupBy: async () => [],
  };
  let transactionTail = Promise.resolve();

  return {
    ...operations,
    runSerializableTransaction: async <T>(
      operation: (store: typeof operations) => Promise<T>
    ) => {
      const previous = transactionTail;
      let release: () => void = () => undefined;
      transactionTail = new Promise<void>((resolve) => {
        release = resolve;
      });
      await previous;
      try {
        return await operation(operations);
      } finally {
        release();
      }
    },
    isTransactionConflict: () => false,
  };
}

const prisma = new PrismaClient();
const isPrismaTransactionConflict =
  createUpvoteStore(prisma).isTransactionConflict;
test.after(() => prisma.$disconnect());

function createKnownPrismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("transaction failed", {
    code,
    clientVersion: Prisma.prismaVersion.client,
    meta: { modelName: "Upvote", target: ["slug", "deviceId"] },
  });
}

test("기존 score와 무관하게 기기별 행을 한 표로 센다", async () => {
  const store = createStore([
    { id: "1", slug: "article", deviceId: "device-a" },
    { id: "2", slug: "article", deviceId: "device-b" },
  ]);

  assert.deepEqual(await getUpvoteData(store, "article", "device-a"), {
    total: 2,
    hasUpvoted: true,
  });
});

test("업보트를 생성한 뒤 다시 토글하면 취소한다", async () => {
  const store = createStore();

  assert.deepEqual(await toggleUpvote(store, "article", "device-a"), {
    total: 1,
    hasUpvoted: true,
  });
  assert.deepEqual(await toggleUpvote(store, "article", "device-a"), {
    total: 0,
    hasUpvoted: false,
  });
});

test("동시 토글은 오류 없이 결정적인 최종 상태를 만든다", async () => {
  const store = createStore();

  const results = await Promise.all([
    toggleUpvote(store, "article", "device-a"),
    toggleUpvote(store, "article", "device-a"),
  ]);

  assert.equal(results.length, 2);
  assert.deepEqual(await getUpvoteData(store, "article", "device-a"), {
    total: 0,
    hasUpvoted: false,
  });
});

test("첫 P2002 충돌 뒤 재시도해 업보트를 생성한다", async () => {
  const baseStore = createStore();
  let attempts = 0;
  const conflict = createKnownPrismaError("P2002");
  const store = {
    ...baseStore,
    runSerializableTransaction: async <T>(
      operation: Parameters<
        typeof baseStore.runSerializableTransaction<T>
      >[0]
    ): Promise<T> => {
      attempts += 1;
      if (attempts === 1) throw conflict;
      return baseStore.runSerializableTransaction(operation);
    },
    isTransactionConflict: isPrismaTransactionConflict,
  };

  assert.deepEqual(await toggleUpvote(store, "article", "device-a"), {
    total: 1,
    hasUpvoted: true,
  });
  assert.equal(attempts, 2);
  assert.deepEqual(await getUpvoteData(store, "article", "device-a"), {
    total: 1,
    hasUpvoted: true,
  });
});

test("직렬화 충돌 재시도 횟수는 제한된다", async () => {
  const baseStore = createStore();
  let attempts = 0;
  const conflict = createKnownPrismaError("P2034");
  const store = {
    ...baseStore,
    runSerializableTransaction: async <T>(
      _operation: Parameters<
        typeof baseStore.runSerializableTransaction<T>
      >[0]
    ): Promise<T> => {
      attempts += 1;
      throw conflict;
    },
    isTransactionConflict: isPrismaTransactionConflict,
  };

  await assert.rejects(toggleUpvote(store, "article", "device-a"), {
    code: "P2034",
  });
  assert.equal(attempts, 3);
});

test("예상하지 않은 오류는 재시도하지 않고 전파한다", async () => {
  const baseStore = createStore();
  let attempts = 0;
  const unexpected = new Error("unexpected");
  const store = {
    ...baseStore,
    runSerializableTransaction: async <T>(
      _operation: Parameters<
        typeof baseStore.runSerializableTransaction<T>
      >[0]
    ): Promise<T> => {
      attempts += 1;
      throw unexpected;
    },
    isTransactionConflict: isPrismaTransactionConflict,
  };

  await assert.rejects(
    toggleUpvote(store, "article", "device-a"),
    (error: unknown) => error === unexpected
  );
  assert.equal(attempts, 1);
});
