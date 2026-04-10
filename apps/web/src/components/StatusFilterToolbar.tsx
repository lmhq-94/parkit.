"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";

export interface StatusFilterOption {
  value: string;
  label: string;
}

interface StatusFilterToolbarProps {
  allLabel: string;
  placeholder: string;
  clearSelectionLabel?: string;
  options: StatusFilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  tableKey: string; // for data-status-filter-dropdown
  /** Extra classes for the container; useful to control margins from parent. */
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

export function StatusFilterToolbar({
  allLabel,
  placeholder,
  clearSelectionLabel,
  options,
  selected,
  onChange,
  tableKey,
  className,
}: StatusFilterToolbarProps) {
  const { t } = useTranslation();
  const resolvedClearLabel = clearSelectionLabel ?? t("grid.clearSelection");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, width: 0, maxHeight: 320 });

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
        !target.closest(`[data-status-filter-dropdown="${tableKey}"]`)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, tableKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (optValue: string) => {
    if (selected.includes(optValue)) {
      onChange(selected.filter((v) => v !== optValue));
    } else {
      onChange([...selected, optValue]);
    }
  };

  const isAll = selected.length === 0;

  const formControlBase =
    "rounded-lg border border-input-border bg-input-bg text-sm font-medium transition-colors min-h-[42px] px-4 py-3";

  return (
    <div className={`flex flex-nowrap md:flex-wrap items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => onChange([])}
        className={`${formControlBase} ${
          isAll
            ? "bg-company-primary text-white border-company-primary"
            : "text-text-secondary hover:bg-company-primary-subtle hover:text-company-primary"
        }`}
      >
        {allLabel}
      </button>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-2 min-w-[140px] justify-between ${formControlBase} ${
            open
              ? "border-company-primary ring-1 ring-company-primary focus:ring-company-primary"
              : "text-text-secondary hover:bg-company-primary-subtle hover:text-company-primary"
          }`}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
                : t("grid.nSelected", { n: selected.length })}
          </span>
          <ChevronDown
            className={`shrink-0 w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-180 text-company-primary" : "text-text-muted/50"
            }`}
          />
        </button>
        {open &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              data-status-filter-dropdown={tableKey}
              className="fixed z-[99999] flex flex-col rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-[220px]"
              style={{
                ...getDropdownStyles(isDark),
                top: position.top,
                bottom: position.bottom,
                left: position.left,
                width: Math.max(position.width, 220),
                maxHeight: position.maxHeight,
              }}
            >
              <div className="p-1.5 overflow-y-auto overscroll-contain min-h-0 flex-1 space-y-0.5">
                {options.map((opt) => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className={`group w-full px-3 py-2.5 text-left text-sm rounded-xl transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? "bg-company-primary/10 dark:bg-company-primary/20 text-company-primary font-medium"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <span
                        className={`shrink-0 w-4 h-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? "bg-company-primary shadow-sm"
                            : "border border-slate-300 dark:border-slate-600 group-hover:border-company-primary/50"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        )}
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {selected.length > 0 && (
                <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-2 mt-1 px-3 pb-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-center py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    {resolvedClearLabel}
                  </button>
                </div>
              )}
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
