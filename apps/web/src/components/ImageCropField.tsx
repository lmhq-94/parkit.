"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { ImageCropEditor } from "@/components/ImageCropEditor";

const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Error al leer la imagen"));
    r.readAsDataURL(file);
  });
}

/** Redimensiona la imagen si supera maxDimension para que el editor de crop la maneje bien y ocupe todo el espacio. */
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

const LOGO_CROP_SIZE = 176;
const BANNER_CROP_W = 400;
const BANNER_CROP_H = 80;

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
  const rowWrapper = "flex flex-col gap-3 border-b border-card-border pb-6 last:border-0 last:pb-0 min-w-0";

  const wrapContent = (content: React.ReactNode) =>
    isRow ? (
      <div className={rowWrapper}>
        <div>{headerClassName ? <div className={headerClassName}>{header}</div> : header}</div>
        <div className="min-w-0 w-full flex justify-start">{content}</div>
      </div>
    ) : (
      <div className="rounded-xl border border-card-border bg-card/80 p-5 space-y-4 min-w-0">
        {headerClassName ? <div className={headerClassName}>{header}</div> : header}
        {content}
      </div>
    );

  if (pendingCrop) {
    return wrapContent(
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
    );
  }

  if (value) {
    const previewContent = (
      <div className="flex flex-col gap-4 flex-1 min-h-0" style={layout === "card" ? { minHeight: contentMinHeight } : undefined}>
        <div className={`overflow-hidden rounded-xl bg-input-bg ring-1 ring-black/5 dark:ring-white/5 shrink-0 w-full flex items-center justify-center ${isLogo ? "rounded-full max-w-[176px] aspect-square" : "rounded-xl aspect-[5/1] max-w-[400px] min-w-[240px]"}`}>
          <img src={value} alt="" className={`w-full h-full object-cover object-center ${isLogo ? "rounded-full" : ""}`} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`overflow-hidden rounded-lg bg-input-bg ring-1 ring-black/5 dark:ring-white/5 shrink-0 flex items-center justify-center ${isLogo ? "rounded-full" : ""}`} style={{ width: isLogo ? 44 : 80, height: isLogo ? 44 : 20 }}>
              <img src={value} alt="" className="w-full h-full object-cover object-center" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-0.5">
          <button type="button" onClick={() => setPendingCrop(value)} className="text-sm font-medium text-company-primary hover:text-company-primary/90 transition-colors whitespace-nowrap">
            {t("settings.changeImage")}
          </button>
          <button type="button" onClick={onClear} className="flex items-center gap-1.5 text-sm font-medium text-company-tertiary hover:text-red-500 dark:hover:text-red-400 transition-colors whitespace-nowrap">
            <X className="w-4 h-4 shrink-0" />
            {t("settings.removeImage")}
          </button>
        </div>
      </div>
    );
    if (isRow) {
      return (
        <div className={rowWrapper}>
          <div>{headerClassName ? <div className={headerClassName}>{header}</div> : header}</div>
          <div className="min-w-0 w-full flex justify-start">{previewContent}</div>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-card-border bg-card/80 p-5 min-w-0 flex flex-col" style={{ minHeight: cardMinHeight }}>
        {headerClassName ? <div className={headerClassName}>{header}</div> : header}
        {previewContent}
      </div>
    );
  }

  const dropZonePadding = isLogo ? "py-6 px-5" : "py-4 px-4";
  const dropZoneBase = `relative transition-all duration-200 flex flex-col items-center justify-center gap-3 shrink-0 cursor-pointer ${dropZonePadding} `;
  const dropZoneState = dragOver
    ? "border-2 border-dashed border-company-primary bg-company-primary-subtle/50 ring-2 ring-company-primary/20 "
    : "border-2 border-dashed border-input-border bg-input-bg/60 hover:border-company-primary-muted hover:bg-company-primary-subtle/30 ";
  const dropZoneShape = isLogo ? "rounded-full w-full max-w-[176px] aspect-square min-w-[120px]" : "rounded-xl w-full max-w-[400px] min-w-[240px] aspect-[5/1]";
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
        <span className={`font-medium text-text-secondary text-center leading-snug px-1 max-w-[90%] ${isLogo ? "text-sm" : "text-xs"}`}>
          {t(isLogo ? "settings.dragOrClick" : "settings.dragOrClickShort")}
        </span>
      </div>
    </>
  );

  if (isRow) {
    return (
      <div className={rowWrapper}>
        <div>{headerClassName ? <div className={headerClassName}>{header}</div> : header}</div>
        <div className="min-w-0 w-full flex justify-start">{emptyContent}</div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-card-border bg-card/80 p-5 min-w-0 flex flex-col" style={{ minHeight: cardMinHeight }}>
      {headerClassName ? <div className={headerClassName}>{header}</div> : header}
      {emptyContent}
    </div>
  );
}
