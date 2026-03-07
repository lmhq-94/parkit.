"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ArrowRight, Loader2, Check, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export interface WizardStep {
  title: string;
  description?: string;
  badge?: "required" | "optional";
  accentColor?: string;
  isValid: () => boolean;
  content: React.ReactNode;
}

interface FormWizardProps {
  steps: WizardStep[];
  onSubmit: () => void;
  submitting: boolean;
  submitLabel?: string;
  cancelHref: string;
  error?: string | null;
}

const ACCENT: Record<string, { bar: string; dot: string; text: string; bg: string }> = {
  sky:     { bar: "bg-sky-500",     dot: "text-sky-500",     text: "text-sky-600 dark:text-sky-400",     bg: "bg-sky-500/8" },
  emerald: { bar: "bg-emerald-500", dot: "text-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8" },
  indigo:  { bar: "bg-indigo-500",  dot: "text-indigo-500",  text: "text-indigo-600 dark:text-indigo-400",  bg: "bg-indigo-500/8" },
  orange:  { bar: "bg-orange-500",  dot: "text-orange-500",  text: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-500/8" },
  teal:    { bar: "bg-teal-500",    dot: "text-teal-500",    text: "text-teal-600 dark:text-teal-400",    bg: "bg-teal-500/8" },
  blue:    { bar: "bg-blue-500",    dot: "text-blue-500",    text: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-500/8" },
  rose:    { bar: "bg-rose-500",    dot: "text-rose-500",    text: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-500/8" },
  violet:  { bar: "bg-violet-500",  dot: "text-violet-500",  text: "text-violet-600 dark:text-violet-400",  bg: "bg-violet-500/8" },
};

export function FormWizard({
  steps,
  onSubmit,
  submitting,
  submitLabel,
  cancelHref,
  error,
}: FormWizardProps) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);

  const step = steps[current];
  const isLast = current === steps.length - 1;
  const canAdvance = step.badge === "optional" ? true : step.isValid();
  const accent = ACCENT[step.accentColor ?? "sky"] ?? ACCENT.sky;

  const goTo = (next: number, dir: "forward" | "back") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 160);
  };

  const handleNext = () => {
    if (!canAdvance) return;
    if (isLast) { onSubmit(); return; }
    goTo(current + 1, "forward");
  };

  const handleBack = () => {
    if (current === 0) return;
    goTo(current - 1, "back");
  };

  return (
    <div className="flex-1 flex flex-col pt-14 pb-8 px-4 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full gap-8">

      {/* ── Stepper (top) ───────────────────────────── */}
      {steps.length > 1 && (
        <div className="select-none px-2 mb-10">
          {/* Step labels row */}
          <div className="flex items-center mb-3">
            {steps.map((s, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={[
                        "flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold transition-all duration-300",
                        done
                          ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30"
                          : active
                          ? "border-2 border-sky-500 text-sky-500 bg-sky-500/5"
                          : "border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500",
                      ].join(" ")}
                    >
                      {done ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={[
                        "text-[11px] font-medium whitespace-nowrap transition-colors duration-200",
                        active ? "text-text-primary" : done ? "text-sky-500" : "text-text-muted/50",
                      ].join(" ")}
                    >
                      {s.title}
                    </span>
                  </div>

                  {i < steps.length - 1 && (
                    <div className="flex-1 mx-3 mb-4 h-[2px] rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700/60">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500 ease-out"
                        style={{ width: i < current ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Error ───────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Step content ────────────────────────────── */}
      <div className="overflow-hidden flex-1 flex flex-col justify-center">
        <div
          key={current}
          className={[
            "flex-1 flex flex-col transition-all duration-200 ease-out",
            animating
              ? direction === "forward"
                ? "opacity-0 translate-x-3"
                : "opacity-0 -translate-x-3"
              : "opacity-100 translate-x-0",
          ].join(" ")}
        >
          {/* Step header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-text-primary">{step.title}</h2>
              {step.badge === "required" && (
                <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  {t("common.requiredBadge")}
                </span>
              )}
              {step.badge === "optional" && (
                <span className="text-[10px] font-medium text-text-muted bg-input-bg px-2 py-0.5 rounded-full border border-input-border/50">
                  {t("common.optionalBadge")}
                </span>
              )}
            </div>
            {step.description && (
              <p className="text-sm text-text-muted">{step.description}</p>
            )}
          </div>

          {/* Content */}
          <div>{step.content}</div>
        </div>
      </div>

      {/* ── Action bar ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted/50 hidden sm:block">
          {step.badge === "required" ? t("common.requiredNote") : t("common.optionalNote")}
        </p>

        <div className="flex items-center gap-2.5 ml-auto">
          {current === 0 ? (
            <Link
              href={cancelHref}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-input-bg transition-colors"
            >
              {t("common.cancel")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-input-bg transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {t("common.back")}
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting || !canAdvance}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-page disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shadow-sky-500/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("common.saving")}
              </>
            ) : isLast ? (
              <>
                {submitLabel ?? t("common.save")}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                {t("common.next")}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
