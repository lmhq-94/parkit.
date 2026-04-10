"use client";

import { useLocaleStore } from "@/lib/store";
import { Globe, Check } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import { useState, useRef, useEffect } from "react";

const LOCALE_OPTIONS = [
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "en", label: "English", flag: "🇬🇧" },
];

export function LocaleToggle() {
  const { locale, setLocale } = useLocaleStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);

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
        if (!target.closest("[data-locale-dropdown]")) setOpen(false);
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

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale as "es" | "en");
    setOpen(false);
    apiClient
      .patch("/users/me", {
        appPreferences: { locale: newLocale },
      })
      .catch(() => {
        // Language preference should not break UI if it fails.
      });
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={handleToggle}
          className="h-10 rounded-xl text-text-secondary hover:text-text-primary hover:bg-input-bg transition-colors flex items-center gap-1.5 px-2"
          title={t("settings.language")}
          aria-label={t("settings.language")}
        >
          <Globe className="w-5 h-5" />
          <span className="text-xs font-medium uppercase hidden sm:inline">{locale}</span>
        </button>
      </div>
      {open && typeof document !== "undefined" && (
        <div
          data-locale-dropdown
          className="fixed z-[99999] p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900"
          style={{
            top: position.top,
            right: position.right,
            left: "auto",
            minWidth: "180px",
          }}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            {t("settings.language")}
          </p>
          <div className="space-y-1">
            {LOCALE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleLocaleChange(option.value)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  locale === option.value
                    ? "bg-company-primary-subtle text-company-primary ring-1 ring-company-primary/30"
                    : "text-text-primary hover:bg-input-bg"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{option.flag}</span>
                  <span>{option.label}</span>
                </span>
                {locale === option.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
