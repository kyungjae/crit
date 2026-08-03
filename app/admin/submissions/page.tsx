import type { Metadata } from "next";

import SubmissionReview from "@/components/SubmissionReview";

export const metadata: Metadata = {
  title: "링크 제보 검수",
  robots: { index: false, follow: false },
};

export default function AdminSubmissionsPage() {
  return <SubmissionReview />;
}
