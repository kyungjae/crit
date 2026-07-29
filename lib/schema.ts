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

/**
 * 아티클 레이아웃 포맷. 글의 성격에 맞는 렌더링을 고른다.
 * - brief:    짧은 뉴스 큐레이션 (기본)
 * - deep:     긴 글. 목차 + 읽는 시간 표시
 * - rules:    번호 매긴 규칙/팁 카드 리스트 (레퍼런스형)
 * - showcase: 브랜드 런칭·케이스 스터디. 히어로 이미지 + 풀블리드 비주얼 중심
 */
export const FORMATS = ["brief", "deep", "rules", "showcase"] as const;
export type Format = (typeof FORMATS)[number];

export const FORMAT_LABELS: Record<Format, string> = {
  brief: "브리핑",
  deep: "긴 글",
  rules: "레퍼런스",
  showcase: "케이스 스터디",
};

export const articleFrontmatterSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(300),
  category: z.enum(CATEGORIES),
  format: z.enum(FORMATS).default("brief"),
  tags: z.array(z.string()).max(8).default([]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식"),
  source_url: z.string().url().optional(),
  source_name: z.string().optional(),
  /** 피드 카드 썸네일 */
  thumbnail: z.string().url().optional(),
  /** 아티클 상단 대표 이미지. showcase 포맷에서 풀블리드로 렌더 */
  hero: z.string().url().optional(),
  /** 크레딧 표기 (스튜디오, 클라이언트 등). showcase에서 사용 */
  credits: z.array(z.string()).max(8).default([]),
  /** true면 피드·사이트맵에서 제외. URL로는 미리보기 가능 */
  draft: z.boolean().default(false),
  author: z.string().default("crit agent"),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export const jobRelatedLinkSchema = z.object({
  title: z.string().min(1).max(80),
  url: z.string().url(),
  source_name: z.string().min(1).max(40).optional(),
  type: z.enum(["article", "youtube", "company", "news", "other"]).default("article"),
});

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
  /** 리스트/상세에서 보여줄 회사 로고. 공식 로고가 없으면 favicon/채용 사이트 로고도 허용 */
  logo: z.string().url().optional(),
  /** 회사/조직에 대한 한두 문장 설명 */
  company_description: z.string().max(300).optional(),
  /** 실제 공고를 읽고 사람이 빠르게 판단할 수 있게 요약한 내용 */
  summary: z.string().max(500).optional(),
  responsibilities: z.array(z.string()).max(8).default([]),
  qualifications: z.array(z.string()).max(8).default([]),
  preferred: z.array(z.string()).max(8).default([]),
  related_links: z.array(jobRelatedLinkSchema).max(6).default([]),
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

export const JOB_RELATED_LINK_TYPE_LABELS: Record<
  z.infer<typeof jobRelatedLinkSchema>["type"],
  string
> = {
  article: "아티클",
  youtube: "YouTube",
  company: "회사 자료",
  news: "뉴스",
  other: "참고 링크",
};

export const linkItemSchema = z.object({
  name: z.string().min(1).max(40),
  url: z.string().url(),
  description: z.string().min(1).max(80),
});

export const linksFileSchema = z.object({
  groups: z
    .array(
      z.object({
        title: z.string().min(1).max(30),
        items: z.array(linkItemSchema).min(1),
      })
    )
    .min(1),
});

export type LinkGroup = z.infer<typeof linksFileSchema>["groups"][number];

export const inspirationItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(80),
  image: z.string().url(),
  source_url: z.string().url(),
  source_name: z.string().max(40).optional(),
  tags: z.array(z.string()).max(6).default([]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sample: z.boolean().optional(),
});

export type InspirationItem = z.infer<typeof inspirationItemSchema>;

export const inspirationFileSchema = z.object({
  items: z.array(inspirationItemSchema),
});
