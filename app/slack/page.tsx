import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Slack에 연결",
    description: "crit이 메시지를 보낼 수 있도록 워크스페이스에 앱을 설치합니다.",
  },
  {
    number: "02",
    title: "받을 채널 선택",
    description: "공개 채널 또는 봇이 참여한 비공개 채널 중 하나를 고릅니다.",
  },
  {
    number: "03",
    title: "매일 새 글 확인",
    description: "새로 올라온 글이 제목, 링크, 요약과 함께 채널에 도착합니다.",
  },
];

export default async function SlackPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-5xl py-8 md:py-14">
      {params.error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
          Slack 설치가 취소되었습니다: {params.error}
        </div>
      )}

      <section className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white dark:border-neutral-800 dark:!bg-neutral-900">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden bg-[#f97316] px-7 py-9 text-white md:px-12 md:py-14">
            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full border-[36px] border-white/10" />
            <div className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full border-[42px] border-white/10" />
            <div className="relative">
              <div className="mb-12 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#f97316] text-xl font-black">#</div>
                <span className="text-lg font-bold tracking-[-0.03em]">crit × Slack</span>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Daily reading signal</p>
              <h1 className="mt-4 max-w-lg text-4xl font-black leading-[1.08] tracking-[-0.06em] md:text-6xl">
                새 글을<br />Slack에서 받아보세요
              </h1>
              <p className="mt-6 max-w-md text-[15px] leading-7 text-white/75">
                하루에 한 번, crit에 올라온 읽을거리를 팀 채널로 보냅니다. 피드에 들어오지 않아도 오늘의 신호를 놓치지 않게 됩니다.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="/api/slack/install" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#f97316] transition hover:bg-white/90">
                  <span>Slack에 추가하기</span>
                  <span aria-hidden>↗</span>
                </a>
                <span className="text-xs text-white/55">설정은 1분 안에 끝납니다</span>
              </div>
            </div>
          </div>

          <div className="bg-white px-7 py-9 md:px-10 md:py-12 dark:!bg-neutral-900">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">How it works</p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-neutral-950 dark:!text-neutral-50">연결하면 이렇게 동작합니다</h2>
            <div className="mt-8 space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <span className="shrink-0 font-mono text-xs font-bold text-brand">{step.number}</span>
                  <div>
                    <h3 className="text-[15px] font-bold text-neutral-950 dark:!text-neutral-50">{step.title}</h3>
                    <p className="mt-1 text-[13px] leading-6 text-neutral-500 dark:text-neutral-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-9 border-t border-neutral-200 pt-5 dark:border-neutral-800">
              <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-neutral-700 dark:text-neutral-200">보내는 내용</span> — 새 글의 제목, 원문 링크, crit 요약<br />
                <span className="font-bold text-neutral-700 dark:text-neutral-200">보내는 주기</span> — 매일 한 번<br />
                <span className="font-bold text-neutral-700 dark:text-neutral-200">권한</span> — 메시지 작성과 채널 읽기만 요청합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-neutral-500 dark:text-neutral-400">
        <span>팀의 읽을거리를 한 곳에서 공유하는 가장 작은 연결</span>
        <Link href="/" className="font-semibold text-neutral-700 underline underline-offset-4 hover:text-brand dark:text-neutral-300">crit 피드로 돌아가기</Link>
      </div>
    </main>
  );
}
