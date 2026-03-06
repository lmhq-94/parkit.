"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";

interface SelectFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

export function SelectField({ value, onChange, icon: Icon, children, className }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
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

  const dropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        data-select-dropdown
        className="fixed z-[99999] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 py-1.5 px-1.5"
        style={{ top: position.top, left: position.left, width: Math.max(position.width, 220) }}
      >
        {showSearch && (
          <div className="relative mb-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            />
          </div>
        )}
        <div className="max-h-52 overflow-y-auto">
          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-lg ${
                opt.value === value
                  ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 font-medium"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {opt.label}
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
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={[
            "w-full py-3 rounded-lg border bg-input-bg text-sm text-left transition-colors cursor-pointer",
            open
              ? "border-sky-500 ring-1 ring-sky-500 text-text-primary"
              : "border-input-border text-text-primary hover:border-sky-500/40",
            Icon ? "pl-10 pr-9" : "pl-4 pr-9",
            !value ? "text-text-muted" : "",
          ].join(" ")}
        >
          {selectedLabel || <span className="text-text-muted">Seleccionar…</span>}
        </button>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform duration-200 ${
            open ? "rotate-180 text-sky-500" : "text-text-muted/50"
          }`}
        />
      </div>
      {dropdown}
    </>
  );
}
