"use client";

import { useEffect, useRef, useState } from "react";

export default function YouTubePlayer({ id }: { id: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);

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
      iframeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    window.addEventListener("crit:youtube-seek", onTimelineRequest);
    return () => window.removeEventListener("crit:youtube-seek", onTimelineRequest);
  }, []);

  const src = `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1${
    origin ? `&origin=${encodeURIComponent(origin)}` : ""
  }`;

  return (
    <figure className="not-prose mb-8 overflow-hidden rounded-xl bg-neutral-900 shadow-sm">
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
      <figcaption className="px-3 py-2 text-xs text-neutral-400">
        타임라인을 누르면 이 영상이 해당 장면으로 이동합니다.
      </figcaption>
    </figure>
  );
}
