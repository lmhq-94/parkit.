/**
 * Colores por defecto (alineados con logo Parkit: blue-600/500, slate).
 * Light = modo claro, Dark = modo oscuro (mejor contraste).
 */
export const DEFAULT_PRIMARY_LIGHT = "#2563eb";
export const DEFAULT_PRIMARY_DARK = "#3b82f6";
export const DEFAULT_SECONDARY_LIGHT = "#64748b";
export const DEFAULT_SECONDARY_DARK = "#94a3b8";
export const DEFAULT_TERTIARY_LIGHT = "#94a3b8";
export const DEFAULT_TERTIARY_DARK = "#cbd5e1";

/** @deprecated Use DEFAULT_PRIMARY_LIGHT for backwards compat */
export const DEFAULT_PRIMARY = DEFAULT_PRIMARY_LIGHT;
export const DEFAULT_SECONDARY = DEFAULT_SECONDARY_LIGHT;
export const DEFAULT_TERTIARY = DEFAULT_TERTIARY_LIGHT;

export type BrandingConfigRaw = {
  bannerImageUrl?: string | null;
  logoImageUrl?: string | null;
  primaryColor?: string | null;
  primaryColorDark?: string | null;
  secondaryColor?: string | null;
  secondaryColorDark?: string | null;
  tertiaryColor?: string | null;
  tertiaryColorDark?: string | null;
  [key: string]: unknown;
};

/** Objeto por defecto para brandingConfig en BD (colores e imágenes por defecto). */
export const DEFAULT_BRANDING_CONFIG: BrandingConfigRaw = {
  bannerImageUrl: null,
  logoImageUrl: null,
  primaryColor: DEFAULT_PRIMARY_LIGHT,
  primaryColorDark: DEFAULT_PRIMARY_DARK,
  secondaryColor: DEFAULT_SECONDARY_LIGHT,
  secondaryColorDark: DEFAULT_SECONDARY_DARK,
  tertiaryColor: DEFAULT_TERTIARY_LIGHT,
  tertiaryColorDark: DEFAULT_TERTIARY_DARK,
};

const HEX_COLOR = /^#[0-9A-Fa-f]{3,6}$/;

export function normalizeBrandingConfig(
  raw: BrandingConfigRaw | null | undefined
): BrandingConfigRaw {
  if (!raw || typeof raw !== "object") {
    return {
      bannerImageUrl: null,
      logoImageUrl: null,
      primaryColor: DEFAULT_PRIMARY_LIGHT,
      primaryColorDark: DEFAULT_PRIMARY_DARK,
      secondaryColor: DEFAULT_SECONDARY_LIGHT,
      secondaryColorDark: DEFAULT_SECONDARY_DARK,
      tertiaryColor: DEFAULT_TERTIARY_LIGHT,
      tertiaryColorDark: DEFAULT_TERTIARY_DARK,
    };
  }
  const primary = raw.primaryColor && HEX_COLOR.test(String(raw.primaryColor)) ? raw.primaryColor : DEFAULT_PRIMARY_LIGHT;
  const primaryDark = raw.primaryColorDark && HEX_COLOR.test(String(raw.primaryColorDark)) ? raw.primaryColorDark : DEFAULT_PRIMARY_DARK;
  const secondary = raw.secondaryColor && HEX_COLOR.test(String(raw.secondaryColor)) ? raw.secondaryColor : DEFAULT_SECONDARY_LIGHT;
  const secondaryDark = raw.secondaryColorDark && HEX_COLOR.test(String(raw.secondaryColorDark)) ? raw.secondaryColorDark : DEFAULT_SECONDARY_DARK;
  const tertiary = raw.tertiaryColor && HEX_COLOR.test(String(raw.tertiaryColor)) ? raw.tertiaryColor : DEFAULT_TERTIARY_LIGHT;
  const tertiaryDark = raw.tertiaryColorDark && HEX_COLOR.test(String(raw.tertiaryColorDark)) ? raw.tertiaryColorDark : DEFAULT_TERTIARY_DARK;
  return {
    ...raw,
    bannerImageUrl: raw.bannerImageUrl ?? null,
    logoImageUrl: raw.logoImageUrl ?? null,
    primaryColor: primary,
    primaryColorDark: primaryDark,
    secondaryColor: secondary,
    secondaryColorDark: secondaryDark,
    tertiaryColor: tertiary,
    tertiaryColorDark: tertiaryDark,
  };
}
