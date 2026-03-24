import { Platform, Text } from "react-native";

/**
 * Reduce el padding extra vertical que Android añade al texto (hinting de fuentes),
 * acercando la caja del glyph a iOS. Sin esto, mismos `fontSize`/`lineHeight` se ven más altos en Android.
 */
if (Platform.OS === "android") {
  const T = Text as typeof Text & {
    defaultProps?: { includeFontPadding?: boolean };
  };
  T.defaultProps = {
    ...T.defaultProps,
    includeFontPadding: false,
  };
}
