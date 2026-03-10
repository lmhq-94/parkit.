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
  /** Para accesibilidad cuando el spinner es el único contenido de la zona */
  "aria-label"?: string;
}

/**
 * Spinner estándar de la plataforma: círculo animado girando.
 * Usar en botones (sm), bloques de carga (md/lg) y pantallas completas (lg).
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
      className={`inline-block rounded-full animate-spin ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`.trim()}
    />
  );
}
