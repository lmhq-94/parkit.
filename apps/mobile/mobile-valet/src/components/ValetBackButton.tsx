import { Pressable, StyleSheet, View } from "react-native";
import { useValetTheme } from "@/theme/valetTheme";
import { IconCircleArrowLeft } from "@/components/TablerIcons";

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
        <IconCircleArrowLeft
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
  /** El glifo «chevron-back» suele ir visualmente desplazado; lo centramos en el círculo. */
  iconCenter: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
