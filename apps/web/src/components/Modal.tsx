"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90dvh] flex flex-col rounded-lg border border-card-border bg-card shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-card-border shrink-0">
          <h2 className="text-lg md:text-[1.15rem] premium-card-title">{title}</h2>
          {description ? (
            <p className="premium-subtitle text-sm mt-1">{description}</p>
          ) : null}
        </div>
        <div className="p-5 md:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}

