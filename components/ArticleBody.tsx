import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Element } from "hast";
import YouTubeEmbed from "./embeds/YouTubeEmbed";
import TweetEmbed from "./embeds/TweetEmbed";
import LinkCard from "./embeds/LinkCard";

/** 유튜브 URL이면 비디오 ID 반환 */
function youtubeId(url: string): string | null {
  const m = url.match(
    /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

/** X(트위터) 포스트 URL 여부 */
function isTweetUrl(url: string): boolean {
  return /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/.test(
    url
  );
}

/**
 * 문단이 "바로 그 URL 하나"만 담고 있으면 해당 URL을 반환.
 * 마크다운에서 유튜브/X 링크를 한 줄에 단독으로 쓰면 임베드로 렌더된다.
 */
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

export default function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-neutral mt-6 max-w-none prose-headings:tracking-tight prose-p:leading-[1.8] prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-neutral-500 prose-a:text-brand prose-img:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ node, children }) {
            const url = soleBareLink(node);
            if (url) {
              const yt = youtubeId(url);
              if (yt) return <YouTubeEmbed id={yt} />;
              if (isTweetUrl(url)) return <TweetEmbed url={url} />;
              return <LinkCard url={url} />;
            }
            return <p>{children}</p>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={typeof src === "string" ? src : ""}
                alt={alt ?? ""}
                loading="lazy"
              />
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
