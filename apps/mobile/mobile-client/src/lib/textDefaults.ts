import { Platform, Text, TextInput } from "react-native";

const FONT_FAMILY = "CalSans";
const ANDROID_WEIGHT = "normal";

const baseStyle =
  Platform.OS === "android"
    ? { fontFamily: FONT_FAMILY, fontWeight: ANDROID_WEIGHT }
    : { fontFamily: FONT_FAMILY };

const T = Text as typeof Text & {
  defaultProps?: { includeFontPadding?: boolean };
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
