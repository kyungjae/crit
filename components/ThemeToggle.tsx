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
      className="inline-flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-[15px] text-neutral-600 shadow-sm transition-colors hover:border-brand/40 hover:text-brand dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:shadow-none dark:hover:border-brand/50 dark:hover:bg-neutral-800 dark:hover:text-white"
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
