"use client";

import { useEffect, useState } from "react";

export default function SlackSetupPage() {
  const [teamName, setTeamName] = useState("");
  const [channels, setChannels] = useState<Array<{ id: string; name: string; is_private?: boolean }>>([]);
  const [channelId, setChannelId] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/slack/setup")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "채널을 읽지 못했습니다.");
        setTeamName(data.teamName ?? "Slack");
        setChannels(data.channels ?? []);
        setChannelId(data.selected ?? "");
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function save() {
    const channel = channels.find((item) => item.id === channelId);
    if (!channel) return;
    const response = await fetch("/api/slack/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channelId: channel.id, channelName: channel.name }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? "저장하지 못했습니다.");
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <p className="mb-3 text-sm font-medium text-neutral-500">{teamName || "Slack"}</p>
      <h1 className="mb-4 text-3xl font-semibold">받을 채널을 선택하세요</h1>
      <p className="mb-8 text-neutral-600 dark:text-neutral-300">공개 채널과 봇이 참여한 비공개 채널만 표시됩니다.</p>
      {error && <p className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <select className="mb-5 w-full rounded-lg border border-neutral-300 bg-transparent p-3" value={channelId} onChange={(event) => setChannelId(event.target.value)}>
        <option value="">채널 선택</option>
        {channels.map((channel) => <option key={channel.id} value={channel.id}>#{channel.name}{channel.is_private ? " (비공개)" : ""}</option>)}
      </select>
      <button className="rounded-lg bg-black px-5 py-3 font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black" disabled={!channelId || saved} onClick={save}>
        {saved ? "설정 완료" : "이 채널로 설정"}
      </button>
      {saved && <p className="mt-5 text-sm text-green-700">설정이 저장되었습니다. 다음 데일리 digest부터 이 채널로 전송됩니다.</p>}
    </main>
  );
}
