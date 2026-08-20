import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const adminToken = process.env.CRIT_ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ ok: false, error: "CRIT_ADMIN_TOKEN이 설정되어 있지 않습니다" }, { status: 501 });
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "비밀번호가 필요합니다" }, { status: 400 });
  }

  if (!body.password || body.password !== adminToken) {
    return NextResponse.json({ ok: false, error: "비밀번호가 맞지 않습니다" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("crit-admin-session", adminToken, {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
