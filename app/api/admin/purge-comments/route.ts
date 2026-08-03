import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const maintenanceToken = process.env.CRIT_MAINTENANCE_TOKEN;
  const provided = request.headers.get("x-crit-maintenance-token");

  if (!maintenanceToken || !provided || provided !== maintenanceToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }

  const result = await prisma.comment.deleteMany({ where: { slug } });
  return NextResponse.json({ slug, deleted: result.count });
}
