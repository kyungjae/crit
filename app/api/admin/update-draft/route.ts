import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import { articleFrontmatterSchema } from "@/lib/schema";

export const runtime = "nodejs";

type UpdateDraftBody = {
  slug?: string;
  title?: string;
  summary?: string;
  body?: string;
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

function assertAuthorized(request: Request, body: UpdateDraftBody) {
  const adminToken = process.env.CRIT_ADMIN_TOKEN;
  const isLocal = isLocalRequest(request);
  if (!adminToken) {
    if (isLocal) return { ok: true as const };
    return { ok: false as const, status: 501, error: "라이브 편집에는 CRIT_ADMIN_TOKEN 환경변수가 필요합니다" };
  }

  const provided =
    request.headers.get("x-crit-admin-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    (body as UpdateDraftBody & { token?: string }).token;
  if (provided && provided === adminToken) return { ok: true as const };
  return { ok: false as const, status: 401, error: "편집 키가 필요합니다" };
}

function safeSlug(slug: string) {
  if (!/^[0-9a-z-]+$/.test(slug)) throw new Error("잘못된 slug입니다");
  return slug;
}

function validateInput(body: UpdateDraftBody) {
  const title = body.title?.trim() ?? "";
  const summary = body.summary?.trim() ?? "";
  const markdown = body.body ?? "";
  if (!title || title.length > 120) throw new Error("제목은 1~120자여야 합니다");
  if (!summary || summary.length > 300) throw new Error("요약은 1~300자여야 합니다");
  if (!markdown.trim()) throw new Error("본문을 비워둘 수 없습니다");
  return { title, summary, body: markdown };
}

function updateRaw(raw: string, input: ReturnType<typeof validateInput>) {
  const parsed = matter(raw);
  if (parsed.data.draft !== true) throw new Error("초안이 아니어서 수정할 수 없습니다");
  const nextData = {
    ...parsed.data,
    // gray-matter turns unquoted YAML dates into Date objects; normalize them
    // before validating/writing the frontmatter.
    date: parsed.data.date instanceof Date
      ? parsed.data.date.toISOString().slice(0, 10)
      : parsed.data.date,
    title: input.title,
    summary: input.summary,
  };
  articleFrontmatterSchema.parse(nextData);
  return matter.stringify(input.body.trimEnd() + "\n", nextData);
}

function updateLocally(slug: string, input: ReturnType<typeof validateInput>) {
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) throw new Error("초안 파일을 찾을 수 없습니다");
  const next = updateRaw(fs.readFileSync(file, "utf8"), input);
  fs.writeFileSync(file, next, "utf8");
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

async function updateViaGitHub(slug: string, input: ReturnType<typeof validateInput>) {
  const repo = process.env.CRIT_GITHUB_REPO ?? "kyungjae/crit";
  const branch = process.env.CRIT_CONTENT_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? DEFAULT_BRANCH;
  const filePath = `content/articles/${slug}.md`;
  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${repo}/contents/${encodedPath}`;
  const current = await githubRequest<{ content: string; encoding: string; sha: string }>(`${url}?ref=${encodeURIComponent(branch)}`);
  if (current.encoding !== "base64") throw new Error("GitHub 파일 인코딩을 읽을 수 없습니다");
  const raw = Buffer.from(current.content.replace(/\n/g, ""), "base64").toString("utf8");
  const next = updateRaw(raw, input);
  const result = await githubRequest<{ commit?: { sha?: string } }>(url, {
    method: "PUT",
    body: JSON.stringify({
      message: `content: edit draft ${slug}`,
      content: Buffer.from(next, "utf8").toString("base64"),
      sha: current.sha,
      branch,
    }),
  });
  return { method: "github" as const, commit: result.commit?.sha };
}

export async function POST(request: Request) {
  let body: UpdateDraftBody;
  try {
    body = (await request.json()) as UpdateDraftBody;
  } catch {
    return json({ ok: false, error: "JSON body가 필요합니다" }, 400);
  }

  const auth = assertAuthorized(request, body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  try {
    const slug = safeSlug(body.slug ?? "");
    const input = validateInput(body);
    const hasGitHubToken = Boolean(process.env.CRIT_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN);
    const result = hasGitHubToken ? await updateViaGitHub(slug, input) : updateLocally(slug, input);
    return json({
      ok: true,
      ...result,
      message: result.method === "github"
        ? "GitHub에 초안 수정 커밋을 만들었습니다."
        : "초안 파일을 저장했습니다.",
    });
  } catch (error) {
    const isProd = process.env.NODE_ENV === "production" && !isLocalRequest(request);
    const missingToken = error instanceof Error && /CRIT_GITHUB_TOKEN|GITHUB_TOKEN/.test(error.message);
    return json({
      ok: false,
      error: isProd && missingToken
        ? "라이브 편집에는 CRIT_GITHUB_TOKEN 또는 GITHUB_TOKEN 환경변수가 필요합니다."
        : error instanceof Error ? error.message : "초안 저장에 실패했습니다",
    }, missingToken ? 501 : 400);
  }
}
