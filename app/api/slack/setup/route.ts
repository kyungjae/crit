import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptSlackToken, prismaOrThrow, slackApi } from "@/lib/slack";

type Conversation = { id: string; name: string; is_private?: boolean; is_member?: boolean };
type ConversationsResponse = { channels?: Conversation[]; response_metadata?: { next_cursor?: string } };

async function installationFromCookie() {
  const id = (await cookies()).get("slack_install_id")?.value;
  if (!id) throw new Error("Slack 설치 세션이 없습니다.");
  const prisma = prismaOrThrow();
  const installation = await prisma.slackInstallation.findUnique({ where: { id } });
  if (!installation) throw new Error("Slack 설치 정보를 찾지 못했습니다.");
  return { prisma, installation };
}

export async function GET() {
  try {
    const { installation } = await installationFromCookie();
    const result = await slackApi<ConversationsResponse>(decryptSlackToken(installation.botTokenEncrypted), "conversations.list", {
      types: "public_channel,private_channel",
      limit: "200",
      exclude_archived: "true",
    });
    return NextResponse.json({
      teamName: installation.teamName,
      selected: installation.channelId,
      channels: (result.channels ?? []).filter((channel) => !channel.is_private || channel.is_member),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "채널 목록을 읽지 못했습니다." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { prisma, installation } = await installationFromCookie();
    const body = (await request.json()) as { channelId?: string; channelName?: string };
    if (!body.channelId || !body.channelName) return NextResponse.json({ error: "채널을 선택해주세요." }, { status: 400 });
    await prisma.slackInstallation.update({
      where: { id: installation.id },
      data: { channelId: body.channelId, channelName: body.channelName },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "채널을 저장하지 못했습니다." }, { status: 400 });
  }
}
