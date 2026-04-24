/**
 * Parkit wordmark — single source of truth for logo typography (web + mobile).
 * Same physical font: `apps/web/src/fonts/CalSans.ttf` and `assets/fonts/CalSans.ttf` in mobile apps.
 */

/** Font family registered with `expo-font` / `useFonts` in RN apps. */
export const LOGO_FONT_FAMILY_MOBILE = "CalSans" as const;

/**
 * Wordmark letter spacing (slight negative adjustment; web and RN share this value).
 * In RN `letterSpacing` is in px → use `logoLetterSpacingPx(size)`.
 */
export const LOGO_LETTER_SPACING_EM = -0.02;

export function logoLetterSpacingPx(fontSizePx: number): number {
  return fontSizePx * LOGO_LETTER_SPACING_EM;
}

/** Same intent as `font-bold` (700) on the web. */
export const LOGO_FONT_WEIGHT_MOBILE = "800" as const;
