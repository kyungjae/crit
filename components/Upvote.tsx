"use client";

import { useEffect, useRef, useState } from "react";
import { getDeviceId } from "@/lib/device";

type UpvoteData = {
  total: number;
  hasUpvoted: boolean;
  available?: boolean;
};

export function isUpvoteData(value: unknown): value is UpvoteData {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.hasUpvoted !== "boolean") return false;
  if (
    typeof v.total !== "number" ||
    !Number.isFinite(v.total) ||
    !Number.isInteger(v.total) ||
    v.total < 0
  )
    return false;
  if ("available" in v && typeof v.available !== "boolean") return false;
  return true;
}

type UpvoteButtonProps = {
  total: number;
  hasUpvoted: boolean;
  disabled?: boolean;
  onClick?: () => void;
  burstKey?: number;
};

export function UpvoteButton({
  total,
  hasUpvoted,
  disabled,
  onClick,
  burstKey = 0,
}: UpvoteButtonProps) {
  const selectedClasses =
    "border-brand bg-brand/10 text-brand dark:border-brand/70 dark:bg-brand/20";
  const idleClasses =
    "border-neutral-200 bg-white text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100";

  return (
    <button
      type="button"
      aria-label="업보트 전환"
      aria-pressed={hasUpvoted}
      disabled={disabled}
      onClick={onClick}
      className={`group relative inline-flex min-w-20 items-center justify-center gap-1.5 overflow-visible rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none enabled:hover:border-brand/40 enabled:hover:bg-brand/5 dark:enabled:hover:border-brand/50 dark:enabled:hover:bg-brand/10 ${hasUpvoted ? selectedClasses : idleClasses}`}
    >
      {burstKey > 0 && (
        <span
          key={burstKey}
          aria-hidden="true"
          className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 animate-upvote-burst text-base leading-none"
        >
          ▲
        </span>
      )}
      <span aria-hidden="true">▲</span>
      <span>업보트 {total}</span>
    </button>
  );
}

const UNAVAILABLE: UpvoteData = { total: 0, hasUpvoted: false, available: false };

export default function Upvote({ slug }: { slug: string }) {
  const [data, setData] = useState<UpvoteData | null>(null);
  const [pending, setPending] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [postError, setPostError] = useState<string | null>(null);
  const currentSlugRef = useRef(slug);
  const postRequestRef = useRef<{
    controller: AbortController;
    slug: string;
  } | null>(null);
  currentSlugRef.current = slug;

  useEffect(() => {
    setData(null);
    setPending(false);
    setPostError(null);
    setBurstKey(0);
    const controller = new AbortController();
    const deviceId = getDeviceId();
    fetch(
      `/api/upvotes?slug=${encodeURIComponent(slug)}&deviceId=${encodeURIComponent(deviceId)}`,
      { signal: controller.signal }
    )
      .then(async (r) => {
        if (!r.ok) throw new Error("non-ok");
        const json: unknown = await r.json();
        if (!isUpvoteData(json)) throw new Error("invalid-shape");
        return json;
      })
      .then((json) => setData(json))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setData(UNAVAILABLE);
      });
    return () => {
      controller.abort();
      if (postRequestRef.current?.slug === slug) {
        postRequestRef.current.controller.abort();
        postRequestRef.current = null;
      }
    };
  }, [slug]);

  async function toggle() {
    if (pending || data?.available === false) return;
    const request = { controller: new AbortController(), slug };
    postRequestRef.current = request;
    setPostError(null);
    setPending(true);
    try {
      const res = await fetch("/api/upvotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, deviceId: getDeviceId() }),
        signal: request.controller.signal,
      });
      if (
        postRequestRef.current !== request ||
        currentSlugRef.current !== request.slug
      )
        return;
      if (res.ok) {
        const json: unknown = await res.json();
        if (!isUpvoteData(json)) throw new Error("invalid-shape");
        if (
          postRequestRef.current !== request ||
          currentSlugRef.current !== request.slug
        )
          return;
        setData(json);
        setBurstKey((k) => k + 1);
      } else if (res.status === 503) {
        setData((prev) =>
          prev ? { ...prev, available: false } : UNAVAILABLE
        );
      } else {
        setPostError("잠시 후 다시 시도해주세요");
      }
    } catch (error) {
      if (
        (error instanceof Error && error.name === "AbortError") ||
        postRequestRef.current !== request ||
        currentSlugRef.current !== request.slug
      )
        return;
      setPostError("잠시 후 다시 시도해주세요");
    } finally {
      if (
        postRequestRef.current === request &&
        currentSlugRef.current === request.slug
      ) {
        postRequestRef.current = null;
        setPending(false);
      }
    }
  }

  const disabled = pending || data === null || data.available === false;

  return (
    <section>
      <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        도움이 됐다면 업보트해주세요
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <UpvoteButton
          total={data?.total ?? 0}
          hasUpvoted={data?.hasUpvoted ?? false}
          disabled={disabled}
          onClick={toggle}
          burstKey={burstKey}
        />
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {data === null
            ? "불러오는 중…"
            : postError !== null
              ? postError
              : data.available === false
                ? "업보트 기능은 준비 중이에요"
                : data.total > 0
                  ? `${data.total}명이 업보트했어요`
                  : "첫 업보트를 남겨보세요"}
        </span>
      </div>
    </section>
  );
}
