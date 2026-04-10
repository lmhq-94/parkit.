"use client";

import { useEffect, useState } from "react";
import { useToastStore } from "@/lib/toastStore";
import { Check, AlertOctagon, Info, XCircle } from "lucide-react";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2 w-full max-w-[360px] pointer-events-none"
      aria-live="polite"
      role="region"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 rounded-xl border bg-card/95 backdrop-blur-sm shadow-lg border-card-border py-2.5 px-3.5 text-sm"
          role="status"
        >
          {toast.type === "success" && (
            <span className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            </span>
          )}
          {toast.type === "error" && (
            <span className="shrink-0 w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            </span>
          )}
          {toast.type === "info" && (
            <span className="shrink-0 w-8 h-8 rounded-full bg-slate-500/15 flex items-center justify-center">
              <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" strokeWidth={2} />
            </span>
          )}
          <p className="flex-1 min-w-0 text-text-primary font-medium truncate pr-1">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => remove(toast.id)}
            className="shrink-0 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-input-bg transition-colors"
            aria-label="Cerrar"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
