import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  articleFrontmatterSchema,
  inspirationFileSchema,
  eventsFileSchema,
  jobsFileSchema,
  linksFileSchema,
  type ArticleFrontmatter,
  type InspirationItem,
  type Event,
  type Job,
  type LinkGroup,
} from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const JOBS_DIR = path.join(CONTENT_DIR, "jobs");
const EVENTS_FILE = path.join(CONTENT_DIR, "events.json");

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

export function getAllArticles({ includeDrafts = false } = {}): Article[] {
  const articles = listMarkdownFiles(ARTICLES_DIR).map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = articleFrontmatterSchema.parse(data);
    const body = content.trim();
    return { ...fm, slug, body, ...analyze(body) };
  });

  const visible = includeDrafts ? articles : articles.filter((a) => !a.draft);

  // 최신 날짜 우선, 같은 날짜면 파일명 역순
  return visible.sort((a, b) =>
    a.date === b.date ? b.slug.localeCompare(a.slug) : b.date.localeCompare(a.date)
  );
}

/** 검수 대기 중인 초안 목록 (최신순) */
export function getDraftArticles(): Article[] {
  return getAllArticles({ includeDrafts: true }).filter((a) => a.draft);
}

/**
 * 발행 전에 손봐야 할 것들. 초안 목록에서 경고 칩으로 보여준다.
 * placeholder 이미지를 그대로 배포하는 사고를 막는 용도.
 */
export function getDraftWarnings(article: Article): string[] {
  const warnings: string[] = [];
  const haystack = `${article.hero ?? ""}\n${article.body}`;

  if (/picsum\.photos|placehold|example\.com/i.test(haystack)) {
    warnings.push("placeholder 이미지");
  }
  if (/교체 필요|TODO|TBD/i.test(haystack)) {
    warnings.push("교체 표시 남음");
  }
  if (article.format === "showcase" && !article.hero) {
    warnings.push("히어로 이미지 없음");
  }
  if (!article.source_url) {
    warnings.push("원문 링크 없음");
  }
  return warnings;
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

export function getAllJobs({ includeExpired = false } = {}): Job[] {
  if (!fs.existsSync(JOBS_DIR)) return [];
  const files = fs.readdirSync(JOBS_DIR).filter((f) => f.endsWith(".json"));
  const jobs = files.flatMap((file) => {
    const raw = fs.readFileSync(path.join(JOBS_DIR, file), "utf8");
    return jobsFileSchema.parse(JSON.parse(raw)).jobs;
  });

  const today = new Date().toISOString().slice(0, 10);
  return jobs
    .filter((j) => includeExpired || !j.expires_at || j.expires_at >= today)
    .sort((a, b) => b.posted_at.localeCompare(a.posted_at));
}

export function getJob(id: string): Job | null {
  return getAllJobs({ includeExpired: true }).find((job) => job.id === id) ?? null;
}

export function getLinkGroups(): LinkGroup[] {
  const file = path.join(CONTENT_DIR, "links.json");
  if (!fs.existsSync(file)) return [];
  return linksFileSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")))
    .groups;
}

export function getEvents(): Event[] {
  if (!fs.existsSync(EVENTS_FILE)) return [];
  const { events } = eventsFileSchema.parse(
    JSON.parse(fs.readFileSync(EVENTS_FILE, "utf8"))
  );
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function getInspirationItems(): InspirationItem[] {
  const file = path.join(CONTENT_DIR, "inspiration.json");
  if (!fs.existsSync(file)) return [];
  const { items } = inspirationFileSchema.parse(
    JSON.parse(fs.readFileSync(file, "utf8"))
  );
  return items.sort((a, b) => b.date.localeCompare(a.date));
}
