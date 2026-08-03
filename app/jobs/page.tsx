import type { Metadata } from "next";
import { getAllJobs } from "@/lib/content";
import JobCard from "@/components/JobCard";

export const metadata: Metadata = {
  title: "채용",
  description: "디자이너 채용 공고 큐레이션",
};

export default function JobsPage() {
  const jobs = getAllJobs();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-xl font-bold">채용</h1>
      <p className="mb-4 text-sm text-neutral-500">
        매일 업데이트되는 디자이너 채용 공고
      </p>
      {jobs.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">
          현재 등록된 공고가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </ul>
      )}
    </div>
  );
}
