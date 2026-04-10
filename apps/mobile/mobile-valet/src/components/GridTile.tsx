import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useValetTheme } from "@/theme/valetTheme";
import type { ComponentType } from "react";
import {
  parkitTilePalette,
  tileIconHex,
  TILE_ICON_BG_LIGHT,
  TILE_ICON_BG_DARK,
  TILE_ICON_SIZE,
  type GridVariant,
} from "@/lib/homeUtils";

export type TileLucideIcon = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

type Styles = {
  tile: any;
  tileAccent: any;
  tileWarm: any;
  tileQueue: any;
  tileBooking: any;
  tileProfile: any;
  tileSettings: any;
  tileWorkflow: any;
  tileBadge: any;
  tileBadgeText: any;
  tileIconWrap: any;
  tileTitle: any;
  tileSub: any;
  pressed: any;
};

interface GridTileProps {
  variant: GridVariant;
  /** Ionicon por defecto; omitir si usas `lucideIcon`. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Icono Lucide (p. ej. SquareParking para recibir vehículo). */
  lucideIcon?: TileLucideIcon;
  iconSize?: number;
  title: string;
  sub: string;
  badgeCount?: number;
  onPress: () => void;
  styles: Styles;
  isDark: boolean;
}

export function GridTile(props: GridTileProps) {
  const {
    variant,
    icon,
    lucideIcon: LucideCmp,
    iconSize = TILE_ICON_SIZE,
    title,
    sub,
    badgeCount = 0,
    onPress,
    styles,
    isDark,
  } = props;
  const theme = useValetTheme();
  const Fonts = theme.fontFamily;
  const P = parkitTilePalette(isDark);
  const iconColor = tileIconHex(variant, P);
  const iconBubbleBg = isDark ? TILE_ICON_BG_DARK[variant] : TILE_ICON_BG_LIGHT[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        variant === "accent" && styles.tileAccent,
        variant === "warm" && styles.tileWarm,
        variant === "queue" && styles.tileQueue,
        variant === "booking" && styles.tileBooking,
        variant === "profile" && styles.tileProfile,
        variant === "settings" && styles.tileSettings,
        variant === "workflow" && styles.tileWorkflow,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {badgeCount > 0 ? (
        <View style={styles.tileBadge}>
          <Text style={styles.tileBadgeText}>
            {badgeCount > 99 ? "99+" : String(badgeCount)}
          </Text>
        </View>
      ) : null}
      <View style={[styles.tileIconWrap, { backgroundColor: iconBubbleBg }]}>
        {LucideCmp ? (
          <LucideCmp size={iconSize} color={iconColor} strokeWidth={2.25} />
        ) : (
          <Ionicons name={icon ?? "ellipse-outline"} size={iconSize} color={iconColor} />
        )}
      </View>
      <Text
        style={[
          styles.tileTitle,
          {
            fontFamily: Fonts.primary,
          },
        ]}
        numberOfLines={2}
        maxFontSizeMultiplier={1.75}
      >
        {title}
      </Text>
      <Text style={[styles.tileSub]} numberOfLines={2} maxFontSizeMultiplier={1.65}>
        {sub}
      </Text>
    </Pressable>
  );
}
