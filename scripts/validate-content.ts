/**
 * content/ 아래 모든 아티클/채용 파일을 스키마 검증한다.
 * 에이전트가 포스팅 후 커밋 전에 실행: npm run validate
 * CI에서도 동일하게 실행된다. 실패 시 exit 1.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  articleFrontmatterSchema,
  inspirationFileSchema,
  jobsFileSchema,
  linksFileSchema,
} from "../lib/schema";

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const JOBS_DIR = path.join(ROOT, "content", "jobs");

const FILENAME_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/;

let errors = 0;

function fail(file: string, message: string) {
  errors++;
  console.error(`✗ ${file}\n  ${message}`);
}

// --- articles ---
if (fs.existsSync(ARTICLES_DIR)) {
  for (const file of fs.readdirSync(ARTICLES_DIR)) {
    const rel = `content/articles/${file}`;
    if (!file.endsWith(".md")) {
      fail(rel, "아티클은 .md 파일이어야 합니다");
      continue;
    }
    if (!FILENAME_RE.test(file)) {
      fail(rel, "파일명은 YYYY-MM-DD-kebab-slug.md 형식이어야 합니다");
      continue;
    }
    try {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const result = articleFrontmatterSchema.safeParse(data);
      if (!result.success) {
        fail(rel, result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
        continue;
      }
      if (!content.trim()) {
        fail(rel, "본문이 비어 있습니다");
        continue;
      }
      const fileDate = file.slice(0, 10);
      if (result.data.date !== fileDate) {
        fail(rel, `frontmatter date(${result.data.date})와 파일명 날짜(${fileDate})가 다릅니다`);
        continue;
      }
      console.log(`✓ ${rel}`);
    } catch (e) {
      fail(rel, `파싱 실패: ${(e as Error).message}`);
    }
  }
}

// --- jobs ---
const seenJobIds = new Set<string>();
if (fs.existsSync(JOBS_DIR)) {
  for (const file of fs.readdirSync(JOBS_DIR)) {
    const rel = `content/jobs/${file}`;
    if (!file.endsWith(".json")) {
      fail(rel, "채용 파일은 .json 이어야 합니다");
      continue;
    }
    try {
      const raw = fs.readFileSync(path.join(JOBS_DIR, file), "utf8");
      const result = jobsFileSchema.safeParse(JSON.parse(raw));
      if (!result.success) {
        fail(rel, result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
        continue;
      }
      for (const job of result.data.jobs) {
        if (seenJobIds.has(job.id)) {
          fail(rel, `중복된 job id: ${job.id}`);
        }
        seenJobIds.add(job.id);
      }
      console.log(`✓ ${rel}`);
    } catch (e) {
      fail(rel, `파싱 실패: ${(e as Error).message}`);
    }
  }
}

// --- links & inspiration ---
for (const [file, schema] of [
  ["links.json", linksFileSchema],
  ["inspiration.json", inspirationFileSchema],
] as const) {
  const full = path.join(ROOT, "content", file);
  if (!fs.existsSync(full)) continue;
  const rel = `content/${file}`;
  try {
    const result = schema.safeParse(JSON.parse(fs.readFileSync(full, "utf8")));
    if (!result.success) {
      fail(rel, result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    } else {
      if (file === "inspiration.json") {
        const ids = new Set<string>();
        for (const item of (result.data as { items: { id: string }[] }).items) {
          if (ids.has(item.id)) fail(rel, `중복된 id: ${item.id}`);
          ids.add(item.id);
        }
      }
      console.log(`✓ ${rel}`);
    }
  } catch (e) {
    fail(rel, `파싱 실패: ${(e as Error).message}`);
  }
}

if (errors > 0) {
  console.error(`\n검증 실패: ${errors}건`);
  process.exit(1);
}
console.log("\n모든 콘텐츠 검증 통과");
