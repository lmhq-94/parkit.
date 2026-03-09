"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useDashboardStore } from "@/lib/store";

const HEX_COLOR = /^#[0-9A-Fa-f]{3,6}$/;

function setOrRemove(name: string, value: string | undefined) {
  if (value && HEX_COLOR.test(value)) {
    document.documentElement.style.setProperty(name, value);
  } else {
    document.documentElement.style.removeProperty(name);
  }
}

/**
 * Aplica los colores de branding como variables CSS. Usa la variante light o dark
 * según el tema actual para mantener contraste (modo claro vs oscuro).
 */
export function CompanyThemeSync() {
  const { resolvedTheme } = useTheme();
  const companyBranding = useDashboardStore((s) => s.companyBranding);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const primary = isDark
      ? (companyBranding?.primaryColorDark?.trim() || companyBranding?.primaryColor?.trim())
      : companyBranding?.primaryColor?.trim();
    const secondary = isDark
      ? (companyBranding?.secondaryColorDark?.trim() || companyBranding?.secondaryColor?.trim())
      : companyBranding?.secondaryColor?.trim();
    const tertiary = isDark
      ? (companyBranding?.tertiaryColorDark?.trim() || companyBranding?.tertiaryColor?.trim())
      : companyBranding?.tertiaryColor?.trim();
    setOrRemove("--company-primary", primary);
    setOrRemove("--company-secondary", secondary);
    setOrRemove("--company-tertiary", tertiary);
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
