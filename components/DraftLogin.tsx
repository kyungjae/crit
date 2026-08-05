"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function DraftLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error ?? "로그인에 실패했습니다");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm py-20">
      <h1 className="mb-2 text-xl font-bold">초안 검수</h1>
      <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">검수용 비밀번호를 입력하세요.</p>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand/30 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="submit"
          disabled={loading || !password}
          className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand"
        >
          {loading ? "확인 중…" : "입장"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </main>
  );
}
