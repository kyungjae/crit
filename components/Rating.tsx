"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/device";

const MAX_CLAPS = 10;

type ClapData = {
  total: number;
  count: number;
  myClaps: number;
  maxClaps?: number;
  available?: boolean;
};

export default function Rating({ slug }: { slug: string }) {
  const [data, setData] = useState<ClapData | null>(null);
  const [pending, setPending] = useState(false);

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
    const maxClaps = data?.maxClaps ?? MAX_CLAPS;
    if ((data?.myClaps ?? 0) >= maxClaps) return;

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
  const maxClaps = data?.maxClaps ?? MAX_CLAPS;
  const disabled = pending || data?.available === false || myClaps >= maxClaps;

  return (
    <section>
      <h2 className="text-sm font-semibold text-neutral-700">
        이 글이 도움 됐다면 박수를 보내주세요
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-label="박수 보내기"
          disabled={disabled}
          onClick={clap}
          className="group inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition active:scale-95 enabled:hover:border-brand/40 enabled:hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            aria-hidden="true"
            className="text-xl leading-none transition-transform group-enabled:group-active:scale-125"
          >
            👏
          </span>
          <span>박수</span>
          <span className="tabular-nums text-brand">{data === null ? "…" : data.total}</span>
        </button>
        <span className="text-sm text-neutral-500">
          {data === null
            ? "불러오는 중…"
            : data.available === false
              ? "박수 기능은 준비 중이에요"
              : myClaps >= maxClaps
                ? `고마워요. 한 글에 최대 ${maxClaps}번까지 보낼 수 있어요.`
                : data.total > 0
                  ? `${data.count}명이 박수를 보냈어요 · 나는 ${myClaps}/${maxClaps}`
                  : "첫 박수를 보내보세요"}
        </span>
      </div>
    </section>
  );
}
