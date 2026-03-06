"use client";

import { useLocaleStore } from "@/lib/store";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LocaleToggle() {
  const { locale, setLocale } = useLocaleStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-xl bg-card border border-card-border text-text-secondary hover:text-text-primary hover:bg-input-bg transition-colors flex items-center gap-1.5"
        title={locale === "es" ? "English" : "Español"}
        aria-label="Idioma / Language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-xs font-medium uppercase hidden sm:inline">{locale}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 py-1 rounded-xl bg-card border border-card-border shadow-xl z-[100] min-w-[100px]">
          <button
            type="button"
            onClick={() => {
              setLocale("es");
              setOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-lg mx-1 ${
              locale === "es"
                ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 font-medium"
                : "text-text-secondary hover:bg-input-bg hover:text-text-primary"
            }`}
          >
            Español
          </button>
          <button
            type="button"
            onClick={() => {
              setLocale("en");
              setOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-lg mx-1 ${
              locale === "en"
                ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 font-medium"
                : "text-text-secondary hover:bg-input-bg hover:text-text-primary"
            }`}
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}
