"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useDashboardStore } from "@/lib/store";
import { getThemeDefaultColors } from "@/lib/themeDefaults";

const HEX_COLOR = /^#[0-9A-Fa-f]{3,6}$/;

function setVariable(name: string, value: string) {
  if (value && HEX_COLOR.test(value)) {
    document.documentElement.style.setProperty(name, value);
  } else {
    document.documentElement.style.removeProperty(name);
  }
}

/**
 * Aplica los colores de branding como variables CSS en toda la app (dashboard, login, forgot-password).
 * Si no hay branding de empresa (login, forgot-password, antes de cargar), usa los colores por defecto
 * de themeDefaults para que esas páginas tengan la misma paleta (primary, secondary, tertiary).
 */
export function CompanyThemeSync() {
  const { resolvedTheme } = useTheme();
  const companyBranding = useDashboardStore((s) => s.companyBranding);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const defaults = getThemeDefaultColors(isDark);
    const primary =
      (isDark
        ? (companyBranding?.primaryColorDark?.trim() || companyBranding?.primaryColor?.trim())
        : companyBranding?.primaryColor?.trim()) || defaults.primary;
    const secondary =
      (isDark
        ? (companyBranding?.secondaryColorDark?.trim() || companyBranding?.secondaryColor?.trim())
        : companyBranding?.secondaryColor?.trim()) || defaults.secondary;
    const tertiary =
      (isDark
        ? (companyBranding?.tertiaryColorDark?.trim() || companyBranding?.tertiaryColor?.trim())
        : companyBranding?.tertiaryColor?.trim()) || defaults.tertiary;
    setVariable("--company-primary", primary);
    setVariable("--company-secondary", secondary);
    setVariable("--company-tertiary", tertiary);
  }, [
    isDark,
    companyBranding?.primaryColor,
    companyBranding?.primaryColorDark,
    companyBranding?.secondaryColor,
    companyBranding?.secondaryColorDark,
    companyBranding?.tertiaryColor,
    companyBranding?.tertiaryColorDark,
  ]);

  return null;
}
