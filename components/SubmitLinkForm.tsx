"use client";

import { FormEvent, useState } from "react";

import { CATEGORIES, CATEGORY_LABELS } from "@/lib/schema";
import { SUBMISSION_REASONS } from "@/lib/submissions";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function SubmitLinkForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage(null);

    const form = new FormData(event.currentTarget);
    if (selectedReasons.length === 0) {
      setStatus("error");
      setMessage("추천 이유를 하나 이상 선택해주세요");
      return;
    }
    const payload = {
      ...Object.fromEntries(form.entries()),
      reasons: selectedReasons,
      category: selectedCategory,
    };

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(result.error ?? "제보를 접수하지 못했습니다");

      event.currentTarget.reset();
      setSelectedReasons([]);
      setSelectedCategory("");
      setStatus("success");
      setMessage("제보가 접수됐어요. 검수 후 피드에 반영하겠습니다.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 dark:!border-neutral-800 dark:!bg-neutral-900/80"
    >
      <div>
        <label htmlFor="submission-url" className="text-sm font-semibold">
          링크 URL <span className="text-brand">*</span>
        </label>
        <input
          id="submission-url"
          name="url"
          type="url"
          required
          placeholder="https://example.com/article"
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:!border-neutral-700 dark:!bg-neutral-950"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">
          왜 추천하나요? <span className="text-brand">*</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUBMISSION_REASONS.map((reason) => {
            const isSelected = selectedReasons.includes(reason.value);
            return (
              <button
                key={reason.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  setSelectedReasons((current) =>
                    isSelected
                      ? current.filter((value) => value !== reason.value)
                      : current.length < 3
                        ? [...current, reason.value]
                        : current
                  )
                }
                className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                  isSelected
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-neutral-200 text-neutral-600 hover:border-brand/50 dark:!border-neutral-700 dark:text-neutral-300"
                }`}
              >
                {reason.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-neutral-400">최대 3개까지 선택할 수 있어요.</p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-semibold">카테고리</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(isSelected ? "" : category)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                    isSelected
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-neutral-200 text-neutral-600 hover:border-brand/50 dark:!border-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="submission-name" className="text-sm font-semibold">
            이름 <span className="font-normal text-neutral-400">(선택)</span>
          </label>
          <input
            id="submission-name"
            name="submitterName"
            maxLength={40}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:!border-neutral-700 dark:!bg-neutral-950"
          />
        </div>
      </div>

      <div>
        <label htmlFor="submission-email" className="text-sm font-semibold">
          답변받을 이메일 <span className="font-normal text-neutral-400">(선택)</span>
        </label>
        <input
          id="submission-email"
          name="submitterEmail"
          type="email"
          maxLength={254}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:!border-neutral-700 dark:!bg-neutral-950"
        />
      </div>

      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand dark:hover:bg-brand-dark"
        >
          {status === "submitting" ? "접수 중…" : "링크 제보하기"}
        </button>
        {message && (
          <p
            role="status"
            className={`text-sm ${
              status === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
