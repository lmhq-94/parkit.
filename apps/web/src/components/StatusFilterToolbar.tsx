"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

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
  tableKey: string; // para data-status-filter-dropdown
  /** Clases extra para el contenedor; útil para controlar márgenes desde afuera. */
  className?: string;
}

export function StatusFilterToolbar({
  allLabel,
  placeholder,
  clearSelectionLabel = "Limpiar selección",
  options,
  selected,
  onChange,
  tableKey,
  className,
}: StatusFilterToolbarProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
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
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? vh - rect.top + 4 : undefined,
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

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => onChange([])}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isAll
            ? "bg-company-primary text-white"
            : "bg-input-bg text-text-secondary hover:bg-company-primary-subtle hover:text-company-primary border border-input-border"
        }`}
      >
        {allLabel}
      </button>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border min-w-[140px] justify-between ${
            open
              ? "border-company-primary ring-1 ring-company-primary-full bg-input-bg"
              : "bg-input-bg text-text-secondary hover:bg-company-primary-subtle hover:text-company-primary border-input-border"
          }`}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
                : `${selected.length} seleccionados`}
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
              className="fixed z-[99999] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 py-1.5 px-1.5 overflow-hidden"
              style={{
                top: position.top,
                bottom: position.bottom,
                left: position.left,
                width: Math.max(position.width, 200),
                maxHeight: position.maxHeight,
              }}
            >
              <div className="overflow-y-auto overscroll-contain min-h-0 flex-1">
                {options.map((opt) => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className={`w-full px-3 py-2.5 text-left text-sm transition-colors rounded-lg flex items-center gap-3 ${
                        isSelected
                          ? "bg-company-primary-subtle text-company-primary"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-company-primary border-company-primary"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        )}
                      </span>
                      <span className={isSelected ? "font-medium" : ""}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {selected.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1 px-2 pb-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    {clearSelectionLabel}
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
