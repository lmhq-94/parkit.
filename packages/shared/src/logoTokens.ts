/**
 * Wordmark Parkit — única fuente de verdad para tipografía del logo (web + móvil).
 * Misma fuente física: `apps/web/src/fonts/CalSans.ttf` y `assets/fonts/CalSans.ttf` en apps móviles.
 */

/** Familia registrada con `expo-font` / `useFonts` en las apps RN. */
export const LOGO_FONT_FAMILY_MOBILE = "CalSans" as const;

/**
 * Interletraje del wordmark (ligero ajuste negativo; web y RN comparten este valor).
 * En RN `letterSpacing` va en px → usar `logoLetterSpacingPx(size)`.
 */
export const LOGO_LETTER_SPACING_EM = -0.01;

export function logoLetterSpacingPx(fontSizePx: number): number {
  return fontSizePx * LOGO_LETTER_SPACING_EM;
}

/** Misma intención que `font-bold` (700) en la web. */
export const LOGO_FONT_WEIGHT_MOBILE = "700" as const;
