import { Pressable, StyleSheet, View } from "react-native";
import { useValetTheme } from "@/theme/valetTheme";
import { IconSquareRoundedArrowLeft } from "@/components/Icons";

/**
 * - `auth`: same style as login (dark strip).
 * - `surface` (default): contrast over light/dark headers (`C.card`, etc.).
 */
export function ValetBackButton({
  onPress,
  accessibilityLabel,
  appearance = "surface",
}: {
  onPress: () => void;
  accessibilityLabel: string;
  /** `auth` only on dark background like login/welcome */
  appearance?: "auth" | "surface";
}) {
  const theme = useValetTheme();
  const a = theme.auth;

  const isAuth = appearance === "auth";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: "transparent",
          borderWidth: 0,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <View style={styles.iconCenter}>
        <IconSquareRoundedArrowLeft
          size={26}
          color={isAuth ? a.authHeroBackBtnIcon : (theme.isDark ? "#F8FAFC" : "#0F172A")}
          style={{ marginLeft: 2, marginTop: 1 }}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  /** The «chevron-back» glyph is usually visually offset; we center it in the circle. */
  iconCenter: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
