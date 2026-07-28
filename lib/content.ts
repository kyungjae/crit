import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  articleFrontmatterSchema,
  inspirationFileSchema,
  jobsFileSchema,
  linksFileSchema,
  type ArticleFrontmatter,
  type Category,
  type InspirationItem,
  type Job,
  type LinkGroup,
} from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const JOBS_DIR = path.join(CONTENT_DIR, "jobs");

export type Article = ArticleFrontmatter & {
  slug: string;
  body: string;
  /** 대략적인 읽는 시간(분). 한국어 기준 분당 500자 + 이미지당 5초 */
  readingMinutes: number;
  /** rules 포맷에서 카드 개수 (피드 배지에 사용) */
  ruleCount: number;
};

function analyze(body: string): { readingMinutes: number; ruleCount: number } {
  const images = (body.match(/!\[[^\]]*\]\(/g) ?? []).length;
  const text = body.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\s/g, "");
  const minutes = Math.max(1, Math.round(text.length / 500 + (images * 5) / 60));
  const ruleCount = (body.match(/^### /gm) ?? []).length;
  return { readingMinutes: minutes, ruleCount };
}

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

export function getAllArticles(
  category?: Category,
  { includeDrafts = false } = {}
): Article[] {
  const articles = listMarkdownFiles(ARTICLES_DIR).map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = articleFrontmatterSchema.parse(data);
    const body = content.trim();
    return { ...fm, slug, body, ...analyze(body) };
  });

  const visible = includeDrafts ? articles : articles.filter((a) => !a.draft);
  const filtered = category
    ? visible.filter((a) => a.category === category)
    : visible;

  // 최신 날짜 우선, 같은 날짜면 파일명 역순
  return filtered.sort((a, b) =>
    a.date === b.date ? b.slug.localeCompare(a.slug) : b.date.localeCompare(a.date)
  );
}

export function getArticle(slug: string): Article | null {
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const fm = articleFrontmatterSchema.parse(data);
  const body = content.trim();
  return { ...fm, slug, body, ...analyze(body) };
}

export function getAllJobs(): Job[] {
  if (!fs.existsSync(JOBS_DIR)) return [];
  const files = fs.readdirSync(JOBS_DIR).filter((f) => f.endsWith(".json"));
  const jobs = files.flatMap((file) => {
    const raw = fs.readFileSync(path.join(JOBS_DIR, file), "utf8");
    return jobsFileSchema.parse(JSON.parse(raw)).jobs;
  });

  const today = new Date().toISOString().slice(0, 10);
  return jobs
    .filter((j) => !j.expires_at || j.expires_at >= today)
    .sort((a, b) => b.posted_at.localeCompare(a.posted_at));
}

export function getLinkGroups(): LinkGroup[] {
  const file = path.join(CONTENT_DIR, "links.json");
  if (!fs.existsSync(file)) return [];
  return linksFileSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")))
    .groups;
}

export function getInspirationItems(): InspirationItem[] {
  const file = path.join(CONTENT_DIR, "inspiration.json");
  if (!fs.existsSync(file)) return [];
  const { items } = inspirationFileSchema.parse(
    JSON.parse(fs.readFileSync(file, "utf8"))
  );
  return items.sort((a, b) => b.date.localeCompare(a.date));
}
