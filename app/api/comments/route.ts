import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { getArticle } from "@/lib/content";
import { askItems, showItems } from "@/lib/community";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ comments: [], available: false });
  }

  const comments = await prisma.comment.findMany({
    where: { slug },
    orderBy: { createdAt: "asc" },
    select: { id: true, nickname: true, body: true, parentId: true, createdAt: true },
  });

  return NextResponse.json({ comments, available: true });
}

const createCommentSchema = z.object({
  slug: z.string().min(1),
  nickname: z.string().trim().min(1).max(20),
  body: z.string().trim().min(1).max(1000),
  parentId: z.string().trim().min(1).max(64).optional(),
  deviceId: z.string().max(64).optional(),
});

function isCommentTarget(slug: string) {
  if (getArticle(slug)) return true;
  if (slug.startsWith("ask-")) {
    return askItems.some((item) => `ask-${item.slug}` === slug);
  }
  if (slug.startsWith("show-")) {
    return showItems.some((item) => `show-${item.slug}` === slug);
  }
  return false;
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json(
      { error: "댓글 기능은 준비 중이에요." },
      { status: 503 }
    );
  }

  let parsed;
  try {
    parsed = createCommentSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!isCommentTarget(parsed.slug)) {
    return NextResponse.json({ error: "comment target not found" }, { status: 404 });
  }

  if (parsed.parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parsed.parentId, slug: parsed.slug },
      select: { id: true },
    });

    if (!parent) {
      return NextResponse.json({ error: "parent comment not found" }, { status: 404 });
    }
  }

  const comment = await prisma.comment.create({
    data: parsed,
    select: { id: true, nickname: true, body: true, parentId: true, createdAt: true },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
