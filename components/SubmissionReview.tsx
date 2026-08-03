"use client";

import { useCallback, useEffect, useState } from "react";

type SubmissionStatus = "pending" | "reviewed" | "rejected" | "published";
type FilterStatus = SubmissionStatus | "all";

type Submission = {
  id: string;
  url: string;
  note: string;
  category: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  status: SubmissionStatus;
  reviewerNote: string | null;
  createdAt: string;
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "검수 대기",
  reviewed: "검토 완료",
  rejected: "반려",
  published: "게시됨",
};

function statusClass(status: SubmissionStatus) {
  if (status === "rejected") return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";
  if (status === "published") return "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300";
  if (status === "reviewed") return "bg-brand/10 text-brand";
  return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
}

export default function SubmissionReview() {
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const request = useCallback(async (token: string | null, nextFilter: FilterStatus) => {
    const query = nextFilter === "all" ? "all" : nextFilter;
    const response = await fetch(`/api/admin/submissions?status=${query}`, {
      headers: token ? { "x-crit-admin-token": token } : undefined,
    });

    if (response.status === 401) {
      const nextToken = window.prompt("관리자 키를 입력하세요")?.trim() ?? "";
      if (!nextToken) throw new Error("관리자 키가 필요합니다");
      window.localStorage.setItem("crit-admin-token", nextToken);
      return request(nextToken, nextFilter);
    }

    const result = (await response.json()) as { submissions?: Submission[]; error?: string };
    if (!response.ok) throw new Error(result.error ?? "제보 목록을 불러오지 못했습니다");
    return result.submissions ?? [];
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const token = window.localStorage.getItem("crit-admin-token");
      setSubmissions(await request(token, filter));
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "제보 목록을 불러오지 못했습니다");
    }
  }, [filter, request]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, nextStatus: Exclude<SubmissionStatus, "pending">) {
    const token = window.localStorage.getItem("crit-admin-token");
    const response = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-crit-admin-token": token } : {}),
      },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error ?? "상태를 변경하지 못했습니다");
      return;
    }
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">링크 제보 검수</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            제보를 확인한 뒤 검토 완료 또는 반려로 분류합니다.
          </p>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as FilterStatus)}
          className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm dark:!border-neutral-800 dark:!bg-neutral-900"
        >
          <option value="pending">검수 대기</option>
          <option value="reviewed">검토 완료</option>
          <option value="rejected">반려</option>
          <option value="all">전체</option>
        </select>
      </div>

      {status === "error" && (
        <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {message}
        </p>
      )}

      {status === "loading" ? (
        <p className="py-16 text-center text-sm text-neutral-400">불러오는 중…</p>
      ) : submissions.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">해당 제보가 없습니다.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 dark:!border-neutral-800 dark:!bg-neutral-900/80"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-semibold text-brand hover:underline"
                  >
                    {submission.url}
                  </a>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                    {submission.note}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(submission.status)}`}>
                  {STATUS_LABELS[submission.status]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400">
                {submission.category && <span>{submission.category}</span>}
                {submission.submitterName && <span>{submission.submitterName}</span>}
                {submission.submitterEmail && <span>{submission.submitterEmail}</span>}
                <time dateTime={submission.createdAt}>
                  {new Date(submission.createdAt).toLocaleString("ko-KR")}
                </time>
              </div>
              {submission.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void updateStatus(submission.id, "reviewed")}
                    className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand dark:bg-brand"
                  >
                    검토 완료
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateStatus(submission.id, "rejected")}
                    className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-red-300 hover:text-red-600 dark:!border-neutral-700 dark:text-neutral-300"
                  >
                    반려
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
