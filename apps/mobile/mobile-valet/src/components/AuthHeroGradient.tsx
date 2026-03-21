import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  /** Fondo a pantalla completa (mismo tono que splash y franja del logo). */
  chromeBg: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Contenedor raíz de pantallas auth: cromo claro u oscuro; la franja del logo va aparte (`authHeroStripBg`).
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
