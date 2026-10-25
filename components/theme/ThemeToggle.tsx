"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => {
    window.removeEventListener("storage", callback);
    observer.disconnect();
  };
};

const getSnapshot = (): "dark" | "light" => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const getServerSnapshot = (): "dark" | "light" => "light";

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch {
        // ignore
      }
    } else {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {
        // ignore
      }
    }
  };

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      type="button"
      title={
        theme === "dark"
          ? "Switch to White Theme (Light)"
          : "Switch to Black Theme (Dark)"
      }
      aria-label="Toggle theme"
      className={`theme-toggle-btn inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 active:scale-95 ${className}`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 text-amber-400" />
          {showLabel && <span>White Theme</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-slate-700" />
          {showLabel && <span>Black Theme</span>}
        </>
      )}
    </button>
  );
}
