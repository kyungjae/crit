"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/device";

type ClapData = {
  total: number;
  count: number;
  myClaps: number;
  available?: boolean;
};

export default function Rating({ slug }: { slug: string }) {
  const [data, setData] = useState<ClapData | null>(null);
  const [pending, setPending] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    const deviceId = getDeviceId();
    fetch(
      `/api/ratings?slug=${encodeURIComponent(slug)}&deviceId=${encodeURIComponent(deviceId)}`
    )
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ total: 0, count: 0, myClaps: 0 }));
  }, [slug]);

  async function clap() {
    if (pending || data?.available === false) return;

    setBurstKey((key) => key + 1);
    setPending(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, deviceId: getDeviceId() }),
      });
      if (res.ok) setData(await res.json());
    } finally {
      setPending(false);
    }
  }

  const myClaps = data?.myClaps ?? 0;
  const disabled = pending || data?.available === false;

  return (
    <section>
      <h2 className="text-sm font-semibold text-neutral-700">
        도움이 됐다면 가볍게 눌러주세요
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-label="반응 보내기"
          disabled={disabled}
          onClick={clap}
          className="group relative inline-flex min-w-20 items-center justify-center gap-2 overflow-visible rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition active:scale-95 enabled:hover:border-brand/40 enabled:hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {burstKey > 0 ? (
            <span
              key={burstKey}
              aria-hidden="true"
              className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 animate-clap-burst text-xl leading-none"
            >
              👏
            </span>
          ) : null}
          <span
            aria-hidden="true"
            className="text-xl leading-none transition-transform group-enabled:group-active:scale-125"
          >
            👏
          </span>
          <span className="tabular-nums text-brand">
            {data === null ? "…" : data.total}
          </span>
        </button>
        <span className="text-sm text-neutral-500">
          {data === null
            ? "불러오는 중…"
            : data.available === false
              ? "반응 기능은 준비 중이에요"
              : data.total > 0
                ? `${data.count}명이 눌렀어요 · 나는 ${myClaps}번`
                : "첫 반응을 남겨보세요"}
        </span>
      </div>
    </section>
  );
}
