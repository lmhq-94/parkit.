"use client";

export type LoadingSpinnerSize = "sm" | "md" | "lg";
export type LoadingSpinnerVariant = "primary" | "muted" | "white";

const SIZE_CLASSES: Record<LoadingSpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-2",
};

const VARIANT_CLASSES: Record<LoadingSpinnerVariant, string> = {
  primary:
    "border-company-primary border-t-transparent",
  muted:
    "border-company-primary-muted border-t-company-primary",
  white:
    "border-white/30 border-t-white",
};

export interface LoadingSpinnerProps {
  size?: LoadingSpinnerSize;
  variant?: LoadingSpinnerVariant;
  className?: string;
  /** For accessibility when the spinner is the only content in the area */
  "aria-label"?: string;
}

/**
 * Standard platform spinner: rotating animated circle.
 * Use in buttons (sm), loading blocks (md/lg) and full screens (lg).
 */
export function LoadingSpinner({
  size = "md",
  variant = "primary",
  className = "",
  "aria-label": ariaLabel = "Cargando",
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-block rounded-full loading-spinner-ring ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`.trim()}
    />
  );
}
