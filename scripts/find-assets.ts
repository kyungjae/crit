/**
 * 케이스 스터디 페이지에서 이미지·영상 URL 후보를 추출한다.
 *
 * 사용: npm run assets:find -- https://www.pentagram.com/work/pfizer
 *
 * 이 스크립트는 네트워크가 열린 환경(GitHub Actions, 로컬 머신)에서 실행한다.
 * 결과 URL을 아티클 마크다운의 이미지/영상 자리에 넣으면 된다.
 * 저작권: 출처가 명확한 에셋만 쓰고 frontmatter의 credits에 밝힌다.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|svg)(\?|$)/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;

/** 로고·파비콘·트래킹 픽셀처럼 본문에 쓸 일 없는 것들 */
const NOISE =
  /favicon|sprite|logo-?(small|mono)|apple-touch|pixel|analytics|1x1|placeholder/i;

function absolute(url: string, base: string): string | null {
  try {
    return new URL(url.trim(), base).toString();
  } catch {
    return null;
  }
}

/** srcset에서 가장 큰 후보를 고른다 */
function largestFromSrcset(srcset: string, base: string): string | null {
  const entries = srcset
    .split(",")
    .map((part) => {
      const [url, descriptor = ""] = part.trim().split(/\s+/);
      const width = Number(descriptor.match(/^(\d+)w$/)?.[1] ?? 0);
      return { url, width };
    })
    .filter((e) => e.url)
    .sort((a, b) => b.width - a.width);
  return entries[0] ? absolute(entries[0].url, base) : null;
}

function collect(html: string, base: string) {
  const images = new Set<string>();
  const videos = new Set<string>();
  const hero = new Set<string>();

  const add = (raw: string | null) => {
    if (!raw || NOISE.test(raw)) return;
    if (VIDEO_EXT.test(raw)) videos.add(raw);
    else if (IMAGE_EXT.test(raw)) images.add(raw);
  };

  // og:image / twitter:image → 히어로 후보
  for (const re of [
    /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/gi,
  ]) {
    for (const m of html.matchAll(re)) {
      const url = absolute(m[1], base);
      if (url) hero.add(url);
    }
  }

  // srcset 우선 (가장 큰 해상도)
  for (const m of html.matchAll(/<(?:img|source)[^>]+srcset=["']([^"']+)["']/gi)) {
    add(largestFromSrcset(m[1], base));
  }
  // src / data-src (레이지 로딩)
  for (const m of html.matchAll(
    /<(?:img|source|video)[^>]+(?:data-src|data-image|src)=["']([^"']+)["']/gi
  )) {
    add(absolute(m[1], base));
  }
  // 인라인 JSON/스크립트 안의 에셋 URL (Next.js·Squarespace 등)
  for (const m of html.matchAll(
    /["'](https?:\/\/[^"'\s]+?\.(?:jpe?g|png|webp|avif|mp4|webm|mov))(?:\?[^"'\s]*)?["']/gi
  )) {
    add(m[1]);
  }

  return { hero: [...hero], images: [...images], videos: [...videos] };
}

async function main() {
  const urls = process.argv.slice(2);
  if (urls.length === 0) {
    console.error("사용법: npm run assets:find -- <URL> [URL...]");
    process.exit(1);
  }

  for (const target of urls) {
    console.log(`\n# ${target}`);
    try {
      const res = await fetch(target, {
        headers: { "user-agent": UA, accept: "text/html" },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        console.log(`  가져오기 실패: HTTP ${res.status}`);
        continue;
      }

      const { hero, images, videos } = collect(await res.text(), target);

      const section = (label: string, items: string[]) => {
        console.log(`\n## ${label} (${items.length})`);
        if (items.length === 0) console.log("  없음");
        items.slice(0, 30).forEach((u) => console.log(`  ${u}`));
        if (items.length > 30) console.log(`  … ${items.length - 30}건 더`);
      };

      section("히어로 후보 (og:image)", hero);
      section("이미지", images);
      section("영상", videos);
    } catch (e) {
      console.log(`  오류: ${(e as Error).message}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
