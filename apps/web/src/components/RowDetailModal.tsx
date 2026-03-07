"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";

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
        className="relative w-full max-w-3xl bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-8 py-5 bg-card border-b border-card-border">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text-primary truncate leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-text-muted truncate">{subtitle}</p>}
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
                className="p-2 rounded-lg text-text-muted hover:text-sky-500 hover:bg-sky-500/10 transition-colors"
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
              <X className="w-4 h-4" />
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

export function DetailField({
  label,
  value,
  wide,
}: {
  label: string;
  value?: string | number | null;
  wide?: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-xs text-text-muted mb-1.5">{label}</p>
      <p className="text-sm font-medium text-text-primary leading-relaxed">{String(value)}</p>
    </div>
  );
}

export function DetailSeparator() {
  return <div className="col-span-3 h-px bg-card-border/30" />;
}

export function DetailSectionLabel({ text }: { text: string }) {
  return (
    <div className="col-span-3 -mb-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{text}</p>
    </div>
  );
}
