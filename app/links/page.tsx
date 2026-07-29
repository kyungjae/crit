import type { Metadata } from "next";
import { getLinkGroups } from "@/lib/content";

export const metadata: Metadata = {
  title: "링크",
  description: "디자이너를 위한 필수 링크 모음 — 레퍼런스, 폰트, 컬러, 아이콘, AI 도구",
};

function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

function screenshotUrl(url: string, preview?: string) {
  if (preview) return preview;
  return `https://image.thum.io/get/width/900/crop/620/noanimate/${url}`;
}

export default function LinksPage() {
  const groups = getLinkGroups();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">링크</h1>
      <p className="mb-5 text-sm text-neutral-500">
        필요할 때 항상 안 보이는 그 사이트들, 화면으로 보고 고르세요
      </p>

      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.title}>
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-[15px] font-bold">{group.title}</h2>
              <span className="text-[11px] text-neutral-400">
                {group.items.length}개
              </span>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-colors active:bg-neutral-50"
                  >
                    <div className="relative aspect-[1.55] overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshotUrl(item.url, item.preview)}
                        alt={`${item.name} 메인 화면`}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
                      <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-600 shadow-sm backdrop-blur">
                        {hostname(item.url)}
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-neutral-900">
                          {item.name}
                        </span>
                        <span className="shrink-0 text-xs text-neutral-300">↗</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                        {item.description}
                      </p>
                    </div>
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
