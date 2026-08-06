"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SaveResult = { ok?: boolean; message?: string; error?: string };

export default function DraftEditor({
  slug,
  initialTitle,
  initialSummary,
  initialBody,
}: {
  slug: string;
  initialTitle: string;
  initialSummary: string;
  initialBody: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function save(): Promise<Response> {
    return fetch("/api/admin/update-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug, title, summary, body }),
    });
  }

  async function onSave() {
    setStatus("saving");
    setMessage(null);
    try {
      const response = await save();

      const result = (await response.json()) as SaveResult;
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "초안 저장에 실패했습니다");
      }
      setStatus("saved");
      setMessage(result.message ?? "저장했습니다");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "초안 저장에 실패했습니다");
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-brand/25 bg-brand/[0.035] p-4 dark:border-brand/35 dark:bg-brand/[0.06]">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">Edit draft</p>
          <h3 className="mt-1 text-base font-bold tracking-tight">이 초안을 직접 편집</h3>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Markdown 본문을 지원합니다</p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-neutral-600 dark:text-neutral-300">제목</span>
          <input
            value={title}
            onChange={(event) => { setTitle(event.target.value); setStatus("idle"); }}
            maxLength={120}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-900 outline-none ring-brand/30 transition placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-neutral-600 dark:text-neutral-300">요약</span>
          <textarea
            value={summary}
            onChange={(event) => { setSummary(event.target.value); setStatus("idle"); }}
            maxLength={300}
            rows={2}
            className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-neutral-900 outline-none ring-brand/30 transition placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-neutral-600 dark:text-neutral-300">본문</span>
          <textarea
            value={body}
            onChange={(event) => { setBody(event.target.value); setStatus("idle"); }}
            rows={20}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3 py-3 font-mono text-[13px] leading-[1.75] text-neutral-900 outline-none ring-brand/30 transition placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={status === "saving"}
          className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-neutral-300 dark:bg-brand dark:hover:bg-brand-dark dark:disabled:bg-neutral-800"
        >
          {status === "saving" ? "저장 중…" : "초안 저장"}
        </button>
        <span className={`text-xs ${status === "error" ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400"}`}>
          {message ?? "저장하면 GitHub 커밋을 만들고, 로컬에서는 파일에 바로 반영합니다."}
        </span>
      </div>
    </section>
  );
}
