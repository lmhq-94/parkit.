"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface DateTimePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Si true, abre el popup automáticamente al montarse (útil para inline edits en tablas). */
  autoOpenOnMount?: boolean;
  /** Variantes de estilo: "default" (formularios) o "inline" (edición en celdas de tabla). */
  variant?: "default" | "inline";
}

function parseDateTime(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toDateTimeLocalString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function hour24To12(h24: number): { hour12: number; ampm: "AM" | "PM" } {
  if (h24 === 0) return { hour12: 12, ampm: "AM" };
  if (h24 < 12) return { hour12: h24, ampm: "AM" };
  if (h24 === 12) return { hour12: 12, ampm: "PM" };
  return { hour12: h24 - 12, ampm: "PM" };
}

function hour12AmPmTo24(hour12: number, ampm: "AM" | "PM"): number {
  if (ampm === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function DateTimePickerField({
  value,
  onChange,
  placeholder,
  className,
  autoOpenOnMount,
  variant = "default",
}: DateTimePickerFieldProps) {
  const { t } = useTranslation();
  const today = new Date();
  const parsed = parseDateTime(value);

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
      const d = parseDateTime(v);
      if (!d) return "";
      const datePart = `${String(d.getDate()).padStart(2, "0")} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const { hour12, ampm } = hour24To12(d.getHours());
      const timePart = `${hour12}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`;
      return `${datePart}, ${timePart}`;
    },
    [monthNames]
  );

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<{ year: number; month: number }>({
    year: parsed?.getFullYear() ?? today.getFullYear(),
    month: parsed?.getMonth() ?? today.getMonth(),
  });
  const [time, setTime] = useState({ hour: parsed?.getHours() ?? 0, minute: parsed?.getMinutes() ?? 0 });
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
    const CALENDAR_HEIGHT = 300;
    const MARGIN = 12;
    const popupWidth = 260;
    const isNarrow = vw < 400;
    const width = isNarrow ? vw - MARGIN * 2 : Math.min(popupWidth, vw - MARGIN * 2);
    const left = isNarrow ? MARGIN : (() => {
      let L = rect.right - width;
      if (L < MARGIN) L = MARGIN;
      if (L + width > vw - MARGIN) L = vw - width - MARGIN;
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
      if (parsed) {
        setView({ year: parsed.getFullYear(), month: parsed.getMonth() });
        setTime({ hour: parsed.getHours(), minute: parsed.getMinutes() });
      }
    }
    setOpen((o) => !o);
  };

  // Abrir automáticamente al montarse (para inline edit: primer clic ya muestra el popup)
  useEffect(() => {
    if (!autoOpenOnMount) return;
    const id = window.setTimeout(() => {
      updatePosition();
      setOpen(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [autoOpenOnMount, updatePosition]);

  useEffect(() => {
    if (parsed) {
      setTime({ hour: parsed.getHours(), minute: parsed.getMinutes() });
    }
  }, [value, open]);

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
        !target.closest("[data-datetimepicker-dropdown]")
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

  const commitDateTime = useCallback(
    (year: number, month: number, day: number, hour: number, minute: number) => {
      const d = new Date(year, month, day, hour, minute, 0, 0);
      onChange(toDateTimeLocalString(d));
    },
    [onChange]
  );

  const selectDay = (day: number) => {
    commitDateTime(view.year, view.month, day, time.hour, time.minute);
  };

  const getCurrentDateParts = useCallback(() => {
    const parsedNow = parseDateTime(value);
    return {
      year: parsedNow?.getFullYear() ?? view.year,
      month: parsedNow?.getMonth() ?? view.month,
      day: parsedNow?.getDate() ?? 1,
    };
  }, [value, view.year, view.month]);

  const setHour = (h: number) => {
    const { year, month, day } = getCurrentDateParts();
    commitDateTime(year, month, day, h, time.minute);
    setTime((prev) => ({ ...prev, hour: h }));
  };

  const setMinute = (m: number) => {
    const { year, month, day } = getCurrentDateParts();
    commitDateTime(year, month, day, time.hour, m);
    setTime((prev) => ({ ...prev, minute: m }));
  };

  const daysInMonth = getDaysInMonth(view.year, view.month);
  const firstDow = getFirstDayOfWeek(view.year, view.month);
  const todayStr = toDateTimeLocalString(today).slice(0, 10);
  const selectedStr = parsed ? toDateTimeLocalString(parsed).slice(0, 10) : null;

  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const hour24 = parsed?.getHours() ?? time.hour;
  const { hour12, ampm } = hour24To12(hour24);

  const calendarDropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        data-datetimepicker-dropdown
        className="fixed z-[99999] rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden select-none max-w-[calc(100vw-24px)]"
        style={{
          top: position.top,
          bottom: position.bottom,
          left: position.left,
          width: position.width,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={prevMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors touch-manipulation"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide truncate">
            {monthNames[view.month]} {view.year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors touch-manipulation"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 px-2 pt-1 pb-0.5 gap-px">
          {dowLabels.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 px-2 pb-1.5 gap-0.5">
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
                  "w-full aspect-square min-w-0 rounded-md text-xs transition-colors flex items-center justify-center font-medium touch-manipulation",
                  isSelected
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

        {/* Time row — 12h con AM/PM */}
        <div className="px-2.5 py-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-nowrap">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {t("datepicker.time")}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              <select
                value={hour12}
                onChange={(e) => setHour(hour12AmPmTo24(Number(e.target.value), ampm))}
                className="w-[3rem] rounded-md border border-input-border bg-input-bg text-slate-800 dark:text-slate-200 text-xs py-1.5 px-1.5"
              >
                {hours12.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="text-slate-400 dark:text-slate-500">:</span>
              <select
                value={parsed ? parsed.getMinutes() : time.minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="w-[3rem] rounded-md border border-input-border bg-input-bg text-slate-800 dark:text-slate-200 text-xs py-1.5 px-1.5"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <select
                value={ampm}
                onChange={(e) => setHour(hour12AmPmTo24(hour12, e.target.value as "AM" | "PM"))}
                className="w-[3.25rem] rounded-md border border-input-border bg-input-bg text-slate-800 dark:text-slate-200 text-xs py-1.5 px-1.5"
              >
                <option value="AM">{t("datepicker.am")}</option>
                <option value="PM">{t("datepicker.pm")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        {value && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDisplay(value)}
            </span>
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              {t("datepicker.clear")}
            </button>
          </div>
        )}
      </div>,
      document.body
    );

  const displayValue = value ? formatDisplay(value) : "";

  return (
    <>
      <div className={["relative group w-full", className ?? ""].join(" ")}>
        {variant === "default" && (
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10 transition-colors group-focus-within:text-company-primary" />
        )}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={[
            variant === "inline"
              ? "w-full py-2 px-2 text-xs sm:text-sm text-left cursor-pointer bg-transparent border-none shadow-none"
              : "w-full py-3 pl-10 pr-4 rounded-lg border bg-input-bg text-sm text-left transition-colors cursor-pointer",
            variant === "default" &&
              (open
                ? "border-company-primary ring-1 ring-company-primary-full"
                : "border-input-border hover:border-company-primary-muted"),
            displayValue ? "text-text-primary" : "text-text-muted",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {displayValue || (placeholder ?? t("datepicker.placeholderDateTime"))}
        </button>
      </div>
      {calendarDropdown}
    </>
  );
}

