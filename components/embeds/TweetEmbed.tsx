"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    twttr?: { widgets: { load: (el?: HTMLElement) => void } };
  }
}

const SCRIPT_SRC = "https://platform.twitter.com/widgets.js";

export default function TweetEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => window.twttr?.widgets.load(ref.current ?? undefined);
    if (window.twttr) {
      load();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", load);
    return () => script?.removeEventListener("load", load);
  }, [url]);

  return (
    <div ref={ref} className="not-prose my-6 flex justify-center">
      {/* widgets.js 로드 전/차단 시 폴백: 링크 카드 */}
      <blockquote className="twitter-tweet" data-dnt="true">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
        >
          X에서 보기 ↗ {url}
        </a>
      </blockquote>
    </div>
  );
}
