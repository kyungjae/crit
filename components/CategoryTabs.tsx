import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/schema";

type Tab = {
  href: string;
  label: string;
  isActive: boolean;
  count: number;
};

export default function CategoryTabs({
  active,
  counts = {},
  total = 0,
}: {
  active?: Category;
  counts?: Partial<Record<Category, number>>;
  total?: number;
}) {
  const tabs: Tab[] = [
    { href: "/", label: "전체", isActive: !active, count: total },
    ...CATEGORIES.map((category) => ({
      href: `/?category=${category}`,
      label: CATEGORY_LABELS[category],
      isActive: active === category,
      count: counts[category] ?? 0,
    })),
  ];

  return (
    <nav
      aria-label="아티클 카테고리"
      className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.isActive ? "page" : undefined}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            tab.isActive
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950"
              : "bg-white text-neutral-600 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800"
          }`}
        >
          <span>{tab.label}</span>
          <span
            className={`ml-1 text-[11px] ${
              tab.isActive
                ? "text-white/65 dark:text-neutral-950/55"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            {tab.count}
          </span>
        </Link>
      ))}
    </nav>
  );
}
