import type { Metadata } from "next";
import Link from "next/link";

import SubmitLinkForm from "@/components/SubmitLinkForm";

export const metadata: Metadata = {
  title: "아티클 제보",
  description: "crit 피드에 소개하고 싶은 좋은 아티클을 제보해주세요.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="text-sm font-medium text-neutral-500 transition hover:text-brand dark:text-neutral-400"
      >
        ← 피드로 돌아가기
      </Link>
      <div className="mt-8">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
          Article submit
        </p>
        <h1 className="mt-2 text-[28px] font-black tracking-[-0.05em]">
          같이 읽고 싶은 아티클을 알려주세요
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          디자인, 제품, AI, 툴, 케이스, 커리어에 관한 좋은 아티클을 제보해주세요.
          보내주신 링크는 검수 후 crit 피드에 반영합니다.
        </p>
      </div>
      <div className="mt-8">
        <SubmitLinkForm />
      </div>
    </div>
  );
}
