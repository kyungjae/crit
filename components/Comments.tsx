"use client";

import { useEffect, useMemo, useState } from "react";
import { getDeviceId } from "@/lib/device";
import { relativeTime } from "@/lib/format";

type Comment = {
  id: string;
  nickname: string;
  body: string;
  parentId: string | null;
  createdAt: string;
};

type CommentNode = Comment & { replies: CommentNode[] };

const NICKNAME_KEY = "crit:nickname";
const ROOT_DRAFT_KEY = "__root__";

function buildCommentTree(comments: Comment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach((comment) => {
    const node = nodes.get(comment.id);
    if (!node) return;

    if (comment.parentId && nodes.has(comment.parentId)) {
      nodes.get(comment.parentId)?.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [available, setAvailable] = useState(true);
  const [nickname, setNickname] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({ [ROOT_DRAFT_KEY]: "" });
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tree = useMemo(() => buildCommentTree(comments ?? []), [comments]);

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

  async function submit(e: React.FormEvent, parentId?: string) {
    e.preventDefault();

    const draftKey = parentId ?? ROOT_DRAFT_KEY;
    const body = drafts[draftKey] ?? "";
    if (pendingKey || !nickname.trim() || !body.trim()) return;

    setPendingKey(draftKey);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          nickname: nickname.trim(),
          body: body.trim(),
          parentId,
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
      setDrafts((prev) => ({ ...prev, [draftKey]: "" }));
      if (parentId) setReplyTo(null);
    } catch (e) {
      setError(
        (e as Error).message ||
          "댓글 등록에 실패했어요. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setPendingKey(null);
    }
  }

  function CommentForm({
    parentId,
    autoFocus = false,
    compact = false,
  }: {
    parentId?: string;
    autoFocus?: boolean;
    compact?: boolean;
  }) {
    const draftKey = parentId ?? ROOT_DRAFT_KEY;
    const pending = pendingKey === draftKey;

    return (
      <form
        onSubmit={(e) => submit(e, parentId)}
        className={`scroll-mb-32 flex flex-col gap-2 ${compact ? "mt-3" : "mt-4 pb-4"}`}
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
          value={drafts[draftKey] ?? ""}
          onChange={(e) =>
            setDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))
          }
          placeholder={parentId ? "답글을 남겨주세요" : "이 아티클에 대한 생각을 나눠주세요"}
          rows={compact ? 2 : 3}
          maxLength={1000}
          required
          autoFocus={autoFocus}
          className="min-h-24 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 sm:text-sm"
        />
        {error && pendingKey === null && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        <div className="flex gap-2 sm:self-end">
          {parentId && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="flex-1 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-600 dark:border-neutral-800 dark:text-neutral-300 sm:flex-none sm:py-2"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-950 sm:flex-none sm:py-2"
          >
            {pending ? "등록 중…" : parentId ? "답글 등록" : "댓글 등록"}
          </button>
        </div>
      </form>
    );
  }

  function CommentItem({ comment, depth = 0 }: { comment: CommentNode; depth?: number }) {
    const isReplying = replyTo === comment.id;

    return (
      <li>
        <article className="rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{comment.nickname}</span>
            <time className="text-xs text-neutral-400 dark:text-neutral-500">
              {relativeTime(comment.createdAt)}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {comment.body}
          </p>
          {available && (
            <button
              type="button"
              onClick={() => setReplyTo(isReplying ? null : comment.id)}
              className="mt-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              {isReplying ? "답글 닫기" : "답글"}
            </button>
          )}
          {isReplying && <CommentForm parentId={comment.id} autoFocus compact />}
        </article>

        {comment.replies.length > 0 && (
          <ul
            className={`mt-3 flex flex-col gap-3 border-l border-neutral-200 pl-3 dark:border-neutral-800 ${
              depth > 1 ? "ml-0" : "ml-4"
            }`}
          >
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
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
          tree.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        )}
      </ul>

      {!available && (
        <p className="mt-3 rounded-xl bg-neutral-100 p-3 text-xs text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          댓글 기능은 준비 중이에요. 곧 열릴 예정입니다.
        </p>
      )}

      {available && <CommentForm />}
    </section>
  );
}
