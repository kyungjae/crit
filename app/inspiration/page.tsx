import type { Metadata } from "next";
import { getInspirationItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "영감",
  description: "잘 만들어진 포스터, BI, 인터페이스를 모아 보는 영감 피드",
};

export default function InspirationPage() {
  const items = getInspirationItems();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">영감</h1>
      <p className="mb-4 text-sm text-neutral-500">
        잘 만들어진 포스터 · BI · 인터페이스
      </p>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">
          아직 큐레이션된 이미지가 없습니다.
        </p>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block break-inside-avoid overflow-hidden rounded-xl border border-neutral-200/80 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full bg-neutral-100"
              />
              <div className="px-2.5 py-2">
                <p className="line-clamp-2 text-xs font-medium leading-snug text-neutral-800">
                  {item.title}
                </p>
                {item.source_name && (
                  <p className="mt-0.5 text-[10px] text-neutral-400">
                    {item.source_name} ↗
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
