/**
 * Colores por defecto del tema (coinciden con globals.css :root en web).
 * Se usan para normalizar brandingConfig cuando primary/secondary no están guardados en DB.
 */
export const DEFAULT_PRIMARY = "#2563eb";
export const DEFAULT_SECONDARY = "#64748b";

export type BrandingConfigRaw = {
  bannerImageUrl?: string | null;
  logoImageUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  [key: string]: unknown;
};

const HEX_COLOR = /^#[0-9A-Fa-f]{3,6}$/;

export function normalizeBrandingConfig(
  raw: BrandingConfigRaw | null | undefined
): BrandingConfigRaw {
  if (!raw || typeof raw !== "object") {
    return {
      bannerImageUrl: null,
      logoImageUrl: null,
      primaryColor: DEFAULT_PRIMARY,
      secondaryColor: DEFAULT_SECONDARY,
    };
  }
  return {
    ...raw,
    bannerImageUrl: raw.bannerImageUrl ?? null,
    logoImageUrl: raw.logoImageUrl ?? null,
    primaryColor:
      raw.primaryColor && HEX_COLOR.test(String(raw.primaryColor))
        ? raw.primaryColor
        : DEFAULT_PRIMARY,
    secondaryColor:
      raw.secondaryColor && HEX_COLOR.test(String(raw.secondaryColor))
        ? raw.secondaryColor
        : DEFAULT_SECONDARY,
  };
}
