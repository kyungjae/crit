import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type DeleteBody = {
  slug?: string;
  token?: string;
};

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
const DEFAULT_BRANCH = "claude/designer-news-curation-1lieqg";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function isLocalRequest(request: Request) {
  const host = request.headers.get("host") ?? "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

function assertAuthorized(request: Request, body: DeleteBody) {
  const adminToken = process.env.CRIT_ADMIN_TOKEN;
  const isLocal = isLocalRequest(request);

  if (!adminToken) {
    if (isLocal) return { ok: true as const };
    return {
      ok: false as const,
      status: 501,
      error: "라이브 삭제에는 CRIT_ADMIN_TOKEN 환경변수가 필요합니다",
    };
  }

  const sessionCookie = request.headers.get("cookie")?.match(/(?:^|;\s*)crit-admin-session=([^;]+)/)?.[1];
  const provided =
    request.headers.get("x-crit-admin-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    (sessionCookie ? decodeURIComponent(sessionCookie) : undefined) ??
    body.token;

  if (provided && provided === adminToken) return { ok: true as const };
  return { ok: false as const, status: 401, error: "삭제 키가 필요합니다" };
}

function safeSlug(slug: string) {
  if (!/^[0-9a-z-]+$/.test(slug)) throw new Error("잘못된 slug입니다");
  return slug;
}

function assertDraft(raw: string) {
  const parsed = matter(raw);
  if (parsed.data.draft !== true) {
    throw new Error("초안이 아니어서 삭제할 수 없습니다");
  }
}

function deleteLocally(slug: string) {
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) throw new Error("초안 파일을 찾을 수 없습니다");
  assertDraft(fs.readFileSync(file, "utf8"));
  fs.unlinkSync(file);
  return { method: "local" as const };
}

async function githubRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.CRIT_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) throw new Error("CRIT_GITHUB_TOKEN 또는 GITHUB_TOKEN이 설정되어 있지 않습니다");

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) throw new Error(data.message ?? `GitHub API 오류: ${response.status}`);
  return data;
}

async function deleteViaGitHub(slug: string) {
  const repo =
    process.env.CRIT_GITHUB_REPO ??
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "kyungjae/crit");
  const branch =
    process.env.CRIT_CONTENT_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? DEFAULT_BRANCH;
  const filePath = `content/articles/${slug}.md`;
  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${repo}/contents/${encodedPath}`;
  const current = await githubRequest<{ content: string; encoding: string; sha: string }>(
    `${url}?ref=${encodeURIComponent(branch)}`
  );

  if (current.encoding !== "base64") throw new Error("GitHub 파일 인코딩을 읽을 수 없습니다");
  const raw = Buffer.from(current.content.replace(/\n/g, ""), "base64").toString("utf8");
  assertDraft(raw);

  const result = await githubRequest<{ commit?: { sha?: string } }>(url, {
    method: "DELETE",
    body: JSON.stringify({ message: `content: delete draft ${slug}`, sha: current.sha, branch }),
  });
  return { method: "github" as const, commit: result.commit?.sha };
}

export async function DELETE(request: Request) {
  let body: DeleteBody;
  try {
    body = (await request.json()) as DeleteBody;
  } catch {
    return json({ ok: false, error: "JSON body가 필요합니다" }, 400);
  }

  const auth = assertAuthorized(request, body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  try {
    const slug = safeSlug(body.slug ?? "");
    const hasGitHubToken = Boolean(process.env.CRIT_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN);
    const result = hasGitHubToken ? await deleteViaGitHub(slug) : deleteLocally(slug);
    const message =
      result.method === "github"
        ? "GitHub에서 초안 삭제 커밋을 만들었습니다."
        : "초안 파일을 삭제했습니다.";
    return json({ ok: true, ...result, message });
  } catch (error) {
    const isProd = process.env.NODE_ENV === "production" && !isLocalRequest(request);
    const missingToken = error instanceof Error && /CRIT_GITHUB_TOKEN|GITHUB_TOKEN/.test(error.message);
    return json(
      {
        ok: false,
        error:
          isProd && missingToken
            ? "라이브 삭제에는 CRIT_GITHUB_TOKEN 또는 GITHUB_TOKEN 환경변수가 필요합니다."
            : error instanceof Error
              ? error.message
              : "삭제에 실패했습니다",
      },
      missingToken ? 501 : 400
    );
  }
}
