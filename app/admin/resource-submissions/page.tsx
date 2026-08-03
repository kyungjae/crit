import type { Metadata } from "next";

import ResourceSubmissionReview from "@/components/ResourceSubmissionReview";

export const metadata: Metadata = {
  title: "링크 추가 검수",
  robots: { index: false, follow: false },
};

export default function AdminResourceSubmissionsPage() {
  return <ResourceSubmissionReview />;
}
