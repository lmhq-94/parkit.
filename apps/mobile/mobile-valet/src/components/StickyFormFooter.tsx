import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useValetTheme } from "@/theme/valetTheme";

type Props = {
  children: ReactNode;
  /** Fondo del pie (p. ej. tema valet `card` o auth `bottomSheet`). */
  backgroundColor?: string;
  borderColor?: string;
  /** Padding horizontal; por defecto `theme.space.lg` (perfil). */
  paddingHorizontal?: number;
  /** Suma al padding inferior (p. ej. iOS + teclado: separar botones del teclado). */
  extraBottomPadding?: number;
  /**
   * Usar con `KeyboardStickyView` (receive, return-pickup): escucha teclado en iOS y Android
   * y deja padding inferior casi a 0 al abrir para no duplicar aire con el sticky.
   */
  keyboardPinned?: boolean;
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
  extraBottomPadding = 0,
  keyboardPinned = false,
  style,
}: Props) {
  const theme = useValetTheme();
  const C = theme.colors;
  const S = theme.space;
  const bg = backgroundColor ?? C.card;
  const bc = borderColor ?? C.border;
  const padH = ph ?? S.lg;
  const footerVerticalPadding = keyboardPinned ? S.md : S.md;
  const footerBottomPadding = footerVerticalPadding + extraBottomPadding;

  return (
    <View
      style={[
        {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: bc,
          backgroundColor: bg,
          paddingHorizontal: padH,
          paddingTop: footerVerticalPadding,
          paddingBottom: footerBottomPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
