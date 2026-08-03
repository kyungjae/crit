import { z } from "zod";

import { getArticle } from "@/lib/content";
import { getPrisma } from "@/lib/db";
import { createViewStore, recordView } from "@/lib/views";

export const runtime = "nodejs";

const viewSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  viewerId: z.string().trim().min(8).max(64),
});

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "요청 형식이 올바르지 않습니다" }, 400);
  }

  const parsed = viewSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "조회 정보를 확인해주세요" }, 400);
  }

  if (!getArticle(parsed.data.slug)) {
    return json({ error: "아티클을 찾을 수 없습니다" }, 404);
  }

  const prisma = getPrisma();
  if (!prisma) return json({ error: "조회 수 집계는 준비 중이에요." }, 503);

  try {
    const count = await recordView(
      createViewStore(prisma),
      parsed.data.slug,
      parsed.data.viewerId
    );
    return json({ ok: true, count });
  } catch {
    return json({ error: "조회 수를 저장하지 못했습니다" }, 500);
  }
}
