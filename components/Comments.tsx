"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/device";
import { relativeTime } from "@/lib/format";

type Comment = {
  id: string;
  nickname: string;
  body: string;
  createdAt: string;
};

const NICKNAME_KEY = "crit:nickname";

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [available, setAvailable] = useState(true);
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNickname(localStorage.getItem(NICKNAME_KEY) ?? "");
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        setComments(d.comments ?? []);
        setAvailable(d.available !== false);
      })
      .catch(() => setComments([]));
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !nickname.trim() || !body.trim()) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          nickname: nickname.trim(),
          body: body.trim(),
          deviceId: getDeviceId(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error);
      }
      const { comment } = await res.json();
      localStorage.setItem(NICKNAME_KEY, nickname.trim());
      setComments((prev) => [...(prev ?? []), comment]);
      setBody("");
    } catch (e) {
      setError(
        (e as Error).message ||
          "댓글 등록에 실패했어요. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        댓글 {comments ? `${comments.length}` : ""}
      </h2>

      <ul className="mt-3 flex flex-col gap-3">
        {comments === null ? (
          <li className="text-sm text-neutral-400 dark:text-neutral-500">불러오는 중…</li>
        ) : comments.length === 0 ? (
          <li className="text-sm text-neutral-400 dark:text-neutral-500">
            첫 댓글을 남겨보세요.
          </li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{c.nickname}</span>
                <time className="text-xs text-neutral-400 dark:text-neutral-500">
                  {relativeTime(c.createdAt)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {c.body}
              </p>
            </li>
          ))
        )}
      </ul>

      {!available && (
        <p className="mt-3 rounded-xl bg-neutral-100 p-3 text-xs text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          댓글 기능은 준비 중이에요. 곧 열릴 예정입니다.
        </p>
      )}

      <form
        onSubmit={submit}
        className={`mt-4 scroll-mb-32 flex flex-col gap-2 pb-4 ${available ? "" : "hidden"}`}
      >
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          maxLength={20}
          required
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 sm:w-32 sm:text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="이 아티클에 대한 생각을 나눠주세요"
          rows={3}
          maxLength={1000}
          required
          className="min-h-32 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 sm:text-sm"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-950 sm:w-auto sm:self-end sm:py-2"
        >
          {pending ? "등록 중…" : "댓글 등록"}
        </button>
      </form>
    </section>
  );
}
