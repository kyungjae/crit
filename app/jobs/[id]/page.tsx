import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllJobs, getJob } from "@/lib/content";
import {
  EMPLOYMENT_TYPE_LABELS,
  JOB_RELATED_LINK_TYPE_LABELS,
  type Job,
} from "@/lib/schema";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return getAllJobs({ includeExpired: true }).map((job) => ({ id: job.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = getJob(id);
  if (!job) return {};
  return {
    title: `${job.company} — ${job.title}`,
    description: job.summary ?? `${job.company} ${job.title} 채용 공고`,
  };
}

function CompanyLogo({ job }: { job: Job }) {
  if (job.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={job.logo}
        alt={`${job.company} 로고`}
        className="size-16 rounded-2xl border border-neutral-200 bg-white object-contain p-2 dark:!border-neutral-800 dark:!bg-neutral-900"
      />
    );
  }

  return (
    <div className="flex size-16 items-center justify-center rounded-2xl bg-neutral-100 text-xl font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
      {job.company.slice(0, 1)}
    </div>
  );
}

function DetailSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:!border-neutral-800 dark:!bg-neutral-900/80">
      <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 marker:text-brand dark:text-neutral-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/jobs"
        className="mb-4 inline-flex text-sm font-medium text-neutral-500 underline underline-offset-2 dark:text-neutral-400"
      >
        ← 채용 목록
      </Link>

      <header className="rounded-3xl border border-neutral-200 bg-white p-5 dark:!border-neutral-800 dark:!bg-neutral-900/80">
        <div className="flex gap-4">
          <CompanyLogo job={job} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{job.company}</p>
            <h1 className="mt-1 text-2xl font-bold leading-snug tracking-[-0.02em]">
              {job.title}
            </h1>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
            {job.location}
          </span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
            {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
          </span>
          {job.experience && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
              {job.experience}
            </span>
          )}
          {job.salary && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">
              {job.salary}
            </span>
          )}
          <time className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
            게시 {formatDate(job.posted_at)}
          </time>
          {job.expires_at && (
            <time className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
              마감 {formatDate(job.expires_at)}
            </time>
          )}
        </div>

        {job.summary && (
          <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {job.summary}
          </p>
        )}

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-opacity active:opacity-80 dark:bg-brand dark:text-white dark:hover:bg-brand-dark"
        >
          실제 공고 보러가기 ↗
        </a>
      </header>

      {job.company_description && (
        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:!border-neutral-800 dark:!bg-neutral-900/80">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">회사 한눈에 보기</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {job.company_description}
          </p>
        </section>
      )}

      <div className="mt-4 flex flex-col gap-4">
        <DetailSection title="주요 업무 요약" items={job.responsibilities} />
        <DetailSection title="자격 요건" items={job.qualifications} />
        <DetailSection title="우대 사항" items={job.preferred} />
      </div>

      {job.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {job.related_links.length > 0 && (
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 dark:!border-neutral-800 dark:!bg-neutral-900/80">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            지원 전에 참고할 자료
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {job.related_links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl bg-neutral-50 p-3 active:bg-neutral-100 dark:bg-neutral-800/80 dark:active:bg-neutral-800"
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                    <span>{JOB_RELATED_LINK_TYPE_LABELS[link.type]}</span>
                    {link.source_name && <span>· {link.source_name}</span>}
                  </div>
                  <p className="text-sm font-semibold leading-snug text-neutral-800 dark:text-neutral-100">
                    {link.title}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
