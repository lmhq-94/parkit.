"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "@/lib/premiumIcons";
import { useTheme } from "next-themes";

interface SelectFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  "aria-invalid"?: boolean;
}

function getDropdownStyles(isDark: boolean): React.CSSProperties {
  return {
    background: isDark
      ? "linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)"
      : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.99) 100%)",
    boxShadow: isDark
      ? "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), 0 10px 20px -5px rgba(0,0,0,0.4)"
      : "0 25px 50px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 10px 20px -5px rgba(0,0,0,0.1)",
    backdropFilter: "blur(24px) saturate(180%)",
  };
}

export function SelectField({ value, onChange, icon: Icon, children, className, "aria-invalid": ariaInvalid }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left: number; width: number; maxHeight: number }>({ left: 0, width: 0, maxHeight: 400 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const options = React.Children.toArray(children)
    .filter((child): child is React.ReactElement => React.isValidElement(child))
    .map((child) => ({
      value: String((child.props as { value?: unknown }).value ?? ""),
      label: String((child.props as { children?: unknown }).children ?? ""),
    }));

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";
  const showSearch = options.length > 8;
  const filtered = showSearch && search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const MARGIN = 12;
    const spaceBelow = vh - rect.bottom - MARGIN;
    const spaceAbove = rect.top - MARGIN;
    const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(400, openUp ? spaceAbove : spaceBelow);
    setPosition({
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? vh - rect.top + 6 : undefined,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, []);

  const handleOpen = () => {
    if (!open) { updatePosition(); setSearch(""); }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 0);
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, showSearch, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !triggerRef.current?.contains(target) &&
        !target.closest("[data-select-dropdown]")
      ) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSelect = (optValue: string) => {
    onChange({ target: { value: optValue } } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
    setSearch("");
  };

  const dropdownStyles = getDropdownStyles(isDark);

  const dropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        data-select-dropdown
        className="fixed z-[99999] flex flex-col rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-[220px]"
        style={{
          ...dropdownStyles,
          top: position.top,
          bottom: position.bottom,
          left: position.left,
          width: Math.max(position.width, 220),
          maxHeight: position.maxHeight,
        }}
      >
        {showSearch && (
          <div className="relative px-3 pt-3 pb-2 shrink-0 border-b border-slate-200/60 dark:border-slate-700/60">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-100/80 dark:bg-slate-800/80 rounded-xl outline-none text-slate-700 dark:text-slate-300 placeholder:text-text-muted border border-transparent focus:border-company-primary/30 transition-colors"
            />
          </div>
        )}
        <div className="p-1.5 overflow-y-auto overscroll-contain min-h-0 flex-1 space-y-0.5">
          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`w-full px-3 py-2.5 text-left text-sm rounded-xl transition-all duration-200 flex items-center gap-3 ${
                opt.value === value
                  ? "bg-company-primary/10 dark:bg-company-primary/20 text-company-primary font-medium"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
              }`}
            >
              {opt.value === value && (
                <span className="w-1.5 h-1.5 rounded-full bg-company-primary shrink-0" />
              )}
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-3 text-sm text-slate-400 text-center">Sin resultados</p>
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <div className={["relative group", className ?? ""].join(" ")}>
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10 transition-colors" />
        )}
        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          aria-invalid={ariaInvalid}
          className={[
            "w-full pl-10 pr-10 py-3 rounded-lg border border-input-border bg-input-bg text-sm transition-all duration-200 ease-out focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary/20 focus:ring-inset placeholder:text-text-muted text-left",
            "text-sm font-medium truncate",
            !value ? "text-text-muted" : "",
          ].join(" ")}
        >
          {selectedLabel || <span className="text-text-muted">Seleccionar…</span>}
        </button>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform duration-200 ${
            open ? "rotate-180 text-company-primary" : "text-text-muted/50"
          }`}
        />
      </div>
      {dropdown}
    </>
  );
}
