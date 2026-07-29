"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PublishResult = {
  ok?: boolean;
  message?: string;
  error?: string;
  method?: "github" | "local";
  commit?: string;
};

export default function DraftPublishButton({
  slug,
  title,
  warnings = [],
}: {
  slug: string;
  title: string;
  warnings?: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "publishing" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function publish(token?: string | null): Promise<Response> {
    return fetch("/api/admin/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-crit-admin-token": token } : {}),
      },
      body: JSON.stringify({ slug }),
    });
  }

  async function onClick() {
    const warningText = warnings.length
      ? `\n\n남은 경고: ${warnings.join(", ")}\n그래도 발행할까요?`
      : "";
    const confirmed = window.confirm(`‘${title}’ 초안을 발행할까요?${warningText}`);
    if (!confirmed) return;

    setStatus("publishing");
    setMessage(null);

    try {
      let token = window.localStorage.getItem("crit-admin-token");
      let response = await publish(token);

      if (response.status === 401) {
        token = window.prompt("발행 키를 입력하세요")?.trim() ?? "";
        if (!token) {
          setStatus("idle");
          return;
        }
        window.localStorage.setItem("crit-admin-token", token);
        response = await publish(token);
      }

      const result = (await response.json()) as PublishResult;

      if (!response.ok || !result.ok) {
        if (response.status === 401) window.localStorage.removeItem("crit-admin-token");
        throw new Error(result.error ?? "발행에 실패했습니다");
      }

      setStatus("done");
      setMessage(result.message ?? "발행 요청 완료");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "발행에 실패했습니다");
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={status === "publishing" || status === "done"}
        className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {status === "publishing" ? "발행 중…" : status === "done" ? "발행 요청됨" : "발행"}
      </button>
      {message && (
        <span
          className={`text-xs ${status === "error" ? "text-red-600" : "text-neutral-500"}`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
