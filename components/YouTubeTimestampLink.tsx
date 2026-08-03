"use client";

export default function YouTubeTimestampLink({
  seconds,
  children,
}: {
  seconds: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("crit:youtube-seek", { detail: { seconds } })
        );
      }}
      className="cursor-pointer text-left text-brand underline underline-offset-2 hover:opacity-75"
    >
      {children}
    </button>
  );
}
