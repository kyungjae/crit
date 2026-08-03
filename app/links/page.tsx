import type { Metadata } from "next";
import Link from "next/link";
import LinksExplorer from "@/components/LinksExplorer";
import { getLinkGroups } from "@/lib/content";

export const metadata: Metadata = {
  title: "링크",
  description: "디자이너를 위한 필수 링크 모음 — 레퍼런스, 폰트, 컬러, 아이콘, AI 도구",
};

export default function LinksPage() {
  const groups = getLinkGroups();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">링크</h1>
      <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">
        필요할 때 항상 안 보이는 그 사이트들, 카테고리와 검색으로 빠르게 찾으세요
      </p>
      <Link
        href="/links/submit"
        className="mb-6 inline-flex rounded-full bg-neutral-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand dark:bg-brand dark:hover:bg-brand-dark"
      >
        링크 추가하기
      </Link>

      <LinksExplorer groups={groups} />
    </div>
  );
}
