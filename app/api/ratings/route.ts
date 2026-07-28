import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getArticle } from "@/lib/content";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const deviceId = req.nextUrl.searchParams.get("deviceId");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const [agg, mine] = await Promise.all([
    prisma.rating.aggregate({
      where: { slug },
      _avg: { score: true },
      _count: true,
    }),
    deviceId
      ? prisma.rating.findUnique({
          where: { slug_deviceId: { slug, deviceId } },
          select: { score: true },
        })
      : Promise.resolve(null),
  ]);

  return NextResponse.json({
    average: agg._avg.score ? Math.round(agg._avg.score * 10) / 10 : null,
    count: agg._count,
    myScore: mine?.score ?? null,
  });
}

const rateSchema = z.object({
  slug: z.string().min(1),
  deviceId: z.string().min(8).max(64),
  score: z.number().int().min(1).max(5),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = rateSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!getArticle(parsed.slug)) {
    return NextResponse.json({ error: "article not found" }, { status: 404 });
  }

  const { slug, deviceId, score } = parsed;
  await prisma.rating.upsert({
    where: { slug_deviceId: { slug, deviceId } },
    create: { slug, deviceId, score },
    update: { score },
  });

  const agg = await prisma.rating.aggregate({
    where: { slug },
    _avg: { score: true },
    _count: true,
  });

  return NextResponse.json({
    average: agg._avg.score ? Math.round(agg._avg.score * 10) / 10 : null,
    count: agg._count,
    myScore: score,
  });
}
