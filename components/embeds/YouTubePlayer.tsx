"use client";

import { useEffect, useRef, useState } from "react";

export default function YouTubePlayer({ id }: { id: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [origin, setOrigin] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);

    const onScroll = () => {
      const handoffPoint = window.innerWidth < 640 ? 220 : 320;
      setIsScrolled(window.scrollY > handoffPoint);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onTimelineRequest = (event: Event) => {
      const seconds = (event as CustomEvent<{ seconds: number }>).detail?.seconds;
      if (typeof seconds !== "number" || !Number.isFinite(seconds)) return;

      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
        "*"
      );
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "*"
      );
    };

    window.addEventListener("crit:youtube-seek", onTimelineRequest);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("crit:youtube-seek", onTimelineRequest);
    };
  }, []);

  const src = `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1${
    origin ? `&origin=${encodeURIComponent(origin)}` : ""
  }`;

  if (isDismissed) return null;

  return (
    <figure
      className={`mb-8 overflow-hidden rounded-xl bg-neutral-900 shadow-sm ${
        isScrolled
          ? "fixed left-3 right-3 top-16 z-50 w-auto sm:left-auto sm:right-6 sm:top-20 sm:w-[320px] lg:right-8 lg:w-[360px]"
          : "relative w-full"
      }`}
    >
      {isScrolled && (
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="영상 닫기"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-lg leading-none text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
      <div className="aspect-video">
        <iframe
          ref={iframeRef}
          src={src}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      {!isScrolled && (
        <figcaption className="px-3 py-2 text-xs text-neutral-400">
          본문의 타임라인을 누르면 해당 장면으로 이동합니다.
        </figcaption>
      )}
    </figure>
  );
}
