"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      const onScrollOrResize = () => updatePosition();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
      };
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-theme-dropdown]")) setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updatePosition = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const handleToggle = () => {
    if (!open) updatePosition();
    setOpen((o) => !o);
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    setOpen(false);
    apiClient
      .patch("/users/me", {
        appPreferences: { theme: newTheme },
      })
      .catch(() => {
        // Do not block UI if saving preference fails.
      });
  };

  if (!mounted) {
    return (
      <div className="p-2 rounded-xl w-10 h-10 flex items-center justify-center" />
    );
  }

  const isDark = theme === "dark";

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={handleToggle}
          className="h-10 w-10 rounded-xl text-company-secondary hover:text-text-primary hover:bg-company-tertiary-subtle transition-colors flex items-center justify-center"
          title={isDark ? t("profile.themeLight") : t("profile.themeDark")}
          aria-label={isDark ? t("profile.themeLight") : t("profile.themeDark")}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      {open && typeof document !== "undefined" && (
        <div
          data-theme-dropdown
          className="fixed z-[99999] p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900"
          style={{
            top: position.top,
            right: position.right,
            left: "auto",
            minWidth: "240px",
          }}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            {t("settings.theme")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                theme === "light"
                  ? "border-company-primary bg-company-primary-subtle ring-1 ring-company-primary/30 shadow-sm"
                  : "border-input-border bg-input-bg/50 hover:border-company-primary-muted hover:bg-input-bg"
              }`}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                  theme === "light" ? "bg-company-primary/15 text-company-primary" : "bg-input-bg text-text-muted"
                }`}
              >
                <Sun className="w-4 h-4" />
              </span>
              <span className={`text-xs font-medium ${theme === "light" ? "text-company-primary" : "text-text-primary"}`}>
                {t("profile.themeLight")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                theme === "dark"
                  ? "border-company-primary bg-company-primary-subtle ring-1 ring-company-primary/30 shadow-sm"
                  : "border-input-border bg-input-bg/50 hover:border-company-primary-muted hover:bg-input-bg"
              }`}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                  theme === "dark" ? "bg-company-primary/15 text-company-primary" : "bg-input-bg text-text-muted"
                }`}
              >
                <Moon className="w-4 h-4" />
              </span>
              <span className={`text-xs font-medium ${theme === "dark" ? "text-company-primary" : "text-text-primary"}`}>
                {t("profile.themeDark")}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
