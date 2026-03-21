import { Text, View, StyleSheet, useColorScheme } from "react-native";

import {
  LOGO_FONT_FAMILY_MOBILE,
  LOGO_FONT_WEIGHT_MOBILE,
  logoLetterSpacingPx,
} from "../logoTokens";

/** Colores alineados con `apps/web/src/components/Logo.tsx`; tipografía con `logoTokens`. */
export type LogoVariant = "default" | "onDark" | "mark" | "markOnDark";

export function Logo({
  size = 42,
  style,
  darkBackground,
  variant,
}: {
  size?: number;
  style?: object;
  /**
   * @deprecated Usa `variant="onDark"`. Si se pasa, equivale a forzar fondo oscuro en el logo.
   */
  darkBackground?: boolean;
  /** Si no se indica, se infiere de `darkBackground` o del tema. */
  variant?: LogoVariant;
}) {
  const colorScheme = useColorScheme();
  /** Misma regla que mobile-valet: oscuro por defecto si el sistema no es `light`. */
  const systemDark = colorScheme !== "light";

  const resolvedVariant: LogoVariant =
    variant ?? (darkBackground ? "onDark" : "default");

  const isOnDark = resolvedVariant === "onDark" || resolvedVariant === "markOnDark";
  const isMark = resolvedVariant === "mark" || resolvedVariant === "markOnDark";

  // Colores equivalentes a Tailwind en la web (Logo.tsx)
  let parkColor: string;
  let itColor: string;
  if (isOnDark) {
    parkColor = "#FFFFFF";
    itColor = "#7DD3FC"; // sky-300 (variant onDark / markOnDark)
  } else if (isMark) {
    parkColor = "#0F172A"; // slate-900
    itColor = "#2563EB"; // blue-600 — el punto sigue el mismo azul que "it."
  } else {
    // default: slate-900 + blue-600 en claro; white + blue-500 en oscuro
    parkColor = systemDark ? "#FFFFFF" : "#0F172A";
    itColor = systemDark ? "#3B82F6" : "#2563EB";
  }

  const firstWord = isMark ? "p" : "park";
  const secondWord = isMark ? "." : "it.";

  /** Aproxima los `drop-shadow` de la web en `Logo` variant onDark. */
  const parkShadow = isOnDark
    ? {
        textShadowColor: "rgba(255, 255, 255, 0.12)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: Math.round(size * 0.28),
      }
    : {};
  const itShadow = isOnDark
    ? {
        textShadowColor: "rgba(56, 189, 248, 0.25)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: Math.round(size * 0.22),
      }
    : {};

  const letterSpacing = logoLetterSpacingPx(size);

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.text,
          {
            fontSize: size,
            fontWeight: LOGO_FONT_WEIGHT_MOBILE,
            letterSpacing,
            color: parkColor,
          },
          parkShadow,
        ]}
      >
        {firstWord}
      </Text>
      <Text
        style={[
          styles.text,
          {
            fontSize: size,
            fontWeight: LOGO_FONT_WEIGHT_MOBILE,
            letterSpacing,
            color: itColor,
          },
          itShadow,
        ]}
      >
        {secondWord}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontFamily: LOGO_FONT_FAMILY_MOBILE,
  },
});
