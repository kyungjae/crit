/**
 * 소스 레지스트리(config/sources.json)를 돌면서 최근 새 글을 수집한다.
 *
 * 사용: npm run sources:check            # 최근 3일
 *      npm run sources:check -- --days 7
 *
 * 출력: 소스별 새 글 목록 (제목/링크/날짜). 이미 아티클로 다룬 URL은
 * [게시됨]으로 표시된다. feed가 null인 소스는 목록 하단에 "수동 확인"
 * 으로 안내한다. 네트워크/피드 오류는 해당 소스만 건너뛴다.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Parser from "rss-parser";

type Source = {
  id: string;
  name: string;
  type: "newsletter" | "media" | "vc" | "youtube" | "blog";
  lang: string;
  home: string;
  feed: string | null;
  youtube_handle?: string;
  default_category: string;
  note?: string;
};

const ROOT = process.cwd();
const args = process.argv.slice(2);
const daysIdx = args.indexOf("--days");
const DAYS = daysIdx >= 0 ? Number(args[daysIdx + 1]) || 3 : 3;
const since = Date.now() - DAYS * 24 * 60 * 60 * 1000;

const { sources } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "config", "sources.json"), "utf8")
) as { sources: Source[] };

// 이미 게시한 원문 URL 수집 (중복 방지)
const publishedUrls = new Set<string>();
const articlesDir = path.join(ROOT, "content", "articles");
if (fs.existsSync(articlesDir)) {
  for (const f of fs.readdirSync(articlesDir)) {
    if (!f.endsWith(".md")) continue;
    const { data } = matter(fs.readFileSync(path.join(articlesDir, f), "utf8"));
    if (data.source_url) publishedUrls.add(normalize(String(data.source_url)));
  }
}

function normalize(url: string): string {
  return url.replace(/\/+$/, "").replace(/^http:/, "https:").toLowerCase();
}

const SOURCE_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${ms / 1000}s 타임아웃`)), ms).unref()
    ),
  ]);
}

async function resolveYoutubeFeed(handle: string): Promise<string | null> {
  const res = await fetch(`https://www.youtube.com/${handle}`, {
    headers: { "user-agent": "Mozilla/5.0 (crit source checker)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(/"channelId":"(UC[\w-]+)"/);
  return m ? `https://www.youtube.com/feeds/videos.xml?channel_id=${m[1]}` : null;
}

const parser = new Parser({ timeout: 15000 });

type Result =
  | { kind: "items"; source: Source; lines: string[]; newCount: number }
  | { kind: "manual"; source: Source }
  | { kind: "failed"; source: Source; reason: string }
  | { kind: "empty"; source: Source };

async function checkSource(source: Source): Promise<Result> {
  let feedUrl = source.feed;

  try {
    if (!feedUrl && source.youtube_handle) {
      feedUrl = await withTimeout(
        resolveYoutubeFeed(source.youtube_handle),
        SOURCE_TIMEOUT_MS
      );
      if (!feedUrl) throw new Error("유튜브 채널 ID를 찾지 못함");
    }
    if (!feedUrl) return { kind: "manual", source };

    const feed = await withTimeout(parser.parseURL(feedUrl), SOURCE_TIMEOUT_MS);
    const fresh = (feed.items ?? []).filter((item) => {
      const t = item.isoDate ?? item.pubDate;
      return t ? new Date(t).getTime() >= since : false;
    });

    if (fresh.length === 0) return { kind: "empty", source };

    let newCount = 0;
    const lines = fresh.map((item) => {
      const url = item.link ?? "";
      const done = publishedUrls.has(normalize(url)) ? " [게시됨]" : "";
      if (!done) newCount++;
      const date = (item.isoDate ?? item.pubDate ?? "").slice(0, 10);
      return `- ${date} ${item.title}${done}\n  ${url}`;
    });
    return { kind: "items", source, lines, newCount };
  } catch (e) {
    return {
      kind: "failed",
      source,
      reason: (e as Error).message.slice(0, 80),
    };
  }
}

async function main() {
  console.log(`# 소스 체크 — 최근 ${DAYS}일\n`);

  const results = await Promise.all(sources.map(checkSource));

  const manual = results.filter((r) => r.kind === "manual");
  const failed = results.filter((r) => r.kind === "failed");
  let totalNew = 0;

  for (const r of results) {
    if (r.kind !== "items") continue;
    totalNew += r.newCount;
    console.log(`## ${r.source.name} (${r.source.type}, ${r.source.lang})`);
    for (const line of r.lines) console.log(line);
    console.log();
  }

  if (manual.length > 0) {
    console.log("## 수동 확인 필요 (피드 없음 — 홈에서 직접 확인)");
    for (const { source: s } of manual) {
      console.log(`- ${s.name}: ${s.home}${s.note ? ` — ${s.note}` : ""}`);
    }
    console.log();
  }

  if (failed.length > 0) {
    console.log("## 피드 오류 (건너뜀)");
    for (const { source, reason } of failed) {
      console.log(`- ${source.name}: ${reason}`);
    }
    console.log();
  }

  console.log(`총 새 글 후보: ${totalNew}건`);

  // 타임아웃으로 버려진 요청의 소켓이 이벤트 루프를 붙잡을 수 있으므로 명시적 종료
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
