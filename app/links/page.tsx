import type { Metadata } from "next";
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
      <p className="mb-5 text-sm text-neutral-500">
        필요할 때 항상 안 보이는 그 사이트들, 여기 모아뒀습니다
      </p>

      <div className="flex flex-col gap-7">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-2.5 text-[15px] font-bold">{group.title}</h2>
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white px-3.5 py-3 transition-colors active:bg-neutral-50"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-neutral-900">
                        {item.name}
                      </span>
                      <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                        {item.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-neutral-300">
                      {new URL(item.url).hostname.replace(/^www\./, "")}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
