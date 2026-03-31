"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { toTitleCase } from "@/lib/inputMasks";

interface CatalogComboCellEditorProps {
  value?: string | null;
  initialValue?: string | null;
  onValueChange: (value: string | null) => void;
  options: Array<{ value: string; label: string }>;
  stopEditing?: (preventFocus?: boolean) => void;
}

/**
 * Editor de celda combobox: seleccionar de la lista O escribir valor custom.
 */
export function CatalogComboCellEditor({
  value: valueProp,
  initialValue,
  onValueChange,
  options,
  stopEditing,
}: CatalogComboCellEditorProps) {
  const value = valueProp ?? initialValue ?? null;
  const [inputValue, setInputValue] = useState(value ?? "");
  const [open, setOpen] = useState(true);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, width: 120, maxHeight: 200 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    inputValue.trim() === ""
      ? options
      : options.filter((o) =>
          o.label.toLowerCase().includes(inputValue.trim().toLowerCase())
        );

  const commitValue = useCallback((val: string) => {
    const trimmed = val.trim();
    const final = trimmed ? toTitleCase(trimmed) : null;
    onValueChange(final);
  }, [onValueChange]);

  useEffect(() => {
    const opt = options.find((o) => o.value === value);
    setInputValue(opt ? opt.label : value ?? "");
  }, [value, options]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openUp = spaceBelow < 150 && spaceAbove > spaceBelow;
    setPosition({
      ...(openUp ? { bottom: vh - rect.top + 4 } : { top: rect.bottom + 4 }),
      left: rect.left,
      width: Math.max(rect.width, 160),
      maxHeight: Math.min(220, openUp ? spaceAbove : spaceBelow),
    } as { top?: number; bottom?: number; left: number; width: number; maxHeight: number });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !triggerRef.current?.contains(target) &&
        !target.closest("[data-catalog-combo-dropdown]")
      ) {
        commitValue(inputValue);
        setOpen(false);
        stopEditing?.();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, inputValue, stopEditing, commitValue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInputValue(value ?? "");
        setOpen(false);
        stopEditing?.(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, value, stopEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i < filtered.length - 1 ? i + 1 : i));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i > 0 ? i - 1 : -1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && filtered[highlightIndex]) {
        commitValue(filtered[highlightIndex].value);
      } else {
        commitValue(inputValue);
      }
      setOpen(false);
      stopEditing?.();
      return;
    }
    if (e.key === "Tab") {
      if (highlightIndex >= 0 && filtered[highlightIndex]) {
        commitValue(filtered[highlightIndex].value);
      } else {
        commitValue(inputValue);
      }
      setOpen(false);
      stopEditing?.();
    }
  };

  const handleSelect = (opt: { value: string; label: string }) => {
    commitValue(opt.value);
    setOpen(false);
    stopEditing?.();
  };

  const dropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        data-catalog-combo-dropdown
        className="ag-custom-component-popup fixed z-[10002] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 py-1.5 px-1.5 overflow-hidden"
        style={{
          ...(position.top != null ? { top: position.top } : {}),
          ...(position.bottom != null ? { bottom: position.bottom } : {}),
          left: position.left,
          width: position.width,
          maxHeight: position.maxHeight,
        }}
      >
        <div className="overflow-y-auto overscroll-contain min-h-0 flex-1">
          {filtered.length > 0 ? (
            filtered.map((opt, idx) => (
              <button
                key={`${opt.value}-${idx}`}
                type="button"
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-lg ${
                  idx === highlightIndex || opt.value === value
                    ? "bg-company-primary-muted text-company-primary font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-slate-400">
              {inputValue.trim() ? "Enter para usar" : "Sin opciones"}
            </p>
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <div ref={triggerRef} className="w-full h-full flex items-center">
      <div className="w-full h-full flex items-center gap-1 rounded border border-company-primary bg-input-bg">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setHighlightIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            commitValue(inputValue);
            stopEditing?.();
          }}
          className="flex-1 min-w-0 h-full px-2 text-sm bg-transparent text-text-primary outline-none"
          placeholder="Seleccionar o escribir…"
        />
        <ChevronDown className="w-4 h-4 shrink-0 text-text-muted mr-1" />
      </div>
      {dropdown}
    </div>
  );
}
