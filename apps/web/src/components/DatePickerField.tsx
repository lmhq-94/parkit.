"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MONTHS_SHORT_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DOW = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function parseDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(v: string): string {
  const d = parseDate(v);
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
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
  placeholder = "Seleccionar fecha…",
  className,
}: DatePickerFieldProps) {
  const today = new Date();
  const parsed = parseDate(value);

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
    const vh = window.innerHeight;
    const CALENDAR_HEIGHT = 340;
    const MARGIN = 12;
    const spaceBelow = vh - rect.bottom - MARGIN;
    const openUp = spaceBelow < CALENDAR_HEIGHT && rect.top > CALENDAR_HEIGHT + MARGIN;
    setPosition({
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? vh - rect.top + 4 : undefined,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  const handleOpen = () => {
    if (!open) {
      updatePosition();
      if (parsed) setView({ year: parsed.getFullYear(), month: parsed.getMonth() });
    }
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
        className="fixed z-[99999] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden select-none"
        style={{
          top: position.top,
          bottom: position.bottom,
          left: position.left,
          width: Math.max(position.width, 280),
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={prevMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
            {MONTHS_ES[view.month]} {view.year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 px-3 pt-2.5 pb-1">
          {DOW.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = selectedStr === dateStr;
            const isToday = todayStr === dateStr;

            return (
              <button
                key={day}
                type="button"
                onClick={() => selectDay(day)}
                className={[
                  "w-full aspect-square rounded-lg text-sm transition-colors flex items-center justify-center font-medium",
                  isSelected
                    ? "bg-sky-500 text-white shadow-sm"
                    : isToday
                    ? "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/60"
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
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDisplay(value)}
            </span>
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Borrar
            </button>
          </div>
        )}
      </div>,
      document.body
    );

  const displayValue = formatDisplay(value);

  return (
    <>
      <div className={["relative group w-full", className ?? ""].join(" ")}>
        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10 transition-colors group-focus-within:text-sky-500" />
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={[
            "w-full py-3 pl-10 pr-4 rounded-lg border bg-input-bg text-sm text-left transition-colors cursor-pointer",
            open
              ? "border-sky-500 ring-1 ring-sky-500"
              : "border-input-border hover:border-sky-500/40",
            displayValue ? "text-text-primary" : "text-text-muted",
          ].join(" ")}
        >
          {displayValue || placeholder}
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
