import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useValetTheme } from "@/theme/valetTheme";

type Props = {
  children: ReactNode;
  /** Footer background (e.g. valet theme `card` or auth `bottomSheet`). */
  backgroundColor?: string;
  borderColor?: string;
  /** Horizontal padding; defaults to `theme.space.lg` (profile). */
  paddingHorizontal?: number;
  /** Adds to bottom padding (e.g. iOS + keyboard: separate buttons from keyboard). */
  extraBottomPadding?: number;
  /**
   * Use with `KeyboardStickyView` (receive, return-pickup): listens to keyboard on iOS and Android
   * and sets bottom padding to almost 0 when opening to avoid duplicating space with the sticky.
   */
  keyboardPinned?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Fixed bottom bar for the main form CTA (same pattern as profile).
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
