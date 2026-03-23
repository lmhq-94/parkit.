import { Text, View, StyleSheet, useColorScheme } from "react-native";

import {
  LOGO_FONT_FAMILY_MOBILE,
  LOGO_FONT_WEIGHT_MOBILE,
  logoLetterSpacingPx,
} from "../logoTokens";

/** Colors aligned with `apps/web/src/components/Logo.tsx`; typography with `logoTokens`. */
export type LogoVariant = "default" | "onDark" | "onLight" | "mark" | "markOnDark";

export function Logo({
  size = 42,
  style,
  darkBackground,
  variant,
}: {
  size?: number;
  style?: object;
  /**
   * @deprecated Use `variant="onDark"`. If passed, it forces a dark logo background.
   */
  darkBackground?: boolean;
  /** If omitted, it is inferred from `darkBackground` or the current theme. */
  variant?: LogoVariant;
}) {
  const colorScheme = useColorScheme();
  /** Same rule as mobile-valet: dark by default unless system is `light`. */
  const systemDark = colorScheme !== "light";

  const resolvedVariant: LogoVariant =
    variant ?? (darkBackground ? "onDark" : "default");

  const isOnDark = resolvedVariant === "onDark" || resolvedVariant === "markOnDark";
  const isOnLight = resolvedVariant === "onLight";
  const isMark = resolvedVariant === "mark" || resolvedVariant === "markOnDark";

  // Tailwind-equivalent colors from the web app (Logo.tsx)
  let parkColor: string;
  let itColor: string;
  if (isOnDark) {
    parkColor = "#FFFFFF";
    itColor = "#7DD3FC"; // sky-300 (variant onDark / markOnDark)
  } else if (isOnLight) {
    /** Explicit light background (e.g. app header in light theme): always legible, independent of system. */
    parkColor = "#0F172A";
    itColor = "#2563EB";
  } else if (isMark) {
    parkColor = "#0F172A"; // slate-900
    itColor = "#2563EB"; // blue-600 - the dot uses the same blue as "it."
  } else {
    // default: slate-900 + blue-600 en claro; white + blue-500 en oscuro
    parkColor = systemDark ? "#FFFFFF" : "#0F172A";
    itColor = systemDark ? "#3B82F6" : "#2563EB";
  }

  const firstWord = isMark ? "p" : "park";
  const secondWord = isMark ? "." : "it.";

  /** Approximates web `drop-shadow` values for `Logo` onDark variant. */
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
