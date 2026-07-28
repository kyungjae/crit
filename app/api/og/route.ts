import { NextRequest, NextResponse } from "next/server";

/**
 * 링크 카드용 OG 메타데이터 추출.
 * GET /api/og?url=https://...  →  { title, description, image, siteName }
 * 실패해도 200 + 빈 필드로 응답한다 (클라이언트는 도메인 폴백 카드 표시).
 */

const FETCH_TIMEOUT_MS = 6_000;
const MAX_HTML_BYTES = 600_000;

function pickMeta(html: string, keys: string[]): string | null {
  for (const key of keys) {
    // <meta property="og:title" content="..."> — 속성 순서 양쪽 지원
    const re1 = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    );
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i"
    );
    const m = html.match(re1) ?? html.match(re2);
    if (m) return decodeEntities(m[1]);
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url") ?? "";
  let url: URL;
  try {
    url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const empty = {
    title: null as string | null,
    description: null as string | null,
    image: null as string | null,
    siteName: url.hostname.replace(/^www\./, ""),
  };

  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; critbot/1.0; +https://crit-gamma.vercel.app)",
        accept: "text/html",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) {
      return withCache(NextResponse.json(empty));
    }

    const html = (await res.text()).slice(0, MAX_HTML_BYTES);
    const title =
      pickMeta(html, ["og:title", "twitter:title"]) ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
      null;

    let image = pickMeta(html, ["og:image", "twitter:image"]);
    if (image && image.startsWith("/")) image = `${url.origin}${image}`;
    if (image && !/^https?:\/\//.test(image)) image = null;

    return withCache(
      NextResponse.json({
        title: title ? decodeEntities(title) : null,
        description: pickMeta(html, ["og:description", "description"]),
        image,
        siteName: pickMeta(html, ["og:site_name"]) ?? empty.siteName,
      })
    );
  } catch {
    return withCache(NextResponse.json(empty));
  }
}

function withCache(res: NextResponse) {
  res.headers.set(
    "cache-control",
    "public, s-maxage=86400, stale-while-revalidate=604800"
  );
  return res;
}
