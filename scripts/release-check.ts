/**
 * Production 배포 전 안전 검사.
 *
 * Vercel Production은 main의 깨끗한 checkout에서만 배포한다.
 * 이 검사는 배포 명령 자체를 대신하지 않지만, 작업 브랜치와 dirty
 * worktree를 실수로 Production에 올리는 가장 흔한 경로를 차단한다.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const errors: string[] = [];
const branch = git("branch", "--show-current");
if (branch !== "main") {
  errors.push(`Production 배포는 main에서만 허용됩니다 (현재: ${branch || "detached HEAD"})`);
}

const status = git("status", "--porcelain");
if (status) {
  errors.push("working tree가 깨끗하지 않습니다. 커밋 또는 격리된 worktree에서 배포하세요.");
}

const articlesDir = path.join(process.cwd(), "content", "articles");
let published = 0;
for (const file of fs.readdirSync(articlesDir).filter((name) => name.endsWith(".md"))) {
  const relative = `content/articles/${file}`;
  try {
    const raw = fs.readFileSync(path.join(articlesDir, file), "utf8");
    const { data } = matter(raw);
    if (typeof data.draft !== "boolean") {
      errors.push(`${relative}: draft 값을 true/false로 명시해야 합니다`);
    } else if (!data.draft) {
      published++;
    }
  } catch (error) {
    errors.push(`${relative}: frontmatter를 읽을 수 없습니다 (${(error as Error).message})`);
  }
}

if (published === 0) {
  errors.push("발행된 아티클이 0개입니다. 콘텐츠 삭제/배포 대상을 확인하세요.");
}

if (errors.length > 0) {
  console.error("Production 배포 안전 검사 실패");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Production 배포 안전 검사 통과: main, clean worktree, published articles ${published}개`);
