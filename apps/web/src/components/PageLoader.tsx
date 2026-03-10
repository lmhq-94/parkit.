"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

/**
 * Loader estándar para carga de página: círculo animado + texto "Cargando..." debajo.
 * Usar en cualquier pantalla o bloque que espere datos (dashboard, settings, profile, tablas, etc.).
 */
export function PageLoader() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <LoadingSpinner size="lg" variant="primary" />
      <p className="text-text-muted text-sm">{t("common.loading")}</p>
    </div>
  );
}
