import type { Job } from "@/lib/schema";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/schema";
import { formatDate } from "@/lib/format";

export default function JobCard({ job }: { job: Job }) {
  return (
    <li>
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl border border-neutral-200 bg-white p-4 transition-colors active:bg-neutral-50"
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-neutral-500">
            {job.company}
          </span>
          <time className="shrink-0 text-xs text-neutral-400">
            {formatDate(job.posted_at)}
          </time>
        </div>
        <h2 className="text-base font-semibold leading-snug">{job.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
          <span className="rounded-full bg-neutral-100 px-2 py-0.5">
            {job.location}
          </span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5">
            {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
          </span>
          {job.experience && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5">
              {job.experience}
            </span>
          )}
          {job.salary && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">
              {job.salary}
            </span>
          )}
        </div>
      </a>
    </li>
  );
}
