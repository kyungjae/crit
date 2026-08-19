"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "피드" },
  { href: "/jobs", label: "채용" },
  { href: "/links", label: "링크" },
  { href: "/events", label: "행사" },
  { href: "/slack", label: "Slack" },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/" || pathname.startsWith("/articles")
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴" className="hidden h-14 items-center gap-5 md:flex">
      {navItems.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex h-full items-center text-[13px] font-semibold transition ${
              isActive
                ? "text-neutral-950 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand dark:text-neutral-50"
                : "text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
