"use client";

import { useCallback, useMemo } from "react";
import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  createdAt: number;
};

const TOAST_DURATION = 4000;
const MAX_TOASTS = 3;

interface ToastStore {
  toasts: Toast[];
  add: (type: ToastType, message: string, duration?: number) => void;
  remove: (id: string) => void;
}

function generateId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message, duration = TOAST_DURATION) => {
    const id = generateId();
    const toast: Toast = { id, type, message, duration, createdAt: Date.now() };
    set((state) => ({
      toasts: [...state.toasts.slice(-(MAX_TOASTS - 1)), toast],
    }));
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },
  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const add = useToastStore((s) => s.add);
  const showSuccess = useCallback(
    (message: string, duration?: number) => add("success", message, duration),
    [add]
  );
  const showError = useCallback(
    (message: string, duration?: number) => add("error", message, duration),
    [add]
  );
  const showInfo = useCallback(
    (message: string, duration?: number) => add("info", message, duration),
    [add]
  );
  return useMemo(
    () => ({ showSuccess, showError, showInfo }),
    [showSuccess, showError, showInfo]
  );
}
