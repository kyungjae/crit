import Link from "next/link";

export default function NewsletterUnsubscribedPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
        Newsletter
      </p>
      <h1 className="mt-3 text-[28px] font-black tracking-[-0.05em]">
        구독을 해지했어요.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        더 이상 주간 뉴스레터를 보내지 않을게요.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:border-brand hover:text-brand dark:!border-neutral-700 dark:!text-neutral-200"
      >
        피드로 돌아가기
      </Link>
    </div>
  );
}
