"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/device";

type RatingData = {
  average: number | null;
  count: number;
  myScore: number | null;
};

export default function Rating({ slug }: { slug: string }) {
  const [data, setData] = useState<RatingData | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const deviceId = getDeviceId();
    fetch(
      `/api/ratings?slug=${encodeURIComponent(slug)}&deviceId=${encodeURIComponent(deviceId)}`
    )
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ average: null, count: 0, myScore: null }));
  }, [slug]);

  async function rate(score: number) {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, deviceId: getDeviceId(), score }),
      });
      if (res.ok) setData(await res.json());
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-neutral-700">
        이 아티클, 어땠나요?
      </h2>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex" role="radiogroup" aria-label="별점">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={data?.myScore === score}
              aria-label={`${score}점`}
              disabled={pending}
              onClick={() => rate(score)}
              className="p-1 text-2xl leading-none transition-transform active:scale-125"
            >
              <span
                className={
                  data?.myScore && score <= data.myScore
                    ? "text-amber-400"
                    : "text-neutral-300"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
        <span className="text-sm text-neutral-500">
          {data === null
            ? "…"
            : data.count > 0
              ? `평균 ${data.average} · ${data.count}명`
              : "첫 평가를 남겨보세요"}
        </span>
      </div>
    </section>
  );
}
