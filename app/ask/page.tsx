export default function AskPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-7 dark:border-neutral-800 dark:bg-neutral-900/80 md:p-10">
        <div className="absolute right-0 top-0 size-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand/10 blur-3xl" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.18em] text-brand">Ask · 질문</p>
        <h1 className="relative mt-4 max-w-2xl text-[42px] font-black leading-[1.04] tracking-[-0.06em] text-neutral-950 dark:text-neutral-50 md:text-[64px]">
          곧, 디자이너의 질문을 엽니다.
        </h1>
        <p className="relative mt-5 max-w-xl text-[15px] leading-[1.8] text-neutral-500 dark:text-neutral-400">
          커리어, 포트폴리오, 디자인 시스템과 AI 워크플로우에 대해 묻고 답하는 공간을 준비하고 있습니다.
          서두르기보다 실제 경험이 오갈 수 있는 구조부터 만들겠습니다.
        </p>
        <div className="relative mt-8 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/[0.06] px-4 py-2 text-xs font-semibold text-brand">
          <span className="size-1.5 rounded-full bg-brand" />
          Coming soon
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["질문", "지금 고민하는 문제를 구체적으로 묻습니다."],
          ["경험", "해본 일과 판단 기준을 나눕니다."],
          ["대화", "한 번의 답으로 끝나지 않게 이어갑니다."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <p className="text-sm font-bold text-neutral-950 dark:text-neutral-100">{title}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
