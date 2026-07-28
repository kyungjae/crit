import { z } from "zod";

/**
 * 콘텐츠 스키마 — 에이전트가 생성하는 파일의 유효성 기준.
 * scripts/validate-content.ts 와 앱 양쪽에서 사용한다.
 */

export const CATEGORIES = [
  "news",
  "ai-workflow",
  "tools",
  "ai-guide",
  "portfolio",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  news: "뉴스",
  "ai-workflow": "AI 워크플로우",
  tools: "도구",
  "ai-guide": "AI 사용법",
  portfolio: "포트폴리오",
};

export const articleFrontmatterSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(300),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string()).max(8).default([]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식"),
  source_url: z.string().url().optional(),
  source_name: z.string().optional(),
  thumbnail: z.string().url().optional(),
  author: z.string().default("crit agent"),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export const jobSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  employment_type: z
    .enum(["full-time", "contract", "freelance", "internship"])
    .default("full-time"),
  experience: z.string().optional(),
  salary: z.string().optional(),
  tags: z.array(z.string()).max(8).default([]),
  url: z.string().url(),
  posted_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expires_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type Job = z.infer<typeof jobSchema>;

export const jobsFileSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jobs: z.array(jobSchema),
});

export const EMPLOYMENT_TYPE_LABELS: Record<Job["employment_type"], string> = {
  "full-time": "정규직",
  contract: "계약직",
  freelance: "프리랜서",
  internship: "인턴",
};
