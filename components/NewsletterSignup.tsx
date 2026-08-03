"use client";

import { FormEvent, useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent }),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "구독 신청을 처리하지 못했습니다");
      }

      setStatus("success");
      setMessage(result.message ?? "확인 메일을 보냈어요.");
      setEmail("");
      setConsent(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <label htmlFor="newsletter-email" className="sr-only">
        이메일
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-2 text-[12px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-brand dark:!border-neutral-700 dark:!bg-neutral-950 dark:!text-neutral-100 dark:placeholder:text-neutral-500"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 rounded-full bg-neutral-950 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-brand disabled:cursor-wait disabled:opacity-60 dark:!bg-white dark:!text-neutral-950"
        >
          {status === "submitting" ? "신청 중" : "구독하기"}
        </button>
      </div>
      <label className="mt-3 flex gap-2 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 accent-brand"
        />
        <span>뉴스레터 수신에 동의합니다.</span>
      </label>
      {message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-[12px] ${
            status === "error"
              ? "text-red-600 dark:text-red-300"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
