/**
 * Colores por defecto del tema, alineados con el logo Parkit:
 * - Primary: azul del "it." (blue-600 claro, blue-500 oscuro).
 * - Secondary/Tertiary: neutros slate para texto y fondos suaves.
 * Coinciden con globals.css (:root y .dark).
 */
export const THEME_DEFAULT_PRIMARY_LIGHT = "#2563eb";   // blue-600 (logo "it." en claro)
export const THEME_DEFAULT_PRIMARY_DARK = "#3b82f6";   // blue-500 (logo "it." en oscuro)
export const THEME_DEFAULT_SECONDARY_LIGHT = "#64748b"; // slate-500
export const THEME_DEFAULT_SECONDARY_DARK = "#94a3b8";  // slate-400
export const THEME_DEFAULT_TERTIARY_LIGHT = "#94a3b8"; // slate-400
export const THEME_DEFAULT_TERTIARY_DARK = "#cbd5e1";  // slate-300

export function getThemeDefaultColors(isDark: boolean) {
  return {
    primary: isDark ? THEME_DEFAULT_PRIMARY_DARK : THEME_DEFAULT_PRIMARY_LIGHT,
    secondary: isDark ? THEME_DEFAULT_SECONDARY_DARK : THEME_DEFAULT_SECONDARY_LIGHT,
    tertiary: isDark ? THEME_DEFAULT_TERTIARY_DARK : THEME_DEFAULT_TERTIARY_LIGHT,
  };
}
