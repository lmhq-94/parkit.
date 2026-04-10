import type { ValetOperationalStatus } from "@parkit/shared";
import type { useValetTheme } from "@/theme/valetTheme";

type Theme = ReturnType<typeof useValetTheme>;

/** Anillo de presencia en el avatar (estilo apps modernas): verde disponible, rojo ocupado, etc. */
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

/** Tonos por tile: modo claro (más profundos) vs oscuro (más vivos sobre fondo oscuro). */
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

/** Tamaño del avatar en header (círculo perfecto: radio = mitad) */
export const HEADER_AVATAR_SIZE = 48;

/** Grosor del anillo de estado alrededor del avatar (borde de color) */
export const AVATAR_PRESENCE_RING = 3;
