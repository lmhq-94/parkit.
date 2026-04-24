"use client";

import { useState, useRef } from "react";
import { Upload, XCircle, Crop } from "@/lib/premiumIcons";
import { ImageCropEditor } from "@/components/ImageCropEditor";

const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Error reading the image"));
    r.readAsDataURL(file);
  });
}

/** Resizes the image if it exceeds maxDimension so the crop editor handles it well and fills the space. */
function resizeImageToFit(dataUrl: string, maxDimension: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const max = Math.max(w, h);
      if (max <= maxDimension) {
        resolve(dataUrl);
        return;
      }
      const scale = maxDimension / max;
      const outW = Math.round(w * scale);
      const outH = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, outW, outH);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Error al cargar la imagen"));
    img.src = dataUrl;
  });
}

const LOGO_CROP_SIZE = 220;
const BANNER_CROP_W = 500;
const BANNER_CROP_H = 100;

export function ImageCropField({
  kind,
  value,
  onChange,
  onClear,
  label,
  description,
  recommendedSize,
  headerClassName,
  layout = "card",
  t,
}: {
  kind: "logo" | "banner";
  value: string;
  onChange: (dataUrl: string) => void;
  onClear: () => void;
  label: string;
  description?: string;
  recommendedSize: string;
  headerClassName?: string;
  layout?: "card" | "row";
  t: (key: string) => string;
}) {
  const [pendingCrop, setPendingCrop] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLogo = kind === "logo";
  const aspectRatio: [number, number] = isLogo ? [1, 1] : [5, 1];
  const cropBoxWidth = isLogo ? LOGO_CROP_SIZE : BANNER_CROP_W;
  const cropBoxHeight = isLogo ? LOGO_CROP_SIZE : BANNER_CROP_H;
  const outputWidth = isLogo ? 400 : 1200;
  const outputHeight = isLogo ? 400 : 240;
  const MAX_DIMENSION_BEFORE_RESIZE = 2000;

  const processFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    readFileAsDataUrl(file)
      .then((dataUrl) => resizeImageToFit(dataUrl, MAX_DIMENSION_BEFORE_RESIZE))
      .then((dataUrl) => setPendingCrop(dataUrl))
      .catch(() => {});
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    processFile(file ?? null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0] ?? null);
  };

  const header = (
    <>
      <label className={LABEL}>{label}</label>
      {(description || recommendedSize) && (
        <p className="text-xs text-company-tertiary mt-0.5 break-words">
          {description}
          {description && recommendedSize && " "}
          {recommendedSize && t("settings.recommendedFormat").replace("{{size}}", recommendedSize)}
        </p>
      )}
    </>
  );

  const contentMinHeight = isLogo ? 280 : 184;
  const cardMinHeight = 92 + contentMinHeight;

  const isRow = layout === "row";
  const rowWrapper = "flex flex-col gap-3 min-w-0";

  // Modal de crop - estilo premium estándar del sistema
  if (pendingCrop) {
    return (
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-modal-title"
      >
        <button
          type="button"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-label={t("common.close")}
          onClick={() => setPendingCrop(null)}
        />
        <div
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg border border-card-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-card-border shrink-0">
            <h2 id="crop-modal-title" className="text-sm premium-section-title flex items-center gap-2">
              <Crop className="w-4 h-4 text-company-primary" />
              {isLogo ? t("settings.cropLogoTitle") : t("settings.cropBannerTitle")}
            </h2>
            <button
              type="button"
              onClick={() => setPendingCrop(null)}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-input-bg transition-colors"
              aria-label={t("common.close")}
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            <ImageCropEditor
              sourceDataUrl={pendingCrop}
              aspectRatio={aspectRatio}
              cropBoxWidth={cropBoxWidth}
              cropBoxHeight={cropBoxHeight}
              outputWidth={outputWidth}
              outputHeight={outputHeight}
              onApply={(url) => {
                onChange(url);
                setPendingCrop(null);
              }}
              onCancel={() => setPendingCrop(null)}
              applyLabel={t("settings.cropApply")}
              cancelLabel={t("settings.cropCancel")}
              hintText={t("settings.cropHint")}
              aspectLabel={isLogo ? "1:1" : "5:1"}
              circular={isLogo}
            />
          </div>
        </div>
      </div>
    );
  }

  // Contenido cuando hay imagen
  const previewContent = value ? (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
      {/* Main Upload Area */}
      <div className="flex flex-col gap-4 flex-1 min-w-0 w-full lg:w-auto order-1">
        <div className={`overflow-hidden bg-input-bg ring-1 ring-black/5 dark:ring-white/5 shrink-0 w-full flex items-center justify-center ${isLogo ? "rounded-full max-w-[220px] aspect-square" : "rounded-lg max-w-[500px]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className={`w-full h-full object-cover object-center ${isLogo ? "rounded-full" : "rounded-lg"}`} style={!isLogo ? { aspectRatio: "5/1" } : undefined} />
        </div>
        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0 pt-0.5">
          <button type="button" onClick={() => setPendingCrop(value)} className="text-sm font-medium text-company-primary hover:text-company-primary/90 transition-colors whitespace-nowrap">
            {t("settings.changeImage")}
          </button>
          <button type="button" onClick={onClear} className="group flex items-center gap-1.5 text-sm font-medium text-company-tertiary hover:text-red-500 dark:hover:text-red-400 transition-colors whitespace-nowrap">
            <XCircle className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
            {t("settings.removeImage")}
          </button>
        </div>
      </div>
      {/* System Preview */}
      <div className="shrink-0 order-2">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium">vista previa en el sistema</p>
          <div className={`overflow-hidden bg-input-bg ring-1 ring-black/5 dark:ring-white/5 flex items-center justify-center ${isLogo ? "rounded-full w-16 h-16" : "rounded-lg w-full max-w-[280px] h-16"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className={`w-full h-full object-cover object-center ${isLogo ? "rounded-full" : "rounded-lg"}`} />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const dropZoneBase = "relative transition-all duration-200 flex flex-col items-center justify-center gap-4 shrink-0 cursor-pointer py-12 px-8 min-h-[240px] ";
  const dropZoneState = dragOver
    ? "border-2 border-dashed border-company-primary bg-company-primary-subtle/50 "
    : "border-2 border-dashed border-input-border bg-input-bg/60 hover:border-company-primary-muted hover:bg-company-primary-subtle/30 ";
  const dropZoneShape = "rounded-2xl w-full h-full";
  const dropZoneClass = dropZoneBase + dropZoneState + dropZoneShape;

  const emptyContent = (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div
        className={dropZoneClass}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
      >
        <Upload className="w-8 h-8 text-company-tertiary shrink-0" />
        <span className="font-medium text-text-secondary text-center leading-snug px-1 max-w-[90%] text-sm">
          {t("settings.dragOrClickShort")}
        </span>
      </div>
    </>
  );

  if (isRow) {
    return (
      <div className={rowWrapper}>
        <div>{headerClassName ? <div className={headerClassName}>{header}</div> : header}</div>
        <div className="min-w-0 w-full">
          {value ? previewContent : emptyContent}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-card-border bg-card/80 p-5 min-w-0 flex flex-col" style={{ minHeight: cardMinHeight }}>
      {headerClassName ? <div className={headerClassName}>{header}</div> : header}
      {emptyContent}
    </div>
  );
}
