import { Prisma, type PrismaClient } from "@prisma/client";

type ViewRecord = {
  slug: string;
  viewerId: string;
};

export type ViewStore = {
  create(args: { data: ViewRecord }): Promise<unknown>;
  count(args: { where: { slug: string } }): Promise<number>;
  groupBy(args: {
    by: ["slug"];
    where: { slug: { in: string[] } };
    _count: { slug: true };
  }): Promise<Array<{ slug: string; _count: { slug: number } }>>;
  isDuplicateError(error: unknown): boolean;
};

export function createViewStore(prisma: PrismaClient): ViewStore {
  const groupBySlug = (where: { slug: { in: string[] } }) =>
    prisma.articleView.groupBy({
      by: ["slug"],
      where,
      _count: { slug: true },
    });

  return {
    create: (args) => prisma.articleView.create(args),
    count: (args) => prisma.articleView.count(args),
    groupBy: ({ where }) => groupBySlug(where),
    isDuplicateError: (error) =>
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002",
  };
}

export async function recordView(
  store: ViewStore,
  slug: string,
  viewerId: string
): Promise<number> {
  try {
    await store.create({ data: { slug, viewerId } });
  } catch (error) {
    if (!store.isDuplicateError(error)) throw error;
  }

  return store.count({ where: { slug } });
}

export async function getViewCounts(
  store: ViewStore,
  slugs: string[]
): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};

  const counts = await store.groupBy({
    by: ["slug"],
    where: { slug: { in: slugs } },
    _count: { slug: true },
  });

  return Object.fromEntries(
    counts.map(({ slug, _count }) => [slug, _count.slug])
  );
}
