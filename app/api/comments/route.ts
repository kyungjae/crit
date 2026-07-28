import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getArticle } from "@/lib/content";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { slug },
    orderBy: { createdAt: "asc" },
    select: { id: true, nickname: true, body: true, createdAt: true },
  });

  return NextResponse.json({ comments });
}

const createCommentSchema = z.object({
  slug: z.string().min(1),
  nickname: z.string().trim().min(1).max(20),
  body: z.string().trim().min(1).max(1000),
  deviceId: z.string().max(64).optional(),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = createCommentSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!getArticle(parsed.slug)) {
    return NextResponse.json({ error: "article not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: parsed,
    select: { id: true, nickname: true, body: true, createdAt: true },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
