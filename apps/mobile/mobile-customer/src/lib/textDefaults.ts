import { Platform, Text, TextInput } from "react-native";

const FONT_FAMILY = Platform.select({
  ios: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
  android: "Roboto, \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
  default: "system-ui, -apple-system, sans-serif",
});
const ANDROID_WEIGHT = "normal";

const baseStyle =
  Platform.OS === "android"
    ? { fontFamily: FONT_FAMILY, fontWeight: ANDROID_WEIGHT }
    : { fontFamily: FONT_FAMILY };

const T = Text as typeof Text & {
  defaultProps?: { includeFontPadding?: boolean; style?: unknown };
};
T.defaultProps = {
  ...T.defaultProps,
  ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  style: [baseStyle, T.defaultProps?.style],
};

const TI = TextInput as typeof TextInput & {
  defaultProps?: { style?: unknown };
};
TI.defaultProps = {
  ...TI.defaultProps,
  style: [baseStyle, TI.defaultProps?.style],
};
