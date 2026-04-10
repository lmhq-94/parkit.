"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, XCircle } from "@/lib/premiumIcons";
import { useTranslation } from "@/hooks/useTranslation";

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** If true on mount, opens datepicker immediately. Useful for custom ranges. */
  autoOpen?: boolean;
  /** Lower trigger style (py-2, rounded-md) to align with segmented buttons. */
  compact?: boolean;
  /** Minimum selectable date YYYY-MM-DD (inclusive). */
  minDate?: string;
  /** Maximum selectable date YYYY-MM-DD (inclusive). */
  maxDate?: string;
}

/** Parses YYYY-MM-DD as local calendar date (avoids one-day offset in UTC-behind timezones). */
function parseDate(v: string): Date | null {
  if (!v) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (match) {
    const y = parseInt(match[1]!, 10);
    const m = parseInt(match[2]!, 10) - 1;
    const d = parseInt(match[3]!, 10);
    const date = new Date(y, m, d);
    return isNaN(date.getTime()) ? null : date;
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function DatePickerField({
  value,
  onChange,
  placeholder,
  className,
  autoOpen,
  compact,
  minDate,
  maxDate,
}: DatePickerFieldProps) {
  const { t } = useTranslation();
  const today = new Date();
  const parsed = parseDate(value);

  const monthNames = useMemo(
    () => Array.from({ length: 12 }, (_, i) => t(`datepicker.month${i}`)),
    [t]
  );
  const dowLabels = useMemo(
    () => Array.from({ length: 7 }, (_, i) => t(`datepicker.dow${i}`)),
    [t]
  );

  const formatDisplay = useCallback(
    (v: string): string => {
      const d = parseDate(v);
      if (!d) return "";
      return `${String(d.getDate()).padStart(2, "0")} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    },
    [monthNames]
  );

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<{ year: number; month: number }>({
    year: parsed?.getFullYear() ?? today.getFullYear(),
    month: parsed?.getMonth() ?? today.getMonth(),
  });
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const CALENDAR_HEIGHT = 340;
    const MARGIN = 12;
    const minWidth = 280;
    const isNarrow = vw < 400;
    const width = isNarrow ? vw - MARGIN * 2 : Math.max(minWidth, Math.min(rect.width, vw - MARGIN * 2));
    const left = isNarrow ? MARGIN : (() => {
      let L = rect.left;
      if (L + width > vw - MARGIN) L = vw - width - MARGIN;
      if (L < MARGIN) L = MARGIN;
      return L;
    })();
    const spaceBelow = vh - rect.bottom - MARGIN;
    const spaceAbove = rect.top - MARGIN;
    const openUp = spaceBelow < CALENDAR_HEIGHT || spaceAbove >= spaceBelow;
    setPosition({
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? vh - rect.top + 4 : undefined,
      left,
      width,
    });
  }, []);

  const handleOpen = () => {
    if (!open) {
      updatePosition();
      if (parsed) setView({ year: parsed.getFullYear(), month: parsed.getMonth() });
    }
    setOpen((o) => !o);
  };

  // Open automatically when autoOpen is set (for example when choosing "Range" in overview).
  useEffect(() => {
    if (autoOpen && !open) {
      handleOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

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
        !target.closest("[data-datepicker-dropdown]")
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

  const prevMonth = () => {
    setView((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { ...v, month: v.month - 1 };
    });
  };

  const nextMonth = () => {
    setView((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 };
      return { ...v, month: v.month + 1 };
    });
  };

  const selectDay = (day: number) => {
    const d = new Date(view.year, view.month, day, 12, 0, 0);
    onChange(toLocalDateString(d));
    setOpen(false);
  };

  const daysInMonth = getDaysInMonth(view.year, view.month);
  const firstDow = getFirstDayOfWeek(view.year, view.month);
  const todayStr = toLocalDateString(today);
  const selectedStr = parsed ? toLocalDateString(parsed) : null;

  const calendarDropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        data-datepicker-dropdown
        className="fixed z-[99999] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden select-none max-w-[calc(100vw-24px)]"
        style={{
          top: position.top,
          bottom: position.bottom,
          left: position.left,
          width: position.width,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={prevMonth}
            className="group w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          </button>
          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide truncate">
            {monthNames[view.month]} {view.year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="group w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors touch-manipulation"
          >
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 px-2 sm:px-3 pt-2 pb-1 gap-px">
          {dowLabels.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-0.5 sm:py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 px-2 sm:px-3 pb-2 sm:pb-3 gap-0.5 sm:gap-y-0.5">
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = selectedStr === dateStr;
            const isToday = todayStr === dateStr;
            const isDisabled =
              (minDate != null && dateStr < minDate) || (maxDate != null && dateStr > maxDate);

            return (
              <button
                key={day}
                type="button"
                onClick={() => !isDisabled && selectDay(day)}
                disabled={isDisabled}
                className={[
                  "w-full aspect-square min-w-0 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center font-medium touch-manipulation",
                  isDisabled
                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                    : isSelected
                    ? "bg-company-primary text-white shadow-sm"
                    : isToday
                    ? "bg-company-primary-subtle text-company-primary hover:bg-company-primary-muted"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        {value && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDisplay(value)}
            </span>
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              {t("datepicker.clear")}
            </button>
          </div>
        )}
      </div>,
      document.body
    );

  const displayValue = formatDisplay(value);

  const triggerClasses = compact
    ? [
        "w-full py-2 pl-8 pr-3 rounded-lg border text-sm text-left transition-colors cursor-pointer",
        open
          ? "border-company-primary ring-1 ring-company-primary-full"
          : "border-transparent hover:border-company-primary-muted bg-transparent",
        displayValue ? "text-text-primary" : "text-text-muted",
      ].join(" ")
    : [
        "w-full py-3 pl-10 pr-4 rounded-lg border bg-input-bg text-sm text-left transition-colors cursor-pointer",
        open
          ? "border-company-primary ring-1 ring-company-primary-full"
          : "border-input-border hover:border-company-primary-muted",
        displayValue ? "text-text-primary" : "text-text-muted",
      ].join(" ");

  return (
    <>
      <div className={["relative group w-full", className ?? ""].join(" ")}>
        <Calendar className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10 transition-colors group-focus-within:text-company-primary ${compact ? "left-3" : "left-3.5"}`} />
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={triggerClasses}
        >
          {displayValue || (placeholder ?? t("datepicker.placeholder"))}
        </button>
      </div>
      {calendarDropdown}
    </>
  );
}

export function DatePickerFieldWithLabel({
  label,
  ...props
}: DatePickerFieldProps & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      <DatePickerField {...props} />
    </div>
  );
}
