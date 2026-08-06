import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encryptSlackToken, prismaOrThrow, slackRedirectUri } from "@/lib/slack";

type OAuthResponse = {
  ok: boolean;
  access_token?: string;
  team?: { id: string; name?: string };
  error?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("slack_oauth_state")?.value;
  cookieStore.delete("slack_oauth_state");

  if (error) return NextResponse.redirect(new URL(`/slack?error=${encodeURIComponent(error)}`, url));
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: "Slack OAuth state가 유효하지 않습니다." }, { status: 400 });
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json({ error: "Slack OAuth 환경변수가 설정되지 않았습니다." }, { status: 503 });

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: slackRedirectUri(),
    }),
  });
  const oauth = (await response.json()) as OAuthResponse;
  if (!response.ok || !oauth.ok || !oauth.access_token || !oauth.team?.id) {
    return NextResponse.json({ error: `Slack OAuth 실패: ${oauth.error ?? response.status}` }, { status: 502 });
  }

  try {
    const prisma = prismaOrThrow();
    const installation = await prisma.slackInstallation.upsert({
      where: { teamId: oauth.team.id },
      create: {
        teamId: oauth.team.id,
        teamName: oauth.team.name,
        botTokenEncrypted: encryptSlackToken(oauth.access_token),
      },
      update: {
        teamName: oauth.team.name,
        botTokenEncrypted: encryptSlackToken(oauth.access_token),
        active: true,
      },
    });

    cookieStore.set("slack_install_id", installation.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1800,
      path: "/",
    });
    return NextResponse.redirect(new URL("/slack/setup", url));
  } catch (installationError) {
    return NextResponse.json({ error: installationError instanceof Error ? installationError.message : "설치를 저장하지 못했습니다." }, { status: 503 });
  }
}
