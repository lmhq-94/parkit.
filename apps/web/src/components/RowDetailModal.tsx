"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Pencil, XCircle } from "@/lib/premiumIcons";

export interface RowDetailModalProps {
  title: string;
  subtitle?: string;
  statusLabel?: string;
  statusActive?: boolean;
  editHref?: string;
  canEdit?: boolean;
  onClose: () => void;
  t: (key: string) => string;
  children: React.ReactNode;
}

export function RowDetailModal({
  title,
  subtitle,
  statusLabel,
  statusActive = false,
  editHref,
  canEdit,
  onClose,
  t,
  children,
}: RowDetailModalProps) {
  useEffect(() => {
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl bg-card border border-card-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-8 py-5 bg-card border-b border-card-border">
          <div className="min-w-0">
            <h2 className="text-base premium-card-title truncate">{title}</h2>
            {subtitle && <p className="text-xs premium-subtitle truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {statusLabel && (
              <span
                className={[
                  "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border",
                  statusActive
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/20",
                ].join(" ")}
              >
                <span
                  className={["w-1.5 h-1.5 rounded-full", statusActive ? "bg-emerald-400" : "bg-amber-400"].join(" ")}
                />
                {statusLabel}
              </span>
            )}
            {canEdit && editHref && (
              <Link
                href={editHref}
                onClick={onClose}
                className="p-2 rounded-lg text-text-muted hover:text-company-primary hover:bg-company-primary-subtle transition-colors"
                title={t("common.edit")}
                aria-label={t("common.edit")}
              >
                <Pencil className="w-4 h-4" />
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              title={t("common.cancel")}
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="px-8 py-7">{children}</div>
        <div className="flex items-center justify-end px-8 py-4 bg-card border-t border-card-border">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function hasDetailFieldValue(value: string | number | null | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") {
    const s = value.trim();
    if (s === "") return false;
    // Matches translateEnum() when enum is empty (avoids showing "N/A" in detail view).
    if (s === "N/A") return false;
  }
  return true;
}

export function DetailField({
  label,
  value,
  wide,
  linkType,
  multiline,
}: {
  label: string;
  value?: string | number | null;
  wide?: boolean;
  linkType?: "email" | "phone";
  multiline?: boolean;
}) {
  if (!hasDetailFieldValue(value)) {
    return null;
  }
  const str = String(value);
  const href = linkType === "email" ? `mailto:${str}` : linkType === "phone" ? `tel:${str}` : undefined;
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500/90 dark:text-slate-400/90 mb-1">
        {label}
      </dt>
      <dd
        className={
          multiline
            ? "text-sm text-slate-900 dark:text-slate-50 font-medium leading-relaxed break-words whitespace-pre-wrap"
            : "text-sm text-slate-900 dark:text-slate-50 font-medium leading-relaxed truncate"
        }
        title={str}
      >
        {href ? (
          <a href={href} className="text-company-primary hover:underline">
            {str}
          </a>
        ) : (
          str
        )}
      </dd>
    </div>
  );
}

export function DetailSeparator() {
  return <div className="col-span-full h-px bg-slate-200/60 dark:bg-slate-600/40 my-1" />;
}

export function DetailSectionLabel({ text }: { text: string }) {
  return (
    <div className="col-span-full mt-5 first:mt-0 mb-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500/95 dark:text-slate-400/95">
        {text}
      </p>
    </div>
  );
}
