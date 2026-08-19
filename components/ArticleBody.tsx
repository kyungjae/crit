import Slugger from "github-slugger";
import type { Format } from "@/lib/schema";
import Markdown from "./markdown";

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

function TableOfContents({ markdown }: { markdown: string }) {
  const headings = extractHeadings(markdown);
  if (headings.length < 3) return null;

  return (
    <nav className="mt-8 border-l border-neutral-300 py-1 pl-4 dark:border-neutral-700">
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-brand">
        목차
      </p>
      <ol className="flex flex-col gap-2">
        {headings.map((h, i) => (
          <li key={h.id} className="flex gap-2.5 text-[13px] leading-snug">
            <span className="shrink-0 tabular-nums text-neutral-300 dark:!text-neutral-500">
              {i + 1}
            </span>
            <a
              href={`#${h.id}`}
              className="text-neutral-600 transition hover:text-brand dark:!text-neutral-300 dark:hover:!text-brand"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * rules 포맷: `### 제목` 단위로 카드를 만들고 자동 번호를 붙인다.
 * 첫 `### ` 이전 내용은 도입부로 일반 렌더링한다.
 */
function RulesLayout({ markdown }: { markdown: string }) {
  const firstRule = markdown.search(/^### /m);
  const intro = firstRule === -1 ? markdown : markdown.slice(0, firstRule);
  const rest = firstRule === -1 ? "" : markdown.slice(firstRule);

  const tailStart = rest.search(/^## (?!#)/m);
  const ruleMarkdown = tailStart === -1 ? rest : rest.slice(0, tailStart);
  const tail = tailStart === -1 ? "" : rest.slice(tailStart);

  // 09번은 카드 밖에 두되, 앞의 규칙과 같은 번호·제목 포맷으로 렌더링한다.
  const separateRuleMatch = tail.match(/^## 09\.\s+(.+?)(?:\n|$)([\s\S]*)$/);
  const separateRuleTitle = separateRuleMatch?.[1] ?? null;
  const separateRuleRest = separateRuleMatch?.[2] ?? "";
  const nextSectionStart = separateRuleRest.search(/^## (?!#)/m);
  const separateRuleBody = nextSectionStart === -1
    ? separateRuleRest
    : separateRuleRest.slice(0, nextSectionStart);
  const tailContent = nextSectionStart === -1
    ? ""
    : separateRuleRest.slice(nextSectionStart);

  const rules = ruleMarkdown
    .split(/^### /m)
    .filter((chunk) => chunk.trim())
    .map((chunk) => {
      const nl = chunk.indexOf("\n");
      const title = nl === -1 ? chunk.trim() : chunk.slice(0, nl).trim();
      const body = nl === -1 ? "" : chunk.slice(nl + 1).trim();

      // 규칙 카드가 번호를 자동으로 표시하므로 콘텐츠 제목의 번호는 한 번 제거한다.
      return {
        title: title.replace(/^\d{1,3}[.)]\s*/, ""),
        body,
      };
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
            className="border-0 bg-transparent py-2"
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

      {separateRuleTitle && (
        <section className="mt-8">
          <div className="flex items-baseline gap-2.5">
            <span className="shrink-0 text-[13px] font-bold tabular-nums text-brand">
              09
            </span>
            <h3 className="text-[15px] font-bold leading-snug tracking-tight text-neutral-900 dark:text-neutral-100">
              {separateRuleTitle}
            </h3>
          </div>
          {separateRuleBody.trim() && (
            <div className={`${PROSE} prose-sm mt-2 pl-[30px] prose-p:leading-[1.7]`}>
              <Markdown>{separateRuleBody.trim()}</Markdown>
            </div>
          )}
        </section>
      )}

      {tailContent.trim() && (
        <div className={`${PROSE} mt-8`}>
          <Markdown>{tailContent.trim()}</Markdown>
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
        <TableOfContents markdown={markdown} />
      )}
      <div className={`${PROSE} mt-6`}>
        <Markdown bleed={format === "showcase"}>{markdown}</Markdown>
      </div>
    </>
  );
}
