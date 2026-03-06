"use client";

import { createPortal } from "react-dom";
import { useLocaleStore } from "@/lib/store";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LocaleToggle() {
  const { locale, setLocale } = useLocaleStore();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);

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

  const dropdown = open && typeof document !== "undefined" && (
    createPortal(
      <div
        data-locale-dropdown
        className="fixed overflow-hidden py-1.5 px-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl min-w-[120px] z-[99999] bg-white dark:bg-slate-900"
        style={{
          top: position.top,
          right: position.right,
          left: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setLocale("es");
            setOpen(false);
          }}
          className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-lg ${
            locale === "es"
              ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 font-medium"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
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
          className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-lg ${
            locale === "en"
              ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 font-medium"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
        >
          English
        </button>
      </div>,
      document.body
    )
  );

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={handleToggle}
          className="p-2 rounded-xl bg-card border border-card-border text-text-secondary hover:text-text-primary hover:bg-input-bg transition-colors flex items-center gap-1.5"
          title={locale === "es" ? "English" : "Español"}
          aria-label="Idioma / Language"
        >
          <Globe className="w-5 h-5" />
          <span className="text-xs font-medium uppercase hidden sm:inline">{locale}</span>
        </button>
      </div>
      {dropdown}
    </>
  );
}
