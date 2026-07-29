import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { getArticle } from "@/lib/content";

async function getClapData(slug: string, deviceId?: string) {
  const prisma = getPrisma();
  if (!prisma) {
    return {
      total: 0,
      count: 0,
      myClaps: 0,
      available: false,
    };
  }

  const [agg, mine] = await Promise.all([
    prisma.rating.aggregate({
      where: { slug },
      _sum: { score: true },
      _count: true,
    }),
    deviceId
      ? prisma.rating.findUnique({
          where: { slug_deviceId: { slug, deviceId } },
          select: { score: true },
        })
      : Promise.resolve(null),
  ]);

  return {
    total: agg._sum.score ?? 0,
    count: agg._count,
    myClaps: mine?.score ?? 0,
    available: true,
  };
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const deviceId = req.nextUrl.searchParams.get("deviceId") ?? undefined;
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  return NextResponse.json(await getClapData(slug, deviceId));
}

const clapSchema = z.object({
  slug: z.string().min(1),
  deviceId: z.string().min(8).max(64),
});

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json(
      { error: "반응 기능은 준비 중이에요." },
      { status: 503 }
    );
  }

  let parsed;
  try {
    parsed = clapSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!getArticle(parsed.slug)) {
    return NextResponse.json({ error: "article not found" }, { status: 404 });
  }

  const { slug, deviceId } = parsed;

  await prisma.rating.upsert({
    where: { slug_deviceId: { slug, deviceId } },
    create: { slug, deviceId, score: 1 },
    update: { score: { increment: 1 } },
  });

  return NextResponse.json(await getClapData(slug, deviceId));
}
