"use client";

import { useEffect, useState } from "react";

type OgData = {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string;
};

export default function LinkCard({ url }: { url: string }) {
  const [data, setData] = useState<OgData | null>(null);
  const domain = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();

  useEffect(() => {
    fetch(`/api/og?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null));
  }, [url]);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose my-6 flex overflow-hidden rounded-xl border border-neutral-200 bg-white no-underline transition-colors active:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80 dark:active:bg-neutral-900"
    >
      <div className="min-w-0 flex-1 p-3.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
          {data?.title ?? domain}
        </p>
        {data?.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {data.description}
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
          {data?.siteName ?? domain} ↗
        </p>
      </div>
      {data?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.image}
          alt=""
          loading="lazy"
          className="w-28 shrink-0 object-cover sm:w-40"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </a>
  );
}
