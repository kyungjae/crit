import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ThemeToggle from "@/components/ThemeToggle";
import { SITE_URL } from "@/lib/site";

const navItems = [
  { href: "/", label: "피드" },
  { href: "/jobs", label: "채용" },
  { href: "/links", label: "링크" },
  { href: "/slack", label: "Slack" },
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "crit — 디자인과 AI의 변화를 읽다",
    template: "%s | crit",
  },
  description:
    "디자인 사례부터 AI 도구, 제품, 브랜드, 디자인 시스템까지. 만드는 사람이 매일 확인할 만한 글을 모읍니다.",
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
        <Analytics />
        <GoogleAnalytics />
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-[21px] font-extrabold tracking-[-0.04em]"
              >
                crit<span className="text-brand">.</span>
              </Link>
              <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] font-medium text-neutral-400 dark:text-neutral-500 sm:inline">
                디자인과 AI의 변화를 읽다
              </span>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-5 md:px-6 md:pt-8">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
