import { z } from "zod";

import { CATEGORIES } from "./schema";

export const SUBMISSION_STATUSES = [
  "pending",
  "reviewed",
  "rejected",
  "published",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const submissionStatusSchema = z.enum(SUBMISSION_STATUSES);

const SUBMISSION_REASON_VALUES = [
  "practical",
  "perspective",
  "reference",
  "trend",
  "career",
] as const;

export const SUBMISSION_REASONS = [
  { value: "practical", label: "실무에 바로 적용할 수 있어요" },
  { value: "perspective", label: "새로운 관점을 얻을 수 있어요" },
  { value: "reference", label: "디자인·제품 사례로 참고하기 좋아요" },
  { value: "trend", label: "AI·툴 트렌드를 이해하는 데 도움이 돼요" },
  { value: "career", label: "커리어에 도움이 되는 정보예요" },
] as const;

const submissionReasonSchema = z.enum(SUBMISSION_REASON_VALUES);
const submissionReasonLabels = Object.fromEntries(
  SUBMISSION_REASONS.map((reason) => [reason.value, reason.label])
) as Record<(typeof SUBMISSION_REASON_VALUES)[number], string>;

export function normalizeSubmissionUrl(value: string): string {
  const url = new URL(value.trim());
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

const submissionUrlSchema = z
  .string()
  .trim()
  .min(1, "링크를 입력해주세요")
  .max(2048, "링크가 너무 깁니다")
  .url("올바른 URL을 입력해주세요")
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "http 또는 https 링크만 제보할 수 있습니다")
  .transform(normalizeSubmissionUrl);

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional()
  );

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().email("올바른 이메일을 입력해주세요").max(254).optional()
);

const rawLinkSubmissionSchema = z.object({
  url: submissionUrlSchema,
  note: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(10).max(1000).optional()
  ),
  reasons: z.array(submissionReasonSchema).min(1).max(3).optional(),
  category: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(CATEGORIES).optional()
  ),
  submitterName: optionalText(40),
  submitterEmail: optionalEmail,
});

export const createLinkSubmissionSchema = rawLinkSubmissionSchema
  .superRefine((value, context) => {
    if (!value.note && !value.reasons) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reasons"],
        message: "추천 이유를 하나 이상 선택해주세요",
      });
    }
  })
  .transform(({ reasons, note, ...rest }) => ({
    ...rest,
    note:
      reasons?.map((reason) => submissionReasonLabels[reason]).join(" · ") ??
      note ??
      "",
  }));

export type CreateLinkSubmissionInput = z.infer<typeof createLinkSubmissionSchema>;

export const RESOURCE_CATEGORIES = [
  "reference",
  "fonts",
  "color",
  "icons",
  "photo-mockup",
  "ai-tools",
  "ux-research",
] as const;

export const RESOURCE_CATEGORY_LABELS: Record<
  (typeof RESOURCE_CATEGORIES)[number],
  string
> = {
  reference: "레퍼런스·영감",
  fonts: "폰트",
  color: "컬러",
  icons: "아이콘·일러스트",
  "photo-mockup": "사진·목업",
  "ai-tools": "AI 도구",
  "ux-research": "UX 학습·리서치",
};

export const createResourceSubmissionSchema = z.object({
  url: submissionUrlSchema,
  name: z.string().trim().min(1, "리소스 이름을 입력해주세요").max(80),
  description: z.string().trim().min(10, "설명을 10자 이상 입력해주세요").max(500),
  category: z.enum(RESOURCE_CATEGORIES),
  submitterName: optionalText(40),
  submitterEmail: optionalEmail,
});

export type CreateResourceSubmissionInput = z.infer<
  typeof createResourceSubmissionSchema
>;

export const updateLinkSubmissionSchema = z.object({
  id: z.string().cuid(),
  status: submissionStatusSchema.exclude(["pending"]),
  reviewerNote: optionalText(1000),
});

export type UpdateLinkSubmissionInput = z.infer<typeof updateLinkSubmissionSchema>;
