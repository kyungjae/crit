"use client";

import { useMemo, useState } from "react";
import type { LinkGroup } from "@/lib/schema";

function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

function screenshotUrl(url: string, preview?: string) {
  if (preview) return preview;
  return `https://image.thum.io/get/width/900/crop/620/noanimate/${url}`;
}

type LinkGroups = LinkGroup[];

export default function LinksExplorer({ groups }: { groups: LinkGroups }) {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [query, setQuery] = useState("");

  const totalCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.length, 0),
    [groups]
  );

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return groups
      .filter((group) => activeCategory === "전체" || group.title === activeCategory)
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!normalizedQuery) return true;

          const searchable = [
            group.title,
            item.name,
            item.description,
            item.url,
            hostname(item.url),
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(normalizedQuery);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [activeCategory, groups, query]);

  const resultCount = useMemo(
    () => filteredGroups.reduce((sum, group) => sum + group.items.length, 0),
    [filteredGroups]
  );

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-neutral-200/70 bg-neutral-50/95 px-4 pb-4 pt-1 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 sm:static sm:mx-0 sm:border-b-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-0 dark:sm:bg-transparent">
        <label className="relative block">
          <span className="sr-only">링크 검색</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500">
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="사이트 이름, 설명, 도메인으로 검색"
            className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-9 pr-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:!border-neutral-800 dark:!bg-neutral-900 dark:!text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600"
          />
        </label>

        <nav
          aria-label="링크 카테고리"
          className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        >
          <button
            type="button"
            onClick={() => setActiveCategory("전체")}
            aria-pressed={activeCategory === "전체"}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === "전체"
                ? "bg-neutral-900 text-white dark:bg-brand dark:text-white"
                : "bg-white text-neutral-600 ring-1 ring-neutral-200 dark:!bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800"
            }`}
          >
            전체
            <span
              className={`ml-1 text-[11px] ${
                activeCategory === "전체"
                  ? "text-white/65 dark:text-white/70"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              {totalCount}
            </span>
          </button>
          {groups.map((group) => {
            const isActive = activeCategory === group.title;

            return (
              <button
                key={group.title}
                type="button"
                onClick={() => setActiveCategory(group.title)}
                aria-pressed={isActive}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-brand dark:text-white"
                    : "bg-white text-neutral-600 ring-1 ring-neutral-200 dark:!bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800"
                }`}
              >
                {group.title}
                <span
                  className={`ml-1 text-[11px] ${
                    isActive
                      ? "text-white/65 dark:text-white/70"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  {group.items.length}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          {query.trim() || activeCategory !== "전체" ? (
            <span>
              {activeCategory}에서 {resultCount}개 링크
              {query.trim() ? ` · “${query.trim()}” 검색` : ""}
            </span>
          ) : (
            <span>총 {totalCount}개 링크</span>
          )}
        </div>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="flex flex-col gap-8">
          {filteredGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-3 flex items-end justify-between gap-3">
                <h2 className="text-[15px] font-bold">{group.title}</h2>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
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
                      className="group block overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-colors active:bg-neutral-50 dark:!border-neutral-800 dark:!bg-neutral-900/80 dark:active:!bg-neutral-900"
                    >
                      <div className="relative aspect-[1.55] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={screenshotUrl(item.url, item.preview)}
                          alt={`${item.name} 메인 화면`}
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
                        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-600 shadow-sm backdrop-blur dark:bg-neutral-950/80 dark:text-neutral-300">
                          {hostname(item.url)}
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {item.name}
                          </span>
                          <span className="shrink-0 text-xs text-neutral-300 dark:text-neutral-600">
                            ↗
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
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
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-10 text-center dark:!border-neutral-800 dark:!bg-neutral-900/70">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            찾는 링크가 없어요
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            다른 검색어를 입력하거나 전체 카테고리에서 다시 찾아보세요.
          </p>
        </div>
      )}
    </div>
  );
}
