import { Pressable, StyleSheet, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useValetTheme } from "@/theme/valetTheme";

/**
 * - `auth`: mismo estilo que login (franja oscura).
 * - `surface` (por defecto): contraste sobre cabeceras claras/oscuras (`C.card`, etc.).
 */
export function ValetBackButton({
  onPress,
  accessibilityLabel,
  appearance = "surface",
}: {
  onPress: () => void;
  accessibilityLabel: string;
  /** `auth` solo sobre fondo oscuro tipo login/welcome */
  appearance?: "auth" | "surface";
}) {
  const theme = useValetTheme();
  const a = theme.auth;
  const C = theme.colors;

  const isAuth = appearance === "auth";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        isAuth
          ? { backgroundColor: a.authHeroBackBtnBg }
          : {
              backgroundColor: theme.isDark ? "rgba(248, 250, 252, 0.12)" : "rgba(15, 23, 42, 0.07)",
              borderWidth: 2,
              borderColor: C.border,
            },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <View style={styles.iconCenter}>
        <Ionicons
          name="chevron-back"
          size={26}
          color={isAuth ? a.authHeroBackBtnIcon : C.text}
          style={styles.chevronOptical}
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
  /** El glifo «chevron-back» suele ir visualmente desplazado; lo centramos en el círculo. */
  iconCenter: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronOptical: {
    marginLeft: Platform.OS === "ios" ? -3 : -2,
  },
});
