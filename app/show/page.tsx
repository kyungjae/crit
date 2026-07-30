import Link from "next/link";

const examples = [
  {
    title: "작은 팀의 디자인 시스템 운영 방식",
    meta: "design system · team workflow",
    body: "컴포넌트가 몇 개인지보다 누가 어떤 기준으로 고치고 배포하는지 보여주는 공유물.",
  },
  {
    title: "AI 프로토타입 제작 실험",
    meta: "AI × design · prototype",
    body: "v0, Framer, Figma, Cursor 등을 섞어 만든 실제 작업 흐름과 한계 기록.",
  },
  {
    title: "포트폴리오 케이스 구조",
    meta: "career · portfolio",
    body: "예쁜 화면보다 문제 정의, 제약, 의사결정, 결과를 어떻게 드러냈는지 보는 제출물.",
  },
];

export default function ShowPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-[2rem] border border-neutral-200 bg-neutral-950 p-6 text-white dark:border-neutral-800 dark:bg-neutral-900 md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50">
          Show crit
        </p>
        <h1 className="mt-3 text-[36px] font-black leading-none tracking-[-0.06em] md:text-[56px]">
          작업물, 툴, 실험을 보여주는 디자이너 광장.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/60">
          완성작 자랑만이 아니라 과정, 판단 기준, 실패한 실험까지 공유할 수
          있는 Show 피드입니다. 디자이너판 GeekNews라면 링크 큐레이션만큼
          작업물 제출 흐름이 중요합니다.
        </p>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        {examples.map((item) => (
          <article
            key={item.title}
            className="rounded-[1.35rem] border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80"
          >
            <p className="text-[11px] font-bold text-brand">{item.meta}</p>
            <h2 className="mt-2 text-[20px] font-black leading-tight tracking-[-0.045em] text-neutral-950 dark:text-neutral-50">
              {item.title}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {item.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-[1.5rem] border border-dashed border-neutral-300 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900/45">
        <h2 className="text-[20px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
          다음 단계: Show 제출 폼 연결
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          URL, 한 줄 설명, 배운 점, 피드백 받고 싶은 지점을 받는 간단한 제출
          폼을 붙이면 초기 커뮤니티 운영을 시작할 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-full bg-neutral-950 px-4 py-2 text-[13px] font-bold text-white dark:bg-brand"
        >
          피드로 돌아가기
        </Link>
      </section>
    </div>
  );
}
