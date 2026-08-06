import { Prisma, type PrismaClient } from "@prisma/client";

export type UpvoteData = {
  total: number;
  hasUpvoted: boolean;
};

type UpvoteReadStore = {
  count(args: { where: { slug: string } }): Promise<number>;
  findUnique(args: {
    where: { slug_deviceId: { slug: string; deviceId: string } };
  }): Promise<{ id: string } | null>;
};

type UpvoteTransactionStore = UpvoteReadStore & {
  create(args: {
    data: { slug: string; deviceId: string };
  }): Promise<unknown>;
  delete(args: {
    where: { slug_deviceId: { slug: string; deviceId: string } };
  }): Promise<unknown>;
};

export type UpvoteStore = UpvoteTransactionStore & {
  groupBy(args: {
    by: ["slug"];
    where: { slug: { in: string[] } };
    _count: { slug: true };
  }): Promise<Array<{ slug: string; _count: { slug: number } }>>;
  runSerializableTransaction<T>(
    operation: (store: UpvoteTransactionStore) => Promise<T>
  ): Promise<T>;
  isTransactionConflict(error: unknown): boolean;
};

export function createUpvoteStore(prisma: PrismaClient): UpvoteStore {
  const groupBySlug = (where: { slug: { in: string[] } }) =>
    prisma.upvote.groupBy({
      by: ["slug"],
      where,
      _count: { slug: true },
    });

  return {
    count: (args) => prisma.upvote.count(args),
    findUnique: (args) => prisma.upvote.findUnique(args),
    create: (args) => prisma.upvote.create(args),
    delete: (args) => prisma.upvote.delete(args),
    groupBy: ({ where }) => groupBySlug(where),
    runSerializableTransaction: (operation) =>
      prisma.$transaction(
        (transaction) =>
          operation({
            count: (args) => transaction.upvote.count(args),
            findUnique: (args) => transaction.upvote.findUnique(args),
            create: (args) => transaction.upvote.create(args),
            delete: (args) => transaction.upvote.delete(args),
          }),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      ),
    isTransactionConflict: (error) =>
      error instanceof Prisma.PrismaClientKnownRequestError &&
      // P2002 target metadata is provider-dependent. In this transaction the
      // only unique write is the same-key upvote create, so retrying it is safe.
      (error.code === "P2034" || error.code === "P2002"),
  };
}

export async function getUpvoteData(
  store: UpvoteReadStore,
  slug: string,
  deviceId?: string
): Promise<UpvoteData> {
  const [total, vote] = await Promise.all([
    store.count({ where: { slug } }),
    deviceId
      ? store.findUnique({
          where: { slug_deviceId: { slug, deviceId } },
        })
      : Promise.resolve(null),
  ]);

  return {
    total,
    hasUpvoted: vote !== null,
  };
}

export async function toggleUpvote(
  store: UpvoteStore,
  slug: string,
  deviceId: string
): Promise<UpvoteData> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await store.runSerializableTransaction(async (transaction) => {
        const where = { slug_deviceId: { slug, deviceId } };
        const existing = await transaction.findUnique({ where });
        if (existing) {
          await transaction.delete({ where });
        } else {
          await transaction.create({ data: { slug, deviceId } });
        }
        return getUpvoteData(transaction, slug, deviceId);
      });
    } catch (error) {
      if (!store.isTransactionConflict(error) || attempt === maxAttempts) {
        throw error;
      }
    }
  }
  throw new Error("unreachable");
}

export async function getUpvoteCounts(
  store: UpvoteStore,
  slugs: string[]
): Promise<Record<string, number>> {
  const counts = await store.groupBy({
    by: ["slug"],
    where: { slug: { in: slugs } },
    _count: { slug: true },
  });

  return Object.fromEntries(
    counts.map(({ slug, _count }) => [slug, _count.slug])
  );
}
