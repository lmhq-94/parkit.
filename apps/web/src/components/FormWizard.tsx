"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ArrowRight, Check, AlertOctagon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
  /** Nota breve que se muestra encima de "Los campos marcados con * son obligatorios" (ej. invitación por correo). */
  footerNote?: React.ReactNode;
  /** Llamado antes de avanzar al siguiente paso. Si devuelve Promise, se espera (ej. cargar dimensiones). */
  onBeforeNext?: (fromStep: number, toStep: number) => void | Promise<void>;
  /** Llamado al hacer clic en Next o Save: valida el paso actual. Si devuelve false, no se avanza ni se envía. */
  onValidateBeforeAction?: (stepIndex: number) => boolean | Promise<boolean>;
}

export function FormWizard({
  steps,
  onSubmit,
  submitting,
  submitLabel,
  cancelHref,
  error,
  footerNote,
  onBeforeNext,
  onValidateBeforeAction,
}: FormWizardProps) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);

  const step = steps[current];
  const isLast = current === steps.length - 1;
  const canAdvance = step.badge === "optional" ? true : step.isValid();

  const goTo = (next: number, dir: "forward" | "back") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 160);
  };

  const handleNext = async () => {
    if (onValidateBeforeAction) {
      const valid = await Promise.resolve(onValidateBeforeAction(current));
      if (!valid) return;
    } else if (!canAdvance) return;
    if (isLast) {
      onSubmit();
      return;
    }
    const next = current + 1;
    if (onBeforeNext) {
      setNextLoading(true);
      try {
        await onBeforeNext(current, next);
      } finally {
        setNextLoading(false);
      }
    }
    goTo(next, "forward");
  };

  const handleBack = () => {
    if (current === 0) return;
    goTo(current - 1, "back");
  };

  return (
    <div className="flex-1 flex flex-col pt-14 pb-8 px-4 md:px-10 lg:px-12 w-full min-w-0 gap-8">

      {/* ── Error ───────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
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
              <h2 className="text-base premium-section-title">{step.title}</h2>
              {step.badge === "required" && (
                <span className="text-[11px] font-medium text-red-500">
                  {t("common.requiredBadge")}
                </span>
              )}
              {step.badge === "optional" && (
                <span className="text-[11px] font-medium text-text-muted">
                  {t("common.optionalBadge")}
                </span>
              )}
            </div>
            {step.description && (
              <p className="text-sm premium-subtitle">{step.description}</p>
            )}
          </div>

          {/* Content */}
          <div>{step.content}</div>
        </div>
      </div>

      {/* ── Stepper (above separator line) ─ */}
      {steps.length > 1 && (
        <div className="select-none flex items-center justify-center gap-2 pt-2 pb-1">
          {steps.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={[
                      "flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold transition-all duration-300",
                      done
                        ? "bg-company-primary text-white"
                        : active
                        ? "border border-company-primary text-company-primary bg-company-primary-subtle"
                        : "border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500",
                    ].join(" ")}
                  >
                    {done ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={[
                      "text-[11px] font-medium whitespace-nowrap transition-colors duration-200 hidden md:block",
                      active ? "text-text-primary" : done ? "text-company-primary" : "text-text-muted/50",
                    ].join(" ")}
                  >
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 min-w-[32px] md:min-w-[64px] max-w-[120px] h-[1px] rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600/60 shrink-0">
                    <div
                      className="h-full rounded-full bg-company-primary transition-all duration-500 ease-out"
                      style={{ width: i < current ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── Action bar (below separator line) ─ */}
      <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden sm:flex flex-col gap-1">
            {footerNote && (
              <p className="text-xs text-text-muted">
                {footerNote}
              </p>
            )}
            <p className="text-xs text-text-muted/50">
              {step.badge === "required" ? t("common.requiredNote") : t("common.optionalNote")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
          {current === 0 ? (
            <Link
              href={cancelHref}
              className="group px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-input-bg transition-colors"
            >
              {t("common.cancel")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-input-bg transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
              {t("common.back")}
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting || nextLoading || (onValidateBeforeAction ? false : !canAdvance)}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                {t("common.saving")}
              </>
            ) : nextLoading ? (
              <>
                <LoadingSpinner size="sm" />
                {t("common.loading")}
              </>
            ) : isLast ? (
              <>
                {submitLabel ?? t("common.save")}
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </>
            ) : (
              <>
                {t("common.next")}
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
