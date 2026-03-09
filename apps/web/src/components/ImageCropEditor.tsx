"use client";

import { useState, useRef, useCallback } from "react";

type Props = {
  sourceDataUrl: string;
  aspectRatio: [number, number]; // [width, height] e.g. [1, 1] or [4, 1]
  /** Tamaño en px del área de crop (cómo se ve en la app). Ej: logo 144x144, banner 320x80 */
  cropBoxWidth: number;
  cropBoxHeight: number;
  outputMaxWidth: number;
  onApply: (croppedDataUrl: string) => void;
  onCancel: () => void;
  applyLabel?: string;
  cancelLabel?: string;
  hintText?: string;
  /** Badge pequeño con el ratio, ej. "1:1" o "4:1" */
  aspectLabel?: string;
  /** Si true, muestra el área de crop en círculo (para logo/avatar) */
  circular?: boolean;
};

export function ImageCropEditor({
  sourceDataUrl,
  aspectRatio: [aspectW, aspectH],
  cropBoxWidth,
  cropBoxHeight,
  outputMaxWidth,
  onApply,
  onCancel,
  applyLabel = "Apply",
  cancelLabel = "Cancel",
  hintText = "Drag the image to frame it. Adjust zoom if needed.",
  aspectLabel,
  circular = false,
}: Props) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const imgOnLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setImageSize({ w, h });
      // Centrar imagen en el crop box
      const scaleToFit = Math.min(cropBoxWidth / w, cropBoxHeight / h);
      setScale(Math.max(scaleToFit, 0.5));
      const scaledW = w * scaleToFit;
      const scaledH = h * scaleToFit;
      setPosition({
        x: (cropBoxWidth - scaledW) / 2,
        y: (cropBoxHeight - scaledH) / 2,
      });
    },
    [cropBoxWidth, cropBoxHeight]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: position.x, posY: position.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({ x: dragStart.current.posX + dx, y: dragStart.current.posY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleApply = useCallback(() => {
    const img = new Image();
    img.onload = () => {
      const { width: iw, height: ih } = img;
      // Qué parte de la imagen está visible en el crop box (en coords de imagen)
      const srcX = -position.x / scale;
      const srcY = -position.y / scale;
      const srcW = cropBoxWidth / scale;
      const srcH = cropBoxHeight / scale;
      // Clamp al tamaño de la imagen
      const x = Math.max(0, Math.min(srcX, iw - 1));
      const y = Math.max(0, Math.min(srcY, ih - 1));
      const w = Math.min(srcW, iw - x);
      const h = Math.min(srcH, ih - y);
      const outW = Math.min(Math.round((w / srcW) * cropBoxWidth), outputMaxWidth);
      const outH = Math.round(outW / (aspectW / aspectH));
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        onApply(sourceDataUrl);
        return;
      }
      ctx.drawImage(img, x, y, w, h, 0, 0, outW, outH);
      onApply(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => onApply(sourceDataUrl);
    img.src = sourceDataUrl;
  }, [sourceDataUrl, position, scale, cropBoxWidth, cropBoxHeight, aspectW, aspectH, outputMaxWidth, onApply]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-text-muted">{hintText}</p>
        <div className={`relative inline-block w-fit ${circular ? "mx-auto" : ""}`}>
        <div
          ref={containerRef}
          className={`relative overflow-hidden bg-input-bg ring-1 ring-black/5 dark:ring-white/10 select-none cursor-move ${circular ? "rounded-full" : "rounded-xl"}`}
          style={{ width: cropBoxWidth, height: cropBoxHeight }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => setDragging(false)}
            role="img"
            aria-label="Área de recorte"
          >
            <div
              className="absolute top-0 left-0 will-change-transform"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: "0 0",
              }}
            >
              <img
                src={sourceDataUrl}
                alt=""
                className="block pointer-events-none"
                style={imageSize ? { width: imageSize.w, height: imageSize.h } : undefined}
                onLoad={imgOnLoad}
                draggable={false}
              />
            </div>
          </div>
          {aspectLabel && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-black/50 text-white/90">
              {aspectLabel}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <label className="flex items-center gap-3 min-w-0 sm:min-w-[180px]">
          <span className="text-sm font-medium text-text-secondary w-10 shrink-0">Zoom</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="flex-1 min-w-0 h-2 rounded-lg"
            style={{ accentColor: "var(--company-primary, #2563eb)" }}
          />
        </label>
        <div className="flex items-center justify-end sm:justify-start gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-input-border text-text-secondary hover:bg-input-bg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2.5 text-sm font-medium rounded-lg bg-company-primary text-white hover:opacity-95 transition-opacity"
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
