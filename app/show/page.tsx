import Link from "next/link";
import { showItems } from "@/lib/community";

export default function ShowPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-[2rem] border border-neutral-200 bg-neutral-950 p-6 text-white dark:border-neutral-800 dark:bg-neutral-900 md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50">Show crit</p>
        <h1 className="mt-3 text-[36px] font-black leading-none tracking-[-0.06em] md:text-[56px]">
          작업물, 툴, 실험을 보여주는 디자이너 광장.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/60">
          완성작 자랑만이 아니라 과정, 판단 기준, 실패한 실험까지 공유하는 작업물 피드입니다.
        </p>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
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
            <span className="mt-4 inline-block text-[12px] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
              작업물 열기 →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
