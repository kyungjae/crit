import type { Metadata } from "next";
import Link from "next/link";

import SubmitResourceForm from "@/components/SubmitResourceForm";

export const metadata: Metadata = {
  title: "링크 추가",
  description: "crit 링크 페이지에 소개하고 싶은 리소스를 제보해주세요.",
};

export default function SubmitResourcePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/links"
        className="text-sm font-medium text-neutral-500 transition hover:text-brand dark:text-neutral-400"
      >
        ← 링크 페이지로 돌아가기
      </Link>
      <div className="mt-8">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
          Link library
        </p>
        <h1 className="mt-2 text-[28px] font-black tracking-[-0.05em]">
          함께 쓸 링크를 알려주세요
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          폰트, 컬러, 아이콘, 레퍼런스처럼 필요할 때 다시 찾고 싶은 리소스를
          제보해주세요. 검수 후 링크 페이지의 해당 카테고리에 반영합니다.
        </p>
      </div>
      <div className="mt-8">
        <SubmitResourceForm />
      </div>
    </div>
  );
}
