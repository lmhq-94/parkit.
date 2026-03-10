"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectCellEditorProps {
  value?: string | null;
  initialValue?: string | null;
  onValueChange: (value: string | null) => void;
  options?: MultiSelectOption[];
  /** Separador para unir valores (default: ", ") */
  valueSeparator?: string;
  stopEditing?: (preventFocus?: boolean) => void;
}

/**
 * Editor de celda multi-select para AG Grid.
 * Valor almacenado como string separado por valueSeparator (ej. "A1, B1, C").
 */
export function MultiSelectCellEditor({
  value: valueProp,
  initialValue,
  onValueChange,
  options = [],
  valueSeparator = ", ",
  stopEditing,
}: MultiSelectCellEditorProps) {
  const rawValue = valueProp ?? initialValue ?? "";
  const selectedValues = typeof rawValue === "string" && rawValue
    ? rawValue.split(valueSeparator).map((s) => s.trim()).filter(Boolean)
    : [];
  const [open, setOpen] = useState(true);
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, width: 0, maxHeight: 320 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const getLabel = (val: string) =>
    options.find((o) => o.value === val)?.label ?? val;
  const displayLabel = selectedValues.length > 0
    ? selectedValues.map(getLabel).join(", ")
    : "—";

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(320, openUp ? spaceAbove : spaceBelow);
    setPosition({
      ...(openUp ? { bottom: vh - rect.top + 4 } : { top: rect.bottom + 4 }),
      left: rect.left,
      width: Math.max(rect.width, 180),
      maxHeight,
    });
  };

  useEffect(() => {
    const t = setTimeout(updatePosition, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !triggerRef.current?.contains(target) &&
        !target.closest("[data-multiselect-cell-editor-dropdown]")
      ) {
        setOpen(false);
        stopEditing?.();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, stopEditing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        stopEditing?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, stopEditing]);

  const toggleOption = (optValue: string) => {
    const next = selectedValues.includes(optValue)
      ? selectedValues.filter((v) => v !== optValue)
      : [...selectedValues, optValue];
    onValueChange(next.length > 0 ? next.join(valueSeparator) : "");
  };

  const handleDone = () => {
    setOpen(false);
    stopEditing?.();
  };

  const dropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        data-multiselect-cell-editor-dropdown
        className="ag-custom-component-popup fixed z-[10002] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 py-1.5 px-1.5 overflow-hidden"
        style={{
          top: position.top,
          bottom: position.bottom,
          left: position.left,
          width: position.width,
          maxHeight: position.maxHeight,
        }}
      >
        <div className="overflow-y-auto overscroll-contain min-h-0 flex-1">
          {options.map((opt) => {
            const checked = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleOption(opt.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors rounded-lg ${
                  checked
                    ? "bg-company-primary-muted text-company-primary font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {checked ? <Check className="w-4 h-4 shrink-0" /> : <span className="w-4" />}
                {opt.label}
              </button>
            );
          })}
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 mt-1">
          <button
            type="button"
            onClick={handleDone}
            className="w-full px-3 py-2 text-sm font-medium text-company-primary hover:bg-company-primary-muted rounded-lg transition-colors"
          >
            Listo
          </button>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="w-full h-full flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-full flex items-center justify-between gap-2 px-2 text-text-primary text-sm text-left cursor-pointer focus:outline-none"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className="w-4 h-4 shrink-0 text-text-muted" />
      </button>
      {dropdown}
    </div>
  );
}
