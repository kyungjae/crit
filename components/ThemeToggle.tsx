"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "crit:theme:v2";

type Theme = "light" | "dark";

function preferredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = preferredTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={isDark ? "라이트 모드" : "다크 모드"}
      className="inline-flex h-8 items-center gap-1.5 px-1 text-neutral-500 transition-colors hover:text-brand dark:text-neutral-400 dark:hover:text-brand"
    >
      <span aria-hidden="true" className="text-[15px]">{isDark ? "☀" : "☾"}</span>
      <span className="hidden text-[11px] font-bold sm:inline">
        {isDark ? "밝게" : "어둡게"}
      </span>
    </button>
  );
}
