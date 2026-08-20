import crypto from "node:crypto";
import { getPrisma } from "@/lib/db";

const ALGORITHM = "aes-256-gcm";

function encryptionKey(): Buffer {
  const raw = process.env.SLACK_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("SLACK_TOKEN_ENCRYPTION_KEY 환경변수가 필요합니다.");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("SLACK_TOKEN_ENCRYPTION_KEY는 32바이트 base64 값이어야 합니다.");
  return key;
}

export function encryptSlackToken(token: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((value) => value.toString("base64")).join(".");
}

export function decryptSlackToken(value: string): string {
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("Slack 토큰 형식이 올바르지 않습니다.");
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(ivValue, "base64"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function siteUrl(): string {
  return (process.env.CRIT_SITE_URL ?? "https://crit.day").replace(/\/$/, "");
}

export function slackRedirectUri(): string {
  return process.env.SLACK_REDIRECT_URI ?? `${siteUrl()}/api/slack/oauth/callback`;
}

export function prismaOrThrow() {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Slack 봇 설치에는 DATABASE_URL이 필요합니다.");
  return prisma;
}

export async function slackApi<T>(token: string, method: string, body?: Record<string, string>): Promise<T> {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: body ? "POST" : "GET",
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    body: body ? new URLSearchParams(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Slack API HTTP ${response.status}`);
  const result = (await response.json()) as T & { ok?: boolean; error?: string };
  if (result.ok === false) throw new Error(`Slack API ${result.error ?? "unknown_error"}`);
  return result;
}
