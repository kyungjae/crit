import Link from "next/link";

const prompts = [
  "포트폴리오에서 결과 수치보다 판단 과정이 더 중요해 보이는 순간은 언제일까?",
  "AI 도구를 팀에 도입하기 전에 먼저 문서화해야 할 기준은 무엇일까?",
  "주니어 디자이너가 툴 속도보다 먼저 길러야 할 감각은 무엇일까?",
  "디자인 시스템은 어디까지 자동화하고, 어디부터 사람이 리뷰해야 할까?",
];

export default function AskPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/80 md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
          Ask crit
        </p>
        <h1 className="mt-3 text-[36px] font-black leading-none tracking-[-0.06em] text-neutral-950 dark:text-neutral-50 md:text-[56px]">
          디자이너가 지금 물어봐야 할 질문들.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          커리어, 포트폴리오, 디자인 시스템, AI 워크플로우, 팀 운영에 대한
          질문을 모으는 공간입니다. 초기는 에디터가 토론 씨앗을 심고, 이후
          링크 제보/댓글 흐름과 연결합니다.
        </p>
      </section>

      <section className="mt-6 grid gap-3">
        {prompts.map((prompt, index) => (
          <article
            key={prompt}
            className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[12px] font-black tabular-nums text-neutral-300 dark:text-neutral-700">
                {index + 1}
              </span>
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.035em] text-neutral-950 dark:text-neutral-50">
                  {prompt}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  crit 질문: 정답을 고르는 게시판이 아니라, 디자이너의 판단
                  기준을 같이 선명하게 만드는 토론으로 운영합니다.
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="mt-8 rounded-[1.5rem] border border-dashed border-neutral-300 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900/45">
        <h2 className="text-[20px] font-black tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
          다음 단계: 질문 제보 폼 연결
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          실제 운영에서는 Google Form/Tally/GitHub Issue 중 하나를 연결해 질문을
          받고, 좋은 질문은 아티클 피드와 댓글 토론으로 승격합니다.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-full bg-neutral-950 px-4 py-2 text-[13px] font-bold text-white dark:bg-brand"
        >
          피드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
