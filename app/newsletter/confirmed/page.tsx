import Link from "next/link";

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const confirmed = status === "success";

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">
        Newsletter
      </p>
      <h1 className="mt-3 text-[28px] font-black tracking-[-0.05em]">
        {confirmed ? "구독이 확인됐어요." : "구독 링크가 만료됐어요."}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {confirmed
          ? "이제 매주 crit가 고른 읽을거리를 이메일로 보내드릴게요."
          : "새로 뉴스레터를 신청하면 확인 링크를 다시 받을 수 있어요."}
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
