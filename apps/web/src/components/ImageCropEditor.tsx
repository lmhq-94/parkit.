"use client";

import { useState, useRef, useCallback } from "react";

type Props = {
  sourceDataUrl: string;
  aspectRatio: [number, number]; // [width, height] e.g. [1, 1] or [5, 1]
  /** Crop area size in px (how it appears in app). Example: logo 144x144, banner 400x80 */
  cropBoxWidth: number;
  cropBoxHeight: number;
  /** Fixed output width/height (e.g. logo 400x400, banner 1200x240) to fill area and preserve quality. */
  outputWidth: number;
  outputHeight: number;
  onApply: (croppedDataUrl: string) => void;
  onCancel: () => void;
  applyLabel?: string;
  cancelLabel?: string;
  hintText?: string;
  /** Small badge with ratio, e.g. "1:1" or "4:1" */
  aspectLabel?: string;
  /** If true, shows circular crop area (for logo/avatar) */
  circular?: boolean;
};

export function ImageCropEditor({
  sourceDataUrl,
  aspectRatio: [aspectW, aspectH],
  cropBoxWidth,
  cropBoxHeight,
  outputWidth,
  outputHeight,
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

  /** Minimum zoom so very large images can be reduced and fully seen in crop area. */
  const MIN_SCALE = 0.05;

  const imgOnLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setImageSize({ w, h });
      // Scale to COVER: image fills whole area (logo/banner), centered; minimum zoom for very large images
      const scaleToCoverW = cropBoxWidth / w;
      const scaleToCoverH = cropBoxHeight / h;
      const scaleToCover = Math.max(scaleToCoverW, scaleToCoverH);
      const initialScale = Math.max(scaleToCover * 1.01, MIN_SCALE);
      setScale(initialScale);
      const scaledW = w * initialScale;
      const scaledH = h * initialScale;
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
      // Which image area is visible inside crop box (image coordinates)
      const srcX = -position.x / scale;
      const srcY = -position.y / scale;
      const srcW = cropBoxWidth / scale;
      const srcH = cropBoxHeight / scale;
      // Clamp to image bounds
      const x = Math.max(0, Math.min(srcX, iw - 1));
      const y = Math.max(0, Math.min(srcY, ih - 1));
      const w = Math.min(srcW, iw - x);
      const h = Math.min(srcH, ih - y);
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        onApply(sourceDataUrl);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, x, y, w, h, 0, 0, outputWidth, outputHeight);
      onApply(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => onApply(sourceDataUrl);
    img.src = sourceDataUrl;
  }, [sourceDataUrl, position, scale, cropBoxWidth, cropBoxHeight, outputWidth, outputHeight, onApply]);

  const scaledW = imageSize ? imageSize.w * scale : 0;
  const scaledH = imageSize ? imageSize.h * scale : 0;

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
            aria-label="Crop area"
          >
            <div
              className="absolute left-0 top-0 overflow-hidden"
              style={{
                width: scaledW,
                height: scaledH,
                left: position.x,
                top: position.y,
              }}
            >
              <img
                src={sourceDataUrl}
                alt=""
                className="block w-full h-full pointer-events-none object-cover object-center"
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
            min={MIN_SCALE}
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
