import type { ValetOperationalStatus } from "@parkit/shared";
import type { useValetTheme } from "@/theme/valetTheme";

type Theme = ReturnType<typeof useValetTheme>;

/** Presence ring on avatar (modern app style): green available, red busy, etc. */
export function avatarPresenceRingColor(
  theme: Theme,
  status: ValetOperationalStatus | null | undefined
): string {
  if (status === "AVAILABLE") {
    return "#34D399"; // verde claro brillante (emerald-400)
  }
  if (status === "BUSY") {
    return "#EF4444"; // rojo (red-500)
  }
  if (status === "AWAY") {
    return theme.isDark ? "#94A3B8" : "#64748B";
  }
  return "#60A5FA"; // sincronizando / desconocido — azul (sky-400)
}

/** Tones per tile: light mode (deeper) vs dark mode (more vibrant on dark background). */
export function parkitTilePalette(isDark: boolean) {
  if (isDark) {
    return {
      receive: "#2563EB",
      return: "#F97316",
      reservation: "#2DD4BF",
      queue: "#818CF8",
      profile: "#C084FC",
      settings: "#64748B",
      workflow: "#06B6D4",
    };
  }
  return {
    receive: "#1D4ED8",
    return: "#C2410C",
    reservation: "#0D9488",
    queue: "#4338CA",
    profile: "#7C3AED",
    settings: "#334155",
    workflow: "#0E7490",
  };
}

export type GridVariant = "accent" | "warm" | "queue" | "booking" | "profile" | "settings" | "workflow";

export function tileIconHex(variant: GridVariant, P: ReturnType<typeof parkitTilePalette>): string {
  switch (variant) {
    case "accent":
      return P.receive;
    case "warm":
      return P.return;
    case "queue":
      return P.queue;
    case "booking":
      return P.reservation;
    case "profile":
      return P.profile;
    case "settings":
      return P.settings;
    case "workflow":
      return P.workflow;
  }
}

/** Fondo suave del círculo de icono (modo claro; hex de `parkitTilePalette(false)`). */
export const TILE_ICON_BG_LIGHT: Record<GridVariant, string> = {
  accent: "rgba(29, 78, 216, 0.12)",
  warm: "rgba(194, 65, 12, 0.12)",
  queue: "rgba(67, 56, 202, 0.12)",
  booking: "rgba(13, 148, 136, 0.12)",
  profile: "rgba(124, 58, 237, 0.12)",
  settings: "rgba(51, 65, 85, 0.12)",
  workflow: "rgba(14, 116, 144, 0.12)",
};

/** Fondo suave del círculo de icono en modo oscuro (hex de `parkitTilePalette(true)` sobre `C.card`). */
export const TILE_ICON_BG_DARK: Record<GridVariant, string> = {
  accent: "rgba(37, 99, 235, 0.22)",
  warm: "rgba(249, 115, 22, 0.2)",
  queue: "rgba(129, 140, 248, 0.22)",
  booking: "rgba(45, 212, 191, 0.18)",
  profile: "rgba(192, 132, 252, 0.22)",
  settings: "rgba(148, 163, 184, 0.18)",
  workflow: "rgba(6, 182, 212, 0.2)",
};

export const TILE_ICON_SIZE = 30;

export const HEADER_RADIUS_BOTTOM = 22;

/** Avatar size in header (perfect circle: radius = half) */
export const HEADER_AVATAR_SIZE = 40;

/** Thickness of the status ring around the avatar (colored border) */
export const AVATAR_PRESENCE_RING = 3;

/**
 * Calculates proportional sizes for header elements based on logo size
 * and accessibility text scale
 */
export function getHeaderSizes(logoSize: number, textScale: number) {
  // Logo scales with textScale but with a more moderate factor
  const scaledLogoSize = Math.round(logoSize * (0.9 + (textScale - 1) * 0.3));
  
  // Avatar proportional to logo (1.4x logo size)
  const avatarSize = Math.round(scaledLogoSize * 1.4);
  
  // Text sizes based on logo and accessibility scale
  const displayNameSize = Math.round(scaledLogoSize * 0.65);
  const roleSize = Math.round(scaledLogoSize * 0.45);
  
  // Status dot proportional to avatar
  const statusDotSize = Math.max(10, Math.round(avatarSize * 0.35));
  const statusDotBorderWidth = Math.max(1, Math.round(avatarSize * 0.075));
  
  // Badge for notifications
  const badgeSize = Math.max(14, Math.round(avatarSize * 0.45));
  const badgeFontSize = Math.max(10, Math.round(avatarSize * 0.3 * textScale));
  
  // Proportional spacing
  const gap = Math.round(scaledLogoSize * 0.3);
  const avatarPadding = Math.round(avatarSize * 0.1);
  
  return {
    logoSize: scaledLogoSize,
    avatarSize,
    displayNameSize,
    roleSize,
    statusDotSize,
    statusDotBorderWidth,
    badgeSize,
    badgeFontSize,
    gap,
    avatarPadding,
  };
}

/**
 * Tamaño base del logo para el header (se usa como referencia para todos los demás elementos)
 */
export const HEADER_LOGO_BASE_SIZE = 32;
