import Link from "next/link";
import { askItems } from "@/lib/community";

export default function AskPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="grid gap-8 rounded-[2rem] border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/80 md:grid-cols-[1fr_260px] md:p-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">Ask · 질문</p>
          <h1 className="mt-3 max-w-3xl text-[36px] font-black leading-[1.08] tracking-[-0.06em] text-neutral-950 dark:text-neutral-50 md:text-[56px]">
            정답보다, 실제로 해본 사람의 판단을 묻습니다.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] text-neutral-500 dark:text-neutral-400">
            커리어, 포트폴리오, 디자인 시스템, AI 워크플로우와 팀 운영에 대한 질문을 모읍니다.
            질문을 읽고 자신의 경험과 기준으로 답해주세요. 모든 답은 다음 질문을 더 구체적으로 만드는 재료가 됩니다.
          </p>
        </div>
        <aside className="self-end rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-950">
          <p className="text-xs font-bold text-neutral-950 dark:text-neutral-100">참여하는 방법</p>
          <ol className="mt-3 space-y-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            <li><span className="mr-2 font-bold text-brand">01</span>관심 있는 질문을 고릅니다.</li>
            <li><span className="mr-2 font-bold text-brand">02</span>해본 일과 판단 기준을 적습니다.</li>
            <li><span className="mr-2 font-bold text-brand">03</span>다른 사람의 답에 이어 답합니다.</li>
          </ol>
        </aside>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500">OPEN QUESTIONS</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">아직 결론이 나지 않은 질문들</p>
        </div>
        <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          {askItems.length}개의 질문
        </span>
      </div>

      <section className="mt-3 grid gap-3">
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
                <span className="mt-3 inline-block text-[12px] font-semibold text-brand">
                  읽고 답하기 →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
