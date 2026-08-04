export default function ShowPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-100 p-7 text-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white md:p-10">
        <div className="absolute right-0 top-0 size-48 translate-x-1/4 -translate-y-1/3 rounded-full bg-brand/10 blur-3xl" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500 dark:text-white/50">Show · 작업물</p>
        <h1 className="relative mt-4 max-w-2xl text-[42px] font-black leading-[1.04] tracking-[-0.06em] md:text-[64px]">
          곧, 만드는 과정을 보여드립니다.
        </h1>
        <p className="relative mt-5 max-w-xl text-[15px] leading-[1.8] text-neutral-500 dark:text-white/60">
          작업물, 툴, 프로토타입과 실패한 실험을 공유하는 공간을 준비하고 있습니다.
          결과 화면만이 아니라 무엇을 선택했고 무엇을 다시 바꿀지까지 남길 수 있게 만들겠습니다.
        </p>
        <div className="relative mt-8 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/[0.06] px-4 py-2 text-xs font-semibold text-brand">
          <span className="size-1.5 rounded-full bg-brand" />
          Coming soon
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["작업물", "무엇을 만들었는지 보여줍니다."],
          ["과정", "제약과 선택의 맥락을 함께 남깁니다."],
          ["피드백", "다음 실험으로 이어지는 의견을 나눕니다."],
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
