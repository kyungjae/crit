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
      className="inline-flex cursor-pointer items-center text-[11px] font-bold leading-none tabular-nums tracking-[0.04em] text-brand transition hover:opacity-70"
    >
      {label}
    </button>
  );
}
