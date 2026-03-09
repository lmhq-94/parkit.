/**
 * Colores por defecto del tema (modo claro y oscuro).
 * Deben coincidir con los valores en globals.css (:root y .dark).
 * Se usan en Settings cuando no hay branding guardado y en fallbacks de var(--company-primary/secondary).
 */
export const THEME_DEFAULT_PRIMARY_LIGHT = "#2563eb";
export const THEME_DEFAULT_SECONDARY_LIGHT = "#64748b";
export const THEME_DEFAULT_PRIMARY_DARK = "#3b82f6";
export const THEME_DEFAULT_SECONDARY_DARK = "#94a3b8";

export function getThemeDefaultColors(isDark: boolean) {
  return {
    primary: isDark ? THEME_DEFAULT_PRIMARY_DARK : THEME_DEFAULT_PRIMARY_LIGHT,
    secondary: isDark ? THEME_DEFAULT_SECONDARY_DARK : THEME_DEFAULT_SECONDARY_LIGHT,
  };
}
