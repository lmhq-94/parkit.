/**
 * Tema valet: claro solo si el sistema es explícitamente `light`.
 * Si es `dark`, `null` o indeterminado → tema oscuro (fondo #020617, etc.).
 */
import type { ViewStyle } from "react-native";
import { Platform, useColorScheme, useWindowDimensions } from "react-native";
import { useMemo } from "react";
import { useThemeStore } from "@/lib/themeStore";
import { useAccessibilityStore } from '@/lib/store';

/** Mismo azul que welcome.btnPrimary */
export const ACCENT = "#3B82F6";
/** Mismo que welcome.btnSecondary (modo claro) */
export const SIGNUP_BG_LIGHT = "#0F172A";
/** Registro en modo oscuro: contraste sobre hoja inferior oscura */
export const SIGNUP_BG_DARK = "#475569";

export type AuthThemeColors = {
  /** Fondo de toda la pantalla auth/splash (mismo slate oscuro que la web en hero). */
  authScreenChromeBg: string;
  /** Área superior logo + «valet»; mismo color que el resto del fondo. */
  authHeroStripBg: string;
  /** Controles sobre la franja oscura (atrás, etc.). */
  authHeroBackBtnBg: string;
  authHeroBackBtnIcon: string;
  /** Texto «valet» bajo el logo en la franja oscura. */
  authHeroValetLabel: string;
  /** Solo tema claro: borde superior de la hoja de formularios (separación respecto al hero). */
  authFormSheetSeparator: Pick<ViewStyle, "borderTopWidth" | "borderTopColor">;
  bottomSheet: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  inputBorder: string;
  inputBg: string;
  placeholder: string;
  backBtnBg: string;
  backBtnIcon: string;
  btnLoginBg: string;
  btnLoginText: string;
  btnSignupBg: string;
  btnSignupText: string;
  linkAccent: string;
  errorBg: string;
  errorText: string;
  modalSheet: string;
  modalBackdrop: string;
  modalOptionActive: string;
  statusBarStyle: "light-content" | "dark-content";
  statusBarBg: string;
};

export type HomeThemeColors = {
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  primary: string;
  primaryPressed: string;
  success: string;
  successPressed: string;
  warning: string;
  logout: string;
  white: string;
};

function authColors(isDark: boolean): AuthThemeColors {
  return {
    authScreenChromeBg: "#020617",
    authHeroStripBg: "#020617",
    authHeroBackBtnBg: isDark ? "rgba(248, 250, 252, 0.12)" : "rgba(15, 23, 42, 0.12)",
    authHeroBackBtnIcon: isDark ? "#F8FAFC" : "#0F172A",
    authHeroValetLabel: isDark ? "rgba(148, 163, 184, 0.58)" : "rgba(71, 85, 105, 0.9)",
    bottomSheet: isDark ? "#0F172A" : "#FFFFFF",
    text: isDark ? "#F8FAFC" : "#0F172A",
    textSecondary: isDark ? "#94A3B8" : "#475569",
    textMuted: isDark ? "#94A3B8" : "#64748B",
    inputBorder: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#1E293B" : "#FFFFFF",
    placeholder: "#94A3B8",
    backBtnBg: isDark ? "rgba(248, 250, 252, 0.12)" : "rgba(15, 23, 42, 0.08)",
    /** Inputs / UI en la hoja (no en la franja oscura). */
    backBtnIcon: isDark ? "#F8FAFC" : "#0F172A",
    btnLoginBg: ACCENT,
    btnLoginText: "#FFFFFF",
    btnSignupBg: isDark ? SIGNUP_BG_DARK : SIGNUP_BG_LIGHT,
    btnSignupText: "#FFFFFF",
    linkAccent: ACCENT,
    errorBg: isDark ? "rgba(239, 68, 68, 0.18)" : "rgba(239, 68, 68, 0.1)",
    errorText: "#EF4444",
    modalSheet: isDark ? "#1E293B" : "#FFFFFF",
    modalBackdrop: "rgba(15, 23, 42, 0.5)",
    modalOptionActive: isDark ? "rgba(59, 130, 246, 0.22)" : "rgba(59, 130, 246, 0.08)",
    /** Pantallas auth/splash: barra sobre franja oscura. */
    statusBarStyle: "light-content",
    statusBarBg: "#020617",
    authFormSheetSeparator: isDark
      ? { borderTopWidth: 0, borderTopColor: "transparent" }
      : { borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  };
}

function homeColors(isDark: boolean): HomeThemeColors {
  if (isDark) {
    return {
      bg: "#0F172A",
      card: "#1E293B",
      text: "#F8FAFC",
      textMuted: "#94A3B8",
      textSubtle: "#64748B",
      border: "#334155",
      primary: ACCENT,
      primaryPressed: "#2563EB",
      success: "#10B981",
      successPressed: "#059669",
      warning: "#F97316",
      logout: "#F87171",
      white: "#FFFFFF",
    };
  }
  return {
    bg: "#F1F5F9",
    card: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#475569",
    textSubtle: "#64748B",
    border: "#CBD5E1",
    primary: ACCENT,
    primaryPressed: "#2563EB",
    success: "#047857",
    successPressed: "#065F46",
    warning: "#C2410C",
    logout: "#B91C1C",
    white: "#FFFFFF",
  };
}

const ANDROID_FONT_DELTA = Platform.OS === "android" ? -4 : 0;
const fontSize = (value: number) => Math.max(10, value + ANDROID_FONT_DELTA);

/** Aplica el factor de escala de accesibilidad a todos los tamaños de fuente */
function applyTextScale(fonts: typeof valetStaticTokens.font, scale: number) {
  return {
    title: Math.round(fonts.title * scale),
    subtitle: Math.round(fonts.subtitle * scale),
    hero: Math.round(fonts.hero * scale),
    body: Math.round(fonts.body * scale),
    secondary: Math.round(fonts.secondary * scale),
    button: Math.round(fonts.button * scale),
    status: Math.round(fonts.status * scale),
  };
}

export const valetStaticTokens = {
  minTouch: 56,
  radius: { card: 16, button: 14 },
  space: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 },
  font: {
    title: fontSize(26),
    subtitle: fontSize(17),
    hero: fontSize(28),
    body: fontSize(18),
    secondary: fontSize(16),
    button: fontSize(19),
    status: fontSize(16),
  },
} as const;

/**
 * Pantalla de trabajo (tickets): botones y texto más grandes para reducir errores
 * (personas con menos práctica con el móvil o visión reducida).
 */
export const ticketsA11y = {
  minTouch: 60,
  font: {
    title: fontSize(30),
    subtitle: fontSize(20),
    hero: fontSize(34),
    body: fontSize(20),
    secondary: fontSize(18),
    button: fontSize(22),
    status: fontSize(18),
  },
} as const;

export function useValetTheme() {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);
  const { textScale } = useAccessibilityStore();
  const isDark =
    preference === "dark"
      ? true
      : preference === "light"
        ? false
        : systemScheme !== "light";

  return useMemo(
    () => ({
      isDark,
      auth: authColors(isDark),
      colors: homeColors(isDark),
      ...valetStaticTokens,
      font: applyTextScale(valetStaticTokens.font, textScale),
      a11yFont: applyTextScale(ticketsA11y.font, textScale),
    }),
    [isDark, textScale]
  );
}

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 600;
  const isLandscape = width > height;

  return useMemo(
    () => ({
      width,
      height,
      shortestSide,
      isTablet,
      isLandscape,
      contentMaxWidth: width,
      formMaxWidth: width,
      horizontalPadding: isTablet ? 36 : 20,
      sectionPadding: isTablet ? 28 : 20,
    }),
    [height, isLandscape, isTablet, shortestSide, width]
  );
}

/** Píldoras de estado en tickets: variantes por tema */
export function statusVisuals(
  status: "assigned" | "in-transit" | "completed",
  isDark: boolean
) {
  if (isDark) {
    switch (status) {
      case "assigned":
        return { bar: "#FB923C", softBg: "rgba(251, 146, 60, 0.2)", softText: "#FDBA74" };
      case "in-transit":
        return { bar: ACCENT, softBg: "rgba(59, 130, 246, 0.2)", softText: "#93C5FD" };
      case "completed":
        return { bar: "#34D399", softBg: "rgba(52, 211, 153, 0.2)", softText: "#6EE7B7" };
      default:
        return { bar: "#94A3B8", softBg: "rgba(148, 163, 184, 0.15)", softText: "#CBD5E1" };
    }
  }
  switch (status) {
    case "assigned":
      return { bar: "#EA580C", softBg: "#FFEDD5", softText: "#9A3412" };
    case "in-transit":
      return { bar: ACCENT, softBg: "#DBEAFE", softText: "#1E40AF" };
    case "completed":
      return { bar: "#047857", softBg: "#D1FAE5", softText: "#065F46" };
    default:
      return { bar: "#64748B", softBg: "#F1F5F9", softText: "#0F172A" };
  }
}
