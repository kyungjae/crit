import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: {
    default: "crit — 디자이너를 위한 데일리 큐레이션",
    template: "%s | crit",
  },
  description:
    "디자이너를 위한 뉴스, AI 워크플로우, 도구 추천, 채용 정보를 매일 큐레이션합니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6c5ce7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-dvh">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-extrabold tracking-tight">
              crit<span className="text-brand">.</span>
            </Link>
            <span className="text-xs text-neutral-400">
              디자이너를 위한 데일리 큐레이션
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
