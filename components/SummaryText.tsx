type SummaryTextProps = {
  summary: string;
  maxBulletItems?: number;
};

export function SummaryText({ summary, maxBulletItems }: SummaryTextProps) {
  const lines = summary.trim().split(/\r?\n/).filter(Boolean);
  const isBulletSummary = lines.length > 0 && lines.every((line) => line.trimStart().startsWith("•"));

  if (!isBulletSummary) {
    return <>{summary}</>;
  }

  return (
    <>
      {lines.slice(0, maxBulletItems ?? lines.length).map((line) => (
        <span
          key={line}
          className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2"
        >
          <span aria-hidden="true">•</span>
          <span>{line.trimStart().slice(1).trimStart()}</span>
        </span>
      ))}
    </>
  );
}
