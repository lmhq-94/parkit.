"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { useTheme } from "next-themes";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  value: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  icon?: React.ElementType;
  placeholder?: string;
  className?: string;
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

export function MultiSelectField({
  value,
  onChange,
  options,
  icon: Icon,
  placeholder = "Seleccionar…",
  className,
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, width: 0, maxHeight: 320 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const MARGIN = 12;
    const spaceBelow = vh - rect.bottom - MARGIN;
    const spaceAbove = rect.top - MARGIN;
    const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(360, openUp ? spaceAbove : spaceBelow);
    setPosition({
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? vh - rect.top + 6 : undefined,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, []);

  const handleOpen = () => {
    if (!open) updatePosition();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !triggerRef.current?.contains(target) &&
        !target.closest("[data-multiselect-dropdown]")
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  const dropdownStyles = getDropdownStyles(isDark);

  const dropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        data-multiselect-dropdown
        className="fixed z-[99999] flex flex-col rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-[220px]"
        style={{
          ...dropdownStyles,
          top: position.top,
          bottom: position.bottom,
          left: position.left,
          width: Math.max(position.width, 220),
          maxHeight: position.maxHeight,
        }}
      >
        <div className="p-1.5 overflow-y-auto overscroll-contain min-h-0 flex-1 space-y-0.5">
          {options.map((opt) => {
            const selected = value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={`group w-full px-3 py-2.5 text-left text-sm rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  selected
                    ? "bg-company-primary/10 dark:bg-company-primary/20 text-company-primary font-medium"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                }`}
              >
                <span
                  className={`shrink-0 w-4 h-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    selected
                      ? "bg-company-primary shadow-sm"
                      : "border border-slate-300 dark:border-slate-600 group-hover:border-company-primary/50"
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
        {value.length > 0 && (
          <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-2 mt-1 px-3 pb-2 shrink-0">
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-center py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              Limpiar selección
            </button>
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <>
      <div className={["relative group w-full", className ?? ""].join(" ")}>
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10 transition-colors" />
        )}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={[
            "w-full min-h-[46px] py-2 rounded-lg border bg-input-bg text-sm text-left transition-colors cursor-pointer flex flex-wrap items-center gap-1.5",
            open
              ? "border-company-primary ring-1 ring-company-primary-full"
              : "border-input-border hover:border-company-primary-muted",
            Icon ? "pl-10 pr-9" : "pl-4 pr-9",
          ].join(" ")}
        >
          {selectedLabels.length === 0 ? (
            <span className="text-text-muted">{placeholder}</span>
          ) : (
            selectedLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center px-2 py-0.5 rounded-md bg-company-primary-subtle text-company-primary text-xs font-medium"
              >
                {label}
              </span>
            ))
          )}
        </button>
        <ChevronDown
          className={`absolute right-3 top-3.5 w-4 h-4 pointer-events-none transition-transform duration-200 ${
            open ? "rotate-180 text-company-primary" : "text-text-muted/50"
          }`}
        />
      </div>
      {dropdown}
    </>
  );
}
