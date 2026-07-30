import type { Metadata } from "next";
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

      <LinksExplorer groups={groups} />
    </div>
  );
}
