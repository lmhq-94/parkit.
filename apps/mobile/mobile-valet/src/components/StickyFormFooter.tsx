import type { ReactNode } from "react";
import {
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useValetTheme } from "@/theme/valetTheme";

type Props = {
  children: ReactNode;
  /** Fondo del pie (p. ej. tema valet `card` o auth `bottomSheet`). */
  backgroundColor?: string;
  borderColor?: string;
  /** Padding horizontal; por defecto `theme.space.lg` (perfil). */
  paddingHorizontal?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Barra inferior fija para el CTA principal de formularios (mismo patrón que perfil).
 */
export function StickyFormFooter({
  children,
  backgroundColor,
  borderColor,
  paddingHorizontal: ph,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const theme = useValetTheme();
  const C = theme.colors;
  const S = theme.space;
  const bg = backgroundColor ?? C.card;
  const bc = borderColor ?? C.border;
  const padH = ph ?? S.lg;
  const footerBottomPadding = Math.max(insets.bottom, S.md);

  return (
    <View
      style={[
        {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: bc,
          backgroundColor: bg,
          paddingHorizontal: padH,
          paddingTop: S.md,
          paddingBottom: footerBottomPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
