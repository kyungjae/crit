import Slugger from "github-slugger";
import type { Format } from "@/lib/schema";
import Markdown from "./markdown";
import TableOfContents from "./TableOfContents";

const PROSE = [
  "article-prose prose prose-neutral max-w-none dark:prose-invert",
  "prose-headings:tracking-tight prose-p:leading-[1.9] prose-li:leading-[1.85]",
  "prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-neutral-500 dark:prose-blockquote:text-neutral-400",
  "prose-a:text-brand prose-a:underline-offset-2",
  // Tailwind Typography가 인라인 코드에 붙이는 백틱 제거 + 칩 스타일
  "prose-code:before:content-none prose-code:after:content-none",
  "prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 dark:prose-code:bg-neutral-800",
  "prose-code:text-[0.85em] prose-code:font-medium prose-code:text-neutral-700 dark:prose-code:text-neutral-200",
].join(" ");

/** 코드블록 안의 #는 제목이 아니므로 제외하고 h2만 추출 */
function extractHeadings(markdown: string) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  const slugger = new Slugger();
  return [...withoutCode.matchAll(/^##\s+(.+)$/gm)].map((m) => {
    const text = m[1].replace(/[*_`]/g, "").trim();
    return { text, id: slugger.slug(text) };
  });
}

export function ArticleNavigation({ markdown }: { markdown: string }) {
  const headings = extractHeadings(markdown);
  if (headings.length < 3) return null;
  return <TableOfContents headings={headings} />;
}

/**
 * rules 포맷: `### 제목` 단위로 카드를 만들고 자동 번호를 붙인다.
 * 첫 `### ` 이전 내용은 도입부로 일반 렌더링한다.
 */
function RulesLayout({ markdown }: { markdown: string }) {
  const firstRule = markdown.search(/^### /m);
  const intro = firstRule === -1 ? markdown : markdown.slice(0, firstRule);
  const rest = firstRule === -1 ? "" : markdown.slice(firstRule);

  // `##`로 시작하는 상위 섹션은 규칙 카드 밖에서 일반 섹션으로 렌더링한다.
  // 덕분에 마지막 규칙이나 crit의 관점이 직전 카드 안에 합쳐지지 않는다.
  const tailStart = rest.search(/^## (?!#)/m);
  const ruleMarkdown = tailStart === -1 ? rest : rest.slice(0, tailStart);
  const tail = tailStart === -1 ? "" : rest.slice(tailStart);

  const rules = ruleMarkdown
    .split(/^### /m)
    .filter((chunk) => chunk.trim())
    .map((chunk) => {
      const nl = chunk.indexOf("\n");
      return nl === -1
        ? { title: chunk.trim(), body: "" }
        : { title: chunk.slice(0, nl).trim(), body: chunk.slice(nl + 1).trim() };
    });

  return (
    <div>
      {intro.trim() && (
        <div className={`${PROSE} mt-6`}>
          <Markdown>{intro.trim()}</Markdown>
        </div>
      )}

      <ol className="mt-6 flex flex-col gap-3">
        {rules.map((rule, i) => (
          <li
            key={i}
            className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80"
          >
            <div className="flex items-baseline gap-2.5">
              <span className="shrink-0 text-[13px] font-bold tabular-nums text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[15px] font-bold leading-snug tracking-tight text-neutral-900 dark:text-neutral-100">
                {rule.title}
              </h3>
            </div>
            {rule.body && (
              <div
                className={`${PROSE} prose-sm mt-2 pl-[30px] prose-p:leading-[1.7]`}
              >
                <Markdown>{rule.body}</Markdown>
              </div>
            )}
          </li>
        ))}
      </ol>

      {tail.trim() && (
        <div className={`${PROSE} mt-8`}>
          <Markdown>{tail.trim()}</Markdown>
        </div>
      )}
    </div>
  );
}

export default function ArticleBody({
  markdown,
  format = "brief",
}: {
  markdown: string;
  format?: Format;
}) {
  if (format === "rules") return <RulesLayout markdown={markdown} />;

  return (
    <>
      {(format === "deep" || format === "showcase") && (
        <div className="article-toc-mobile">
          <ArticleNavigation markdown={markdown} />
        </div>
      )}
      <div className={`${PROSE} mt-6`}>
        <Markdown bleed={format === "showcase"}>{markdown}</Markdown>
      </div>
    </>
  );
}
