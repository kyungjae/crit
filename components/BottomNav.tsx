"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function FeedIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9h10M7 13h10M7 17h6" />
    </svg>
  );
}

function JobsIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18" />
    </svg>
  );
}

function LinksIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-2.12 2.12a5 5 0 0 0 7.07 7.07L13 19.07" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M8 4a2 2 0 1 0 0 4h2V6a2 2 0 0 0-2-2Z" />
      <path d="M4 8a2 2 0 1 0 4 0V6H6a2 2 0 0 0-2 2Z" />
      <path d="M16 20a2 2 0 1 0 0-4h-2v2a2 2 0 0 0 2 2Z" />
      <path d="M20 16a2 2 0 1 0-4 0v2h2a2 2 0 0 0 2-2Z" />
      <path d="M20 8a2 2 0 1 0-4 0v2h2a2 2 0 0 0 2-2Z" />
      <path d="M16 4a2 2 0 1 0 0 4h2V6a2 2 0 0 0-2-2Z" />
      <path d="M4 16a2 2 0 1 0 4 0v-2H6a2 2 0 0 0-2 2Z" />
      <path d="M8 20a2 2 0 1 0 0-4H6v2a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

const items = [
  { href: "/", label: "피드", Icon: FeedIcon },
  { href: "/jobs", label: "채용", Icon: JobsIcon },
  { href: "/links", label: "링크", Icon: LinksIcon },
  { href: "/events", label: "행사", Icon: CalendarIcon },
  { href: "/slack", label: "Slack", Icon: SlackIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 md:hidden">
      <div className="mx-auto flex max-w-2xl">
        {items.map(({ href, label, Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/" || pathname.startsWith("/articles")
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
