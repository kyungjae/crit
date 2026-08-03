import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getArticle } from "@/lib/content";
import { getPrisma } from "@/lib/db";
import {
  createUpvoteStore,
  getUpvoteData,
  toggleUpvote,
} from "@/lib/upvotes";

const slugSchema = z.string().min(1);
const deviceIdSchema = z.string().min(8).max(64);
const upvoteSchema = z.object({
  slug: slugSchema,
  deviceId: deviceIdSchema,
});
const upvoteQuerySchema = z.object({
  slug: slugSchema,
  deviceId: deviceIdSchema.optional(),
});

export async function GET(req: NextRequest) {
  const parsed = upvoteQuerySchema.safeParse({
    slug: req.nextUrl.searchParams.get("slug") ?? undefined,
    deviceId: req.nextUrl.searchParams.get("deviceId") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!getArticle(parsed.data.slug)) {
    return NextResponse.json({ error: "article not found" }, { status: 404 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({
      total: 0,
      hasUpvoted: false,
      available: false,
    });
  }

  const data = await getUpvoteData(
    createUpvoteStore(prisma),
    parsed.data.slug,
    parsed.data.deviceId
  );
  return NextResponse.json({ ...data, available: true });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const parsed = upvoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!getArticle(parsed.data.slug)) {
    return NextResponse.json({ error: "article not found" }, { status: 404 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json(
      { error: "업보트 기능은 준비 중이에요." },
      { status: 503 }
    );
  }

  const data = await toggleUpvote(
    createUpvoteStore(prisma),
    parsed.data.slug,
    parsed.data.deviceId
  );
  return NextResponse.json({ ...data, available: true });
}
