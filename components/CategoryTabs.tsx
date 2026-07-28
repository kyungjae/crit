import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/schema";

export default function CategoryTabs({ active }: { active?: Category }) {
  const tabs: { href: string; label: string; isActive: boolean }[] = [
    { href: "/", label: "전체", isActive: !active },
    ...CATEGORIES.map((c) => ({
      href: `/?category=${c}`,
      label: CATEGORY_LABELS[c],
      isActive: active === c,
    })),
  ];

  return (
    <nav className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            tab.isActive
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-600 ring-1 ring-neutral-200"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
