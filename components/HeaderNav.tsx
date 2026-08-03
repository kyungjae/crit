"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "피드" },
  { href: "/ask", label: "Ask" },
  { href: "/show", label: "Show" },
  { href: "/jobs", label: "채용" },
  { href: "/links", label: "링크" },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/" || pathname.startsWith("/articles")
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex">
      {navItems.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
              isActive
                ? "bg-neutral-100 text-neutral-950 dark:bg-neutral-900 dark:text-neutral-50"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
