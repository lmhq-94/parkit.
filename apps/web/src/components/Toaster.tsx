"use client";

import { useEffect, useState } from "react";
import { useToastStore } from "@/lib/toastStore";
import { Check, AlertOctagon, Info, XCircle } from "@/lib/premiumIcons";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 w-full max-w-[360px] pointer-events-none"
      aria-live="polite"
      role="region"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border bg-white dark:bg-gray-900 shadow-xl border-gray-200 dark:border-gray-700 py-3 px-4 text-sm animate-in slide-in-from-right-full duration-300"
          role="status"
        >
          {toast.type === "success" && (
            <span className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            </span>
          )}
          {toast.type === "error" && (
            <span className="shrink-0 w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mt-0.5">
              <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            </span>
          )}
          {toast.type === "info" && (
            <span className="shrink-0 w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
            </span>
          )}
          <p className="flex-1 min-w-0 text-gray-900 dark:text-gray-100 font-medium leading-snug mt-0.5">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => remove(toast.id)}
            className="shrink-0 p-1 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-0.5"
            aria-label="Cerrar"
          >
            <XCircle className="w-4.5 h-4.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
