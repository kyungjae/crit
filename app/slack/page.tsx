export default async function SlackPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="mb-3 text-sm font-medium text-neutral-500">crit Slack Bot</p>
      <h1 className="mb-5 text-4xl font-semibold tracking-tight">새 글을 Slack에서 받아보세요</h1>
      <p className="mb-8 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
        하루 한 번 crit에 올라온 글을 제목 링크와 bullet 요약으로 팀 채널에 전달합니다.
      </p>
      {params.error && <p className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">Slack 설치가 취소되었습니다: {params.error}</p>}
      <a className="inline-flex rounded-lg bg-[#4A154B] px-5 py-3 font-medium text-white hover:opacity-90" href="/api/slack/install">
        Add to Slack
      </a>
      <p className="mt-5 text-sm text-neutral-500">설치 후 메시지를 받을 채널을 선택합니다.</p>
    </main>
  );
}
