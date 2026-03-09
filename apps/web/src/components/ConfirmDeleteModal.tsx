"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export function ConfirmDeleteModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel, loading]);

  if (!open || typeof document === "undefined") return null;

  const content = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-label={cancelLabel}
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-card-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h2 id="confirm-delete-title" className="text-sm font-semibold text-text-primary">
              {title}
            </h2>
            <p id="confirm-delete-desc" className="text-sm text-text-secondary">
              {message}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-company-secondary-muted text-sm font-medium text-company-secondary hover:bg-company-secondary-subtle hover:text-company-secondary transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => void onConfirm()}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {loading ? "…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
