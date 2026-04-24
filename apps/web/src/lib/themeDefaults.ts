/**
 * Default theme colors, aligned with the Parkit logo:
 * - Primary: blue from the "it." (blue-600 light, blue-500 dark).
 * - Secondary/Tertiary: slate neutrals for text and soft backgrounds.
 * Matches globals.css (:root and .dark).
 */
export const THEME_DEFAULT_PRIMARY_LIGHT = "#2563eb";   // blue-600 (logo "it." in light)
export const THEME_DEFAULT_PRIMARY_DARK = "#3b82f6";   // blue-500 (logo "it." in dark)
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
