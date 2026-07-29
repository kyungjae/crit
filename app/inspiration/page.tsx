import type { Metadata } from "next";
import { getInspirationItems } from "@/lib/content";
import InspirationMasonry from "@/components/InspirationMasonry";

export const metadata: Metadata = {
  title: "영감",
  description: "잘 만들어진 포스터, BI, 인터페이스를 모아 보는 영감 피드",
};

export default function InspirationPage() {
  const items = getInspirationItems();

  return (
    <div>
      <div className="mb-4 rounded-3xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Inspiration feed
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em]">영감</h1>
        <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          포스터 · BI · 인터페이스 · 모션을 핀터레스트처럼 가볍게 넘겨보는 피드
        </p>
      </div>

      <InspirationMasonry items={items} />
    </div>
  );
}
