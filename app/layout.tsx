import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "crit — 디자이너를 위한 읽을거리 피드",
    template: "%s | crit",
  },
  description:
    "디자이너가 오늘 봐야 할 디자인, 제품, AI, 툴, 케이스, 커리어 글을 빠르게 훑고 토론하는 피드입니다.",
  openGraph: {
    siteName: "crit",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem('crit:theme:v2');
    var dark = saved !== 'light';
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (_) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-[21px] font-extrabold tracking-[-0.04em]"
              >
                crit<span className="text-brand">.</span>
              </Link>
              <HeaderNav />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-5 md:px-6 md:pt-8">{children}</main>
        <Footer />
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
