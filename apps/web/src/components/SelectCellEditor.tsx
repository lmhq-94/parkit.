"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "@/lib/premiumIcons";
import { useToast } from "@/lib/toastStore";

export type StatusStyle = { text: string; dot: string };

interface SelectCellEditorProps {
  value?: string | null;
  initialValue?: string | null;
  onValueChange: (value: string | null) => void;
  values?: string[];
  /** Etiquetas para mostrar (mismo orden que values). Si no se define, se muestran los valores crudos. */
  labels?: string[];
  stopEditing?: (preventFocus?: boolean) => void;
  /** Para columnas de estado: devuelve clases de color (text + dot) por valor. Mantiene el estilo badge en el editor. */
  getStatusStyle?: (value: string) => StatusStyle;
  /** Si devuelve string, no se cierra el editor y se muestra el mensaje (toast). */
  validator?: (value: unknown) => string | null;
}

/**
 * Editor de celda tipo dropdown para AG Grid.
 * Usa un popup estilizado con las variables del tema (visible en light y dark).
 */
export function SelectCellEditor({
  value: valueProp,
  initialValue,
  onValueChange,
  values = [],
  labels,
  stopEditing,
  getStatusStyle,
  validator,
}: SelectCellEditorProps) {
  const value = valueProp ?? initialValue ?? null;
  const { showError } = useToast();
  const [open, setOpen] = useState(true);
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, width: 0, maxHeight: 300 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const getLabel = (val: string) => {
    const idx = values.indexOf(val);
    return labels != null && labels[idx] != null ? labels[idx]! : val;
  };
  const selectedLabel = value != null ? getLabel(String(value)) : "";
  const displayValues = Array.isArray(values) && values.length > 0 ? values : [];
  const selectedStyle = getStatusStyle && value != null ? getStatusStyle(String(value)) : null;

  const tryStop = useCallback(
    (val: string | null) => {
      const err = validator ? validator(val) : null;
      if (err) {
        showError(err);
        return;
      }
      setOpen(false);
      stopEditing?.();
    },
    [validator, showError, stopEditing]
  );

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openUp = spaceBelow < 150 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(300, openUp ? spaceAbove : spaceBelow);
    setPosition({
      ...(openUp ? { bottom: vh - rect.top + 4 } : { top: rect.bottom + 4 }),
      left: rect.left,
      width: Math.max(rect.width, 120),
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
        !target.closest("[data-select-cell-editor-dropdown]")
      ) {
        tryStop(value);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, tryStop, value]);

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

  const handleSelect = (optValue: string) => {
    onValueChange(optValue);
    tryStop(optValue);
  };

  const dropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        data-select-cell-editor-dropdown
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
          {displayValues.map((opt, idx) => {
            const optLabel = labels != null && labels[idx] != null ? labels[idx]! : opt;
            const isSelected = opt === value;
            return (
              <button
                key={`${opt}-${idx}`}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-lg ${
                  isSelected
                    ? "bg-company-primary-muted text-company-primary font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {optLabel}
              </button>
            );
          })}
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
        className={`w-full h-full flex items-center gap-2 px-2 text-sm text-left cursor-pointer focus:outline-none min-w-0 ${selectedStyle ? selectedStyle.text : "text-text-primary"}`}
      >
        <span className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          {selectedStyle && (
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedStyle.dot}`} />
          )}
          <span className="truncate">{selectedLabel || "—"}</span>
        </span>
        <ChevronDown className="w-4 h-4 shrink-0 text-text-muted ml-auto" />
      </button>
      {dropdown}
    </div>
  );
}
