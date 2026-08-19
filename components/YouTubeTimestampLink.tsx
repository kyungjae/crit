"use client";

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const minuteLabel = String(minutes).padStart(2, "0");
  const secondLabel = String(remainingSeconds).padStart(2, "0");
  return hours > 0
    ? `${hours}:${minuteLabel}:${secondLabel}`
    : `${minuteLabel}:${secondLabel}`;
}

export default function YouTubeTimestampLink({
  seconds,
}: {
  seconds: number;
  children: React.ReactNode;
}) {
  const label = formatTimestamp(seconds);

  return (
    <button
      type="button"
      aria-label={`${label}부터 영상 보기`}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("crit:youtube-seek", { detail: { seconds } })
        );
      }}
      className="inline-flex cursor-pointer items-center rounded-md border border-brand/20 bg-brand/[0.08] px-2 py-1 text-[11px] font-bold leading-none tabular-nums tracking-[0.04em] text-brand shadow-sm transition hover:border-brand/35 hover:bg-brand/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 active:translate-y-px dark:!border-brand/30 dark:!bg-brand/[0.12] dark:!shadow-none dark:hover:!border-brand/45 dark:hover:!bg-brand/[0.18]"
    >
      {label}
    </button>
  );
}
