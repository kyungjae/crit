"use client";

import { useEffect, useState } from "react";

export default function SlackSetupPage() {
  const [teamName, setTeamName] = useState("");
  const [channels, setChannels] = useState<Array<{ id: string; name: string; is_private?: boolean }>>([]);
  const [channelId, setChannelId] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/slack/setup")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "채널을 읽지 못했습니다.");
        setTeamName(data.teamName ?? "Slack");
        setChannels(data.channels ?? []);
        setChannelId(data.selected ?? "");
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    const channel = channels.find((item) => item.id === channelId);
    if (!channel) return;
    setSaving(true);
    setError("");
    const response = await fetch("/api/slack/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channelId: channel.id, channelName: channel.name }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) return setError(data.error ?? "저장하지 못했습니다.");
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-3xl py-8 md:py-14">
      <div className="mb-8 flex items-center gap-3 text-sm">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f97316] text-lg font-black text-white">#</div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">Slack connection</p>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{teamName || "워크스페이스"}</p>
        </div>
      </div>

      <section className="rounded-[26px] border border-neutral-200 bg-white p-7 dark:border-neutral-800 dark:!bg-neutral-900 md:p-11">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">Step 02 / 02</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-neutral-950 dark:!text-neutral-50 md:text-4xl">받을 채널을 선택하세요</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-neutral-500 dark:text-neutral-400">
              crit의 데일리 digest를 어느 채널에 보낼지 정합니다. 공개 채널과 crit 봇이 이미 참여한 비공개 채널만 표시됩니다.
            </p>
          </div>
          {!error && !loading && <div className="hidden shrink-0 rounded-full bg-[#f97316]/10 px-3 py-1.5 text-xs font-bold text-[#f97316] dark:bg-[#f97316]/30 dark:text-orange-200 md:block">연결됨</div>}
        </div>

        <div className="mt-10">
          <label htmlFor="slack-channel" className="mb-2 block text-sm font-bold text-neutral-900 dark:!text-neutral-100">전송 채널</label>
          <div className="relative">
            <select
              id="slack-channel"
              className="w-full appearance-none rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3.5 pr-10 text-sm font-medium text-neutral-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              value={channelId}
              disabled={loading || !!error || saved}
              onChange={(event) => setChannelId(event.target.value)}
            >
              <option value="">{loading ? "채널을 불러오는 중..." : "채널을 선택하세요"}</option>
              {channels.map((channel) => <option key={channel.id} value={channel.id}>#{channel.name}{channel.is_private ? " · 비공개" : ""}</option>)}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">⌄</span>
          </div>
          {!loading && !error && channels.length === 0 && <p className="mt-3 text-xs text-neutral-500">선택할 수 있는 채널이 없습니다. Slack에서 crit 봇을 채널에 초대한 뒤 다시 시도해주세요.</p>}
        </div>

        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

        <div className="mt-8 flex flex-col-reverse gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">설정은 언제든 다시 바꿀 수 있습니다.</p>
          <button
            className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            disabled={!channelId || saving || saved}
            onClick={save}
          >
            {saved ? "설정 완료 ✓" : saving ? "저장하는 중..." : "이 채널로 설정"}
          </button>
        </div>

        {saved && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300">
            <strong>설정이 저장되었습니다.</strong> 환영 메시지와 최근 아티클 3개를 이 채널로 보냈습니다. 다음 데일리 digest부터도 이 채널로 전송됩니다.
          </div>
        )}
      </section>

      <div className="mt-5 flex items-center gap-2 px-1 text-xs text-neutral-500 dark:text-neutral-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Slack 권한은 메시지 작성과 채널 읽기에만 사용합니다.</div>
    </main>
  );
}
