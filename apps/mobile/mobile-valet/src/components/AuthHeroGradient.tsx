import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  /** Full-screen background (same tone as splash and logo strip). */
  chromeBg: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Root container for auth screens: light or dark chrome; the logo strip is separate (`authHeroStripBg`).
 */
export function AuthHeroGradient({ chromeBg, style, children }: Props) {
  return (
    <View style={[styles.base, { backgroundColor: chromeBg }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    flex: 1,
  },
});
