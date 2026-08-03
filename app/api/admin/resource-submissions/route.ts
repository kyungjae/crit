import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getPrisma } from "@/lib/db";
import {
  submissionStatusSchema,
  updateLinkSubmissionSchema,
} from "@/lib/submissions";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function isLocalRequest(request: Request) {
  const host = request.headers.get("host") ?? "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

function isAuthorized(request: Request) {
  const adminToken = process.env.CRIT_ADMIN_TOKEN;
  if (!adminToken) return isLocalRequest(request);

  const provided =
    request.headers.get("x-crit-admin-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === adminToken;
}

function requireAdmin(request: Request) {
  return isAuthorized(request) ? null : json({ error: "관리자 권한이 필요합니다" }, 401);
}

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const prisma = getPrisma();
  if (!prisma) return json({ error: "리소스 제보 기능은 준비 중이에요." }, 503);

  const requestedStatus = request.nextUrl.searchParams.get("status") ?? "pending";
  const status =
    requestedStatus === "all"
      ? undefined
      : submissionStatusSchema.safeParse(requestedStatus);
  if (status && !status.success) return json({ error: "잘못된 상태 값입니다" }, 400);

  const submissions = await prisma.resourceSubmission.findMany({
    where: status ? { status: status.data } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return json({ submissions });
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const prisma = getPrisma();
  if (!prisma) return json({ error: "리소스 제보 기능은 준비 중이에요." }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "요청 형식이 올바르지 않습니다" }, 400);
  }

  const parsed = updateLinkSubmissionSchema.safeParse(body);
  if (!parsed.success) return json({ error: "상태 변경 내용을 확인해주세요" }, 400);

  try {
    const submission = await prisma.resourceSubmission.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        reviewerNote: parsed.data.reviewerNote,
      },
    });
    return json({ ok: true, submission });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return json({ error: "제보를 찾을 수 없습니다" }, 404);
    }
    throw error;
  }
}
