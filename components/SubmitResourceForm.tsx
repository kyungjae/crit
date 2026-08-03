"use client";

import { FormEvent, useState } from "react";

import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_LABELS,
} from "@/lib/submissions";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function SubmitResourceForm() {
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!category) {
      setStatus("error");
      setMessage("리소스 카테고리를 선택해주세요");
      return;
    }

    setStatus("submitting");
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const payload = { ...Object.fromEntries(form.entries()), category };

    try {
      const response = await fetch("/api/resource-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "리소스를 접수하지 못했습니다");

      event.currentTarget.reset();
      setCategory("");
      setStatus("success");
      setMessage("리소스가 접수됐어요. 검수 후 링크 페이지에 반영하겠습니다.");
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
        <label htmlFor="resource-url" className="text-sm font-semibold">
          리소스 URL <span className="text-brand">*</span>
        </label>
        <input
          id="resource-url"
          name="url"
          type="url"
          required
          placeholder="https://example.com"
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:!border-neutral-700 dark:!bg-neutral-950"
        />
      </div>

      <div>
        <label htmlFor="resource-name" className="text-sm font-semibold">
          리소스 이름 <span className="text-brand">*</span>
        </label>
        <input
          id="resource-name"
          name="name"
          required
          maxLength={80}
          placeholder="예: Mobbin"
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:!border-neutral-700 dark:!bg-neutral-950"
        />
      </div>

      <div>
        <label htmlFor="resource-description" className="text-sm font-semibold">
          한 줄 설명 <span className="text-brand">*</span>
        </label>
        <input
          id="resource-description"
          name="description"
          required
          minLength={10}
          maxLength={500}
          placeholder="어떤 상황에서 유용한 리소스인지 알려주세요."
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:!border-neutral-700 dark:!bg-neutral-950"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">
          링크 카테고리 <span className="text-brand">*</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {RESOURCE_CATEGORIES.map((value) => {
            const isSelected = category === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setCategory(isSelected ? "" : value)}
                className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                  isSelected
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-neutral-200 text-neutral-600 hover:border-brand/50 dark:!border-neutral-700 dark:text-neutral-300"
                }`}
              >
                {RESOURCE_CATEGORY_LABELS[value]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="resource-name-submitter" className="text-sm font-semibold">
            이름 <span className="font-normal text-neutral-400">(선택)</span>
          </label>
          <input
            id="resource-name-submitter"
            name="submitterName"
            maxLength={40}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:!border-neutral-700 dark:!bg-neutral-950"
          />
        </div>
        <div>
          <label htmlFor="resource-email" className="text-sm font-semibold">
            이메일 <span className="font-normal text-neutral-400">(선택)</span>
          </label>
          <input
            id="resource-email"
            name="submitterEmail"
            type="email"
            maxLength={254}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:!border-neutral-700 dark:!bg-neutral-950"
          />
        </div>
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
          {status === "submitting" ? "접수 중…" : "링크 추가하기"}
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
