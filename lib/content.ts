import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  articleFrontmatterSchema,
  jobsFileSchema,
  type ArticleFrontmatter,
  type Category,
  type Job,
} from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const JOBS_DIR = path.join(CONTENT_DIR, "jobs");

export type Article = ArticleFrontmatter & {
  slug: string;
  body: string;
};

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

export function getAllArticles(category?: Category): Article[] {
  const articles = listMarkdownFiles(ARTICLES_DIR).map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = articleFrontmatterSchema.parse(data);
    return { ...fm, slug, body: content.trim() };
  });

  const filtered = category
    ? articles.filter((a) => a.category === category)
    : articles;

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
  return { ...fm, slug, body: content.trim() };
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
