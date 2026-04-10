"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Car } from "@/lib/premiumIcons";
import { useTheme } from "next-themes";
import { LoadingSpinner } from "./LoadingSpinner";
import { toTitleCase } from "@/lib/inputMasks";
import { useTranslation } from "@/hooks/useTranslation";

export interface BrandModelComboOption {
  value: string;
  label: string;
}

interface BrandModelComboFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: BrandModelComboOption[];
  loading?: boolean;
  placeholder?: string;
  icon?: React.ElementType;
  className?: string;
  /** Si true, el campo está deshabilitado (ej. modelo cuando no hay marca) */
  disabled?: boolean;
  /** Mensaje cuando disabled (ej. "Seleccione marca primero") */
  disabledPlaceholder?: string;
}

/**
 * Campo combobox para marca/modelo: seleccionar del catálogo O escribir manualmente.
 */
export function BrandModelComboField({
  value,
  onChange,
  options,
  loading = false,
  placeholder = "Seleccionar o escribir…",
  icon: Icon = Car,
  className,
  disabled = false,
  disabledPlaceholder,
}: BrandModelComboFieldProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justCommittedRef = useRef(false);
  const openedFromFocusRef = useRef(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 220 });
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const filtered =
    inputValue.trim() === ""
      ? options
      : options.filter((o) =>
          o.label.toLowerCase().includes(inputValue.trim().toLowerCase())
        );

  const syncInputFromValue = useCallback(() => {
    if (justCommittedRef.current) return;
    const val = value ?? "";
    const opt = options.find((o) => o.value.toLowerCase() === val.toLowerCase());
    setInputValue(opt ? opt.label : val);
  }, [value, options]);

  useEffect(() => {
    if (justCommittedRef.current) {
      justCommittedRef.current = false;
      return;
    }
    syncInputFromValue();
  }, [syncInputFromValue]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 220),
    });
  }, []);

  useEffect(() => {
    if (open) {
      setHighlightIndex(-1);
      updatePosition();
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
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
        !target.closest("[data-brand-model-combo-dropdown]")
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        syncInputFromValue();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, syncInputFromValue]);

  const commitValue = (val: string) => {
    const trimmed = val.trim();
    const final = trimmed ? toTitleCase(trimmed) : "";
    justCommittedRef.current = true;
    setInputValue(final);
    setOpen(false);
    onChange(final);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    setOpen(true);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " ") setOpen(true);
      return;
    }
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
      return;
    }
    if (e.key === "Tab") {
      if (highlightIndex >= 0 && filtered[highlightIndex]) {
        commitValue(filtered[highlightIndex].value);
      } else {
        commitValue(inputValue);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as HTMLElement | null;
    if (next?.closest("[data-brand-model-combo-dropdown]")) return;
    setTimeout(() => {
      if (!document.activeElement?.closest("[data-brand-model-combo]") &&
          !document.activeElement?.closest("[data-brand-model-combo-dropdown]")) {
        commitValue(inputValue);
        setOpen(false);
      }
    }, 150);
  };

  const handleSelect = (opt: BrandModelComboOption) => {
    commitValue(opt.value);
  };

  const displayPlaceholder = disabled ? (disabledPlaceholder ?? placeholder) : placeholder;

  if (disabled) {
    return (
      <div
        className={[
          "relative flex items-center rounded-lg border border-input-border bg-input-bg/50 py-3 px-4 text-sm text-text-muted",
          Icon ? "pl-10" : "",
          className ?? "",
        ].join(" ")}
      >
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />}
        {displayPlaceholder}
      </div>
    );
  }

  const dropdownStyles: React.CSSProperties = {
    background: isDark
      ? "linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)"
      : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.99) 100%)",
    boxShadow: isDark
      ? "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), 0 10px 20px -5px rgba(0,0,0,0.4)"
      : "0 25px 50px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 10px 20px -5px rgba(0,0,0,0.1)",
    backdropFilter: "blur(24px) saturate(180%)",
  };

  const dropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        data-brand-model-combo-dropdown
        onMouseDown={(e) => e.preventDefault()}
        className="fixed z-[99999] flex flex-col rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-[220px]"
        style={{
          ...dropdownStyles,
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          maxHeight: 320,
        }}
      >
        <div className="p-1.5 overflow-y-auto overscroll-contain min-h-0 flex-1 space-y-0.5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-slate-400">
              <LoadingSpinner size="sm" />
              <span>{t("common.loading")}</span>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((opt, idx) => (
              <button
                key={`${opt.value}-${idx}`}
                type="button"
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`w-full px-3 py-2.5 text-left text-sm rounded-xl transition-all duration-200 ${
                  idx === highlightIndex || opt.value === value
                    ? "bg-company-primary/10 dark:bg-company-primary/20 text-company-primary font-medium"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                }`}
              >
                <span className="font-medium">{opt.label}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-sm text-slate-400 text-center">
              {inputValue.trim() ? t("common.typeManuallyEnter") : t("common.noOptions")}
            </p>
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <div data-brand-model-combo className={["relative group", className ?? ""].join(" ")}>
      <div
        ref={triggerRef}
        onClick={() => {
          if (loading) return;
          if (openedFromFocusRef.current) {
            openedFromFocusRef.current = false;
            return;
          }
          setOpen((o) => !o);
        }}
        className={[
          "flex items-center rounded-lg border bg-input-bg text-sm text-left transition-colors cursor-pointer",
          open ? "border-company-primary ring-1 ring-company-primary" : "border-input-border hover:border-company-primary-muted",
          Icon ? "pl-10 pr-9" : "pl-4 pr-9",
          !value ? "text-text-muted" : "text-text-primary",
        ].join(" ")}
      >
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            openedFromFocusRef.current = true;
            setOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={displayPlaceholder}
          className="w-full min-w-0 bg-transparent outline-none py-3 pr-2 placeholder:text-text-muted"
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform duration-200 ${
            open ? "rotate-180 text-company-primary" : "text-text-muted/50"
          }`}
        />
      </div>
      {dropdown}
    </div>
  );
}
