"use client";

import { useRef, useCallback } from "react";
import { XCircle } from "@/lib/premiumIcons";
import dynamic from "next/dynamic";
import { useTranslation } from "@/hooks/useTranslation";

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

type BookingForQR = {
  id?: string;
  qrCodeReference?: string | null;
  vehicle?: { plate?: string; brand?: string; model?: string };
  parking?: { name?: string };
  scheduledEntryTime?: string;
};

interface BookingQRModalProps {
  booking: BookingForQR | null;
  open: boolean;
  onClose: () => void;
}

const QR_SIZE = 220;

export function BookingQRModal({ booking, open, onClose }: BookingQRModalProps) {
  const { t } = useTranslation();
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleDownload = useCallback(() => {
    const container = qrContainerRef.current;
    if (!container) return;
    const svg = container.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = QR_SIZE;
      canvas.height = QR_SIZE;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);
      ctx.drawImage(img, 0, 0, QR_SIZE, QR_SIZE);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `reserva-${booking?.id ?? "qr"}.png`;
      a.click();
    };
    img.src = url;
  }, [booking?.id]);

  if (!open) return null;

  const qrValue = booking?.qrCodeReference ?? booking?.id ?? "";
  const hasQR = qrValue !== "";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-qr-modal-title"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          aria-label={t("common.close")}
        >
          <XCircle className="w-5 h-5" />
        </button>

        <div className="pt-8 pb-6 px-6 text-center">
          <h2 id="booking-qr-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {t("bookings.qrModalTitle")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t("bookings.qrModalSubtitle")}
          </p>

          {hasQR ? (
            <>
              <div
                ref={qrContainerRef}
                className="inline-flex items-center justify-center rounded-2xl bg-white p-5 border-2 border-slate-100 dark:border-slate-700 shadow-inner"
              >
                <QRCode value={qrValue} size={QR_SIZE - 40} level="M" />
              </div>
              {booking?.vehicle?.plate && (
                <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {booking.vehicle.plate}
                  {booking.vehicle.brand || booking.vehicle.model
                    ? ` · ${[booking.vehicle.brand, booking.vehicle.model].filter(Boolean).join(" ")}`
                    : ""}
                </p>
              )}
              {booking?.parking?.name && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {booking.parking.name}
                </p>
              )}
              <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-company-primary bg-company-primary-subtle hover:bg-company-primary/20 transition-colors"
                >
                  {t("bookings.qrModalDownload")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t("common.close")}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
              {t("bookings.qrNotAvailable")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
