"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store";

const HEX_COLOR = /^#[0-9A-Fa-f]{3,6}$/;

/**
 * Aplica los colores de branding de la empresa (primary/secondary) como variables CSS
 * en document.documentElement para que afecten a toda la aplicación.
 * Si no hay color personalizado, elimina la variable para que use el valor por defecto de globals.css.
 */
export function CompanyThemeSync() {
  const companyBranding = useDashboardStore((s) => s.companyBranding);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const primary = companyBranding?.primaryColor?.trim();
    const secondary = companyBranding?.secondaryColor?.trim();
    const validPrimary = primary && HEX_COLOR.test(primary);
    const validSecondary = secondary && HEX_COLOR.test(secondary);

    if (validPrimary) {
      document.documentElement.style.setProperty("--company-primary", primary!);
    } else {
      document.documentElement.style.removeProperty("--company-primary");
    }
    if (validSecondary) {
      document.documentElement.style.setProperty("--company-secondary", secondary!);
    } else {
      document.documentElement.style.removeProperty("--company-secondary");
    }
  }, [companyBranding?.primaryColor, companyBranding?.secondaryColor]);

  return null;
}
