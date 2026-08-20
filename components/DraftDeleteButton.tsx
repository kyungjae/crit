"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteResult = { ok?: boolean; message?: string; error?: string };

export default function DraftDeleteButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "deleting" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    const confirmed = window.confirm(
      `‘${title}’ 초안을 삭제할까요?\n\n삭제한 초안은 복구할 수 없습니다.`
    );
    if (!confirmed) return;

    setStatus("deleting");
    setMessage(null);

    try {
      const request = () =>
        fetch("/api/admin/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slug }),
        });

      const response = await request();

      const result = (await response.json()) as DeleteResult;
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "삭제에 실패했습니다");
      }

      setStatus("done");
      setMessage(result.message ?? "삭제 요청 완료");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "삭제에 실패했습니다");
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={status === "deleting" || status === "done"}
        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 dark:disabled:border-neutral-800 dark:disabled:text-neutral-600"
      >
        {status === "deleting" ? "삭제 중…" : status === "done" ? "삭제 요청됨" : "삭제"}
      </button>
      {message && (
        <span
          className={`text-xs ${status === "error" ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400"}`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
