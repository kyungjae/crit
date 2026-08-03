import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getPrisma } from "@/lib/db";
import { createLinkSubmissionSchema } from "@/lib/submissions";

export const runtime = "nodejs";

function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return response({ error: "요청 형식이 올바르지 않습니다" }, 400);
  }

  const honeypot = (body as { website?: unknown } | null)?.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return response({ ok: true }, 202);
  }

  const parsed = createLinkSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return response(
      { error: "입력 내용을 확인해주세요", fields: parsed.error.flatten().fieldErrors },
      400
    );
  }

  const prisma = getPrisma();
  if (!prisma) {
    return response({ error: "링크 제보 기능은 준비 중이에요." }, 503);
  }

  try {
    const submission = await prisma.linkSubmission.create({
      data: parsed.data,
      select: { id: true, status: true, createdAt: true },
    });
    return response({ ok: true, submission }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return response({ error: "이미 접수된 링크입니다" }, 409);
    }
    throw error;
  }
}
