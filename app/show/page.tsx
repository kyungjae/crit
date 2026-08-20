import Link from "next/link";
import { showItems } from "@/lib/community";

export default function ShowPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="grid gap-8 rounded-[2rem] border border-neutral-200 bg-neutral-100 p-6 text-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white md:grid-cols-[1fr_260px] md:p-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500 dark:text-white/50">Show · 작업물</p>
          <h1 className="mt-3 max-w-3xl text-[36px] font-black leading-[1.08] tracking-[-0.06em] md:text-[56px]">
            완성작보다, 만드는 과정이 보이는 작업물.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] text-neutral-500 dark:text-white/60">
            작업물, 툴, 프로토타입, 실패한 실험을 공유하는 공간입니다. 무엇을 만들었는지만큼 왜 그렇게 만들었는지, 무엇을 다시 바꿀 것인지가 중요합니다.
          </p>
        </div>
        <aside className="self-end rounded-2xl bg-neutral-200 p-4 ring-1 ring-neutral-300 dark:bg-white/10 dark:ring-white/10">
          <p className="text-xs font-bold text-neutral-950 dark:text-white">좋은 Show의 재료</p>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-neutral-500 dark:text-white/60">
            <li><span className="mr-2 text-brand">—</span>무엇을 만들었는가</li>
            <li><span className="mr-2 text-brand">—</span>어떤 제약과 선택이 있었는가</li>
            <li><span className="mr-2 text-brand">—</span>다음에는 무엇을 바꿀 것인가</li>
          </ul>
        </aside>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500">COMMUNITY SHOWCASE</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">과정과 판단을 함께 읽는 작업물</p>
        </div>
        <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          {showItems.length}개의 작업물
        </span>
      </div>

      <section className="mt-3 grid gap-3 md:grid-cols-3">
        {showItems.map((item) => (
          <Link
            key={item.slug}
            href={`/show/${item.slug}`}
            className="group rounded-[1.35rem] border border-neutral-200 bg-white p-4 transition-colors hover:border-brand/40 hover:bg-brand/[0.02] dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-brand/50"
          >
            <p className="text-[11px] font-bold text-brand">{item.meta}</p>
            <h2 className="mt-2 text-[20px] font-black leading-tight tracking-[-0.045em] text-neutral-950 transition-colors group-hover:text-brand dark:text-neutral-50">
              {item.title}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {item.body}
            </p>
            <span className="mt-4 inline-block text-[12px] font-semibold text-brand">
              읽고 피드백하기 →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
