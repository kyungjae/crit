import Link from "next/link";
import { askItems } from "@/lib/community";

export default function AskPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/80 md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">Ask crit</p>
        <h1 className="mt-3 text-[36px] font-black leading-none tracking-[-0.06em] text-neutral-950 dark:text-neutral-50 md:text-[56px]">
          디자이너가 지금 물어봐야 할 질문들.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          커리어, 포트폴리오, 디자인 시스템, AI 워크플로우와 팀 운영에 대한 질문을
          모으고, 각 질문을 하나의 대화로 이어갑니다.
        </p>
      </section>

      <section className="mt-6 grid gap-3">
        {askItems.map((item, index) => (
          <Link
            key={item.slug}
            href={`/ask/${item.slug}`}
            className="group rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-brand/40 hover:bg-brand/[0.02] dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-brand/50"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[12px] font-black tabular-nums text-neutral-300 dark:text-neutral-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.035em] text-neutral-950 transition-colors group-hover:text-brand dark:text-neutral-50">
                  {item.title}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.intro}
                </p>
                <span className="mt-3 inline-block text-[12px] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                  질문 열기 →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
