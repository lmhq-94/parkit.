/**
 * Tokens de interfaz orientados a legibilidad y facilidad de uso
 * (texto grande, contraste alto, zonas táctiles amplias).
 */
export const valetHomeTheme = {
  colors: {
    bg: "#F1F5F9",
    card: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#475569",
    textSubtle: "#64748B",
    border: "#CBD5E1",
    primary: "#1D4ED8",
    primaryPressed: "#1E40AF",
    success: "#047857",
    successPressed: "#065F46",
    warning: "#C2410C",
    logout: "#B91C1C",
    white: "#FFFFFF",
  },
  /** Altura mínima recomendada para controles (accesibilidad táctil) */
  minTouch: 56,
  radius: {
    card: 16,
    button: 14,
  },
  space: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  font: {
    /** Título principal de pantalla */
    title: 26,
    /** Texto de apoyo bajo el título */
    subtitle: 17,
    /** Matrícula / dato principal en tarjeta */
    hero: 28,
    /** Cuerpo y etiquetas */
    body: 18,
    /** Texto secundario en tarjeta */
    secondary: 16,
    /** Botones de acción principal */
    button: 19,
    /** Estado en tarjeta */
    status: 16,
  },
} as const;
