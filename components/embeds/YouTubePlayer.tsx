"use client";

import { useEffect, useRef, useState } from "react";

export default function YouTubePlayer({ id }: { id: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [origin, setOrigin] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);

    const onScroll = () => setIsScrolled(window.scrollY > 96);
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

  return (
    <figure
      className={`mb-8 overflow-hidden rounded-xl bg-neutral-900 shadow-sm transition-[width,position] duration-200 ${
        isScrolled
          ? "fixed right-3 top-16 z-50 w-[220px] sm:right-6 sm:top-20 sm:w-[320px] lg:right-8 lg:w-[360px]"
          : "relative w-full"
      }`}
    >
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
          스크롤해도 영상이 상단에 고정됩니다. 타임라인을 누르면 해당 장면으로 이동합니다.
        </figcaption>
      )}
    </figure>
  );
}
