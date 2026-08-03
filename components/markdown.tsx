import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { Element, ElementContent } from "hast";
import YouTubeEmbed from "./embeds/YouTubeEmbed";
import YouTubeTimestampLink from "./YouTubeTimestampLink";
import TweetEmbed from "./embeds/TweetEmbed";
import LinkCard from "./embeds/LinkCard";

function youtubeId(url: string): string | null {
  const m = url.match(
    /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

function isTweetUrl(url: string): boolean {
  return /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/.test(
    url
  );
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(url);
}

function youtubeTimestamp(url: string): number | null {
  if (!/^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//.test(url)) return null;
  try {
    const value = new URL(url).searchParams.get("t");
    if (!value) return null;
    const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
    if (!match) return null;
    return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
  } catch {
    return null;
  }
}

/**
 * bleed: showcase 포맷에서 이미지·영상이 모바일 화면 폭을 꽉 채우게 한다.
 * 컨테이너(px-4)를 벗어나되 640px 이상에서는 원래 폭 + 라운드로 돌아온다.
 */
const BLEED = "-mx-4 w-[calc(100%+2rem)] max-w-none sm:mx-0 sm:w-full";
const ROUNDED = "rounded-xl";
const BLEED_ROUNDED = "rounded-none sm:rounded-xl";

/** 자동재생 루프 비디오. 브랜드 케이스 스터디의 모션 컷용 */
function VideoEmbed({ src, bleed }: { src: string; bleed?: boolean }) {
  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      controls
      className={`not-prose my-6 bg-neutral-900 ${
        bleed ? `${BLEED} ${BLEED_ROUNDED}` : `w-full ${ROUNDED}`
      }`}
    />
  );
}

/** 문단이 URL 링크 하나만 담고 있으면 그 URL 반환 (임베드 판정용) */
function soleBareLink(node: Element | undefined): string | null {
  if (!node || node.children.length !== 1) return null;
  const child = node.children[0];
  if (child.type !== "element" || child.tagName !== "a") return null;
  const href = String(child.properties?.href ?? "");
  const text =
    child.children.length === 1 && child.children[0].type === "text"
      ? child.children[0].value
      : "";
  return href && text === href ? href : null;
}

type ImgInfo = { src: string; alt: string; title?: string };

/** 문단이 이미지들만 담고 있으면 이미지 목록 반환 */
function imagesOnly(node: Element | undefined): ImgInfo[] | null {
  if (!node) return null;
  const imgs: ImgInfo[] = [];
  for (const child of node.children as ElementContent[]) {
    if (child.type === "text" && !child.value.trim()) continue;
    if (child.type === "element" && child.tagName === "img") {
      imgs.push({
        src: String(child.properties?.src ?? ""),
        alt: String(child.properties?.alt ?? ""),
        title: child.properties?.title
          ? String(child.properties.title)
          : undefined,
      });
      continue;
    }
    return null;
  }
  return imgs.length > 0 ? imgs : null;
}

function Figure({
  src,
  alt,
  title,
  bleed,
}: ImgInfo & { bleed?: boolean }) {
  return (
    <figure className={`not-prose my-6 ${bleed ? BLEED : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full bg-neutral-100 dark:bg-neutral-800 ${bleed ? BLEED_ROUNDED : ROUNDED}`}
      />
      {(title || alt) && (
        <figcaption
          className={`mt-2 text-center text-xs leading-relaxed text-neutral-400 dark:text-neutral-500 ${
            bleed ? "px-4 sm:px-0" : ""
          }`}
        >
          {title || alt}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * 이미지 여러 장이 한 문단에 → 그리드.
 * 2장이면 before/after 비교, 3장 이상은 갤러리.
 * bleed는 그리드 컨테이너에만 적용한다 (자식에 적용하면 그리드를 넘친다).
 */
function ImageGrid({
  images,
  bleed,
}: {
  images: ImgInfo[];
  bleed?: boolean;
}) {
  return (
    <div
      className={`not-prose my-6 grid gap-2 ${
        images.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
      } ${bleed ? BLEED : ""}`}
    >
      {images.map((img, i) => (
        <figure key={i} className="min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className={`w-full bg-neutral-100 dark:bg-neutral-800 ${
              bleed ? "rounded-none sm:rounded-lg" : "rounded-lg"
            }`}
          />
          {img.alt && (
            <figcaption className="mt-1.5 px-1 text-center text-[11px] font-medium leading-snug text-neutral-500 dark:text-neutral-400">
              {img.alt}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

const CALLOUTS = {
  TIP: { label: "팁", className: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30" },
  NOTE: { label: "참고", className: "border-sky-200 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/30" },
  WARNING: { label: "주의", className: "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30" },
  IMPORTANT: { label: "중요", className: "border-violet-200 bg-violet-50/60 dark:border-violet-900 dark:bg-violet-950/30" },
} as const;

/** GFM alert 문법: > [!TIP] */
function calloutKind(node: Element | undefined): keyof typeof CALLOUTS | null {
  const first = node?.children.find(
    (c): c is Element => c.type === "element" && c.tagName === "p"
  );
  const text = first?.children.find((c) => c.type === "text");
  if (text?.type !== "text") return null;
  const m = text.value.match(/^\[!(TIP|NOTE|WARNING|IMPORTANT)\]\s*/);
  return m ? (m[1] as keyof typeof CALLOUTS) : null;
}

/**
 * 콜아웃 본문에서 첫 [!TIP] 마커만 제거.
 * children은 문자열이 아니라 React 엘리먼트 트리이므로 재귀 탐색이 필요하다.
 */
function stripMarker(children: React.ReactNode): React.ReactNode {
  let done = false;

  const walk = (node: React.ReactNode): React.ReactNode => {
    if (done) return node;

    if (typeof node === "string") {
      const m = node.match(/^\s*\[!(TIP|NOTE|WARNING|IMPORTANT)\]\s*/);
      if (m) {
        done = true;
        return node.slice(m[0].length);
      }
      return node;
    }
    if (Array.isArray(node)) return node.map(walk);
    if (React.isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      if (el.props.children === undefined) return node;
      return React.cloneElement(el, { children: walk(el.props.children) });
    }
    return node;
  };

  return walk(children);
}

const createComponents = (bleed: boolean): Components => ({
  p({ node, children }) {
    const url = soleBareLink(node);
    if (url) {
      const yt = youtubeId(url);
      if (yt) return <YouTubeEmbed id={yt} />;
      if (isTweetUrl(url)) return <TweetEmbed url={url} />;
      if (isVideoUrl(url)) return <VideoEmbed src={url} bleed={bleed} />;
      return <LinkCard url={url} />;
    }

    const imgs = imagesOnly(node);
    if (imgs?.length === 1) return <Figure {...imgs[0]} bleed={bleed} />;
    if (imgs && imgs.length >= 2)
      return <ImageGrid images={imgs} bleed={bleed} />;

    return <p>{children}</p>;
  },
  blockquote({ node, children }) {
    const kind = calloutKind(node);
    if (!kind) return <blockquote>{children}</blockquote>;
    const { label, className } = CALLOUTS[kind];
    return (
      <div
        className={`not-prose my-5 rounded-xl border px-4 py-3 ${className}`}
      >
        <p className="mb-1 text-[11px] font-bold tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <div className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200 [&>p]:m-0 [&>p+p]:mt-2">
          {stripMarker(children)}
        </div>
      </div>
    );
  },
  a({ href, children }) {
    const external = typeof href === "string" && /^https?:/.test(href);
    const timestamp = typeof href === "string" ? youtubeTimestamp(href) : null;
    if (timestamp !== null) {
      return <YouTubeTimestampLink seconds={timestamp}>{children}</YouTubeTimestampLink>;
    }
    return (
      <a
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : undefined)}
      >
        {children}
      </a>
    );
  },
  img({ src, alt, title }) {
    return (
      <Figure
        src={typeof src === "string" ? src : ""}
        alt={alt ?? ""}
        title={title}
        bleed={bleed}
      />
    );
  },
  table({ children }) {
    return (
      <div className="-mx-4 overflow-x-auto px-4">
        <table>{children}</table>
      </div>
    );
  },
});

const defaultComponents = createComponents(false);
const bleedComponents = createComponents(true);

export default function Markdown({
  children,
  bleed = false,
}: {
  children: string;
  bleed?: boolean;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={bleed ? bleedComponents : defaultComponents}
    >
      {children}
    </ReactMarkdown>
  );
}
