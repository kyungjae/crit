import Link from "next/link";
import type { Job } from "@/lib/schema";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/schema";
import { formatDate } from "@/lib/format";

function CompanyLogo({ job }: { job: Job }) {
  if (job.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={job.logo}
        alt={`${job.company} 로고`}
        className="size-11 rounded-xl border border-neutral-200 bg-white object-contain p-1.5 dark:border-neutral-800 dark:bg-neutral-900"
      />
    );
  }

  return (
    <div className="flex size-11 items-center justify-center rounded-xl bg-neutral-100 text-sm font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
      {job.company.slice(0, 1)}
    </div>
  );
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <li>
      <Link
        href={`/jobs/${job.id}`}
        className="block rounded-2xl border border-neutral-200 bg-white p-4 transition-colors active:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80 dark:active:bg-neutral-900"
      >
        <div className="flex gap-3">
          <CompanyLogo job={job} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {job.company}
              </span>
              <time className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                {formatDate(job.posted_at)}
              </time>
            </div>
            <h2 className="text-base font-semibold leading-snug">{job.title}</h2>
            {job.summary && (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {job.summary}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
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
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
