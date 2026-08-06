import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prismaOrThrow, slackRedirectUri } from "@/lib/slack";

export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "SLACK_CLIENT_ID가 설정되지 않았습니다." }, { status: 503 });

  const state = crypto.randomBytes(24).toString("hex");
  const url = new URL("https://slack.com/oauth/v2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "chat:write,chat:write.public,channels:read,groups:read");
  url.searchParams.set("redirect_uri", slackRedirectUri());
  url.searchParams.set("state", state);

  const cookieStore = await cookies();
  cookieStore.set("slack_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return NextResponse.redirect(url);
}

export async function POST() {
  try {
    const prisma = prismaOrThrow();
    const installation = await prisma.slackInstallation.findMany({
      select: { teamId: true, teamName: true, channelName: true, active: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ installations: installation });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "설치 목록을 읽지 못했습니다." }, { status: 503 });
  }
}
