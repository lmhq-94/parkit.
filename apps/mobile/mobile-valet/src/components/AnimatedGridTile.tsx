import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import type { ComponentType } from "react";
import Animated from "react-native-reanimated";
import {
  parkitTilePalette,
  tileIconHex,
  TILE_ICON_BG_LIGHT,
  TILE_ICON_BG_DARK,
  TILE_ICON_SIZE,
  type GridVariant,
} from "@/lib/homeUtils";
import { useTileEntranceAnimation, useTilePressAnimation } from "@/lib/animations";
import { hapticTilePress } from "@/lib/haptics";

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

interface AnimatedGridTileProps {
  variant: GridVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  lucideIcon?: TileLucideIcon;
  iconSize?: number;
  title: string;
  sub: string;
  badgeCount?: number;
  onPress: () => void;
  styles: Styles;
  isDark: boolean;
  index: number;
  /** Escala de texto para accesibilidad (1.0 = normal, 1.4 = máximo) */
  textScale?: number;
  /** Reducir animaciones para accesibilidad */
  reduceMotion?: boolean;
}

export function AnimatedGridTile(props: AnimatedGridTileProps) {
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
    index,
    textScale = 1,
    reduceMotion = false,
  } = props;

  const P = parkitTilePalette(isDark);
  const iconColor = tileIconHex(variant, P);
  const iconBubbleBg = isDark ? TILE_ICON_BG_DARK[variant] : TILE_ICON_BG_LIGHT[variant];
  const glowColor = iconColor;

  // Animaciones
  const entranceStyle = useTileEntranceAnimation(index, true, reduceMotion);
  const { glowStyle, animatePressIn, animatePressOut } = useTilePressAnimation(reduceMotion);

  const handlePress = () => {
    void hapticTilePress(variant === "accent" || variant === "warm" ? "primary" : "secondary");
    onPress();
  };

  const handlePressIn = () => {
    animatePressIn();
  };

  const handlePressOut = () => {
    animatePressOut();
  };

  // Estilos para glow effect
  const glowContainerStyle = [
    StyleSheet.absoluteFill,
    {
      borderRadius: 18,
      borderWidth: 2,
      borderColor: glowColor,
      opacity: 0,
    },
  ];

  return (
    <Animated.View style={[entranceStyle, { flex: 1, minWidth: 0 }]}>
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
          textScale > 1 && { paddingVertical: 20 + (textScale - 1) * 10 },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${sub}`}
      >
        {/* Glow effect overlay */}
        <Animated.View style={[glowContainerStyle, glowStyle]} pointerEvents="none" />

        {/* Glassmorphism background */}
        {(isDark || Platform.OS === "ios") && (
          <BlurView
            intensity={isDark ? 15 : 8}
            tint={isDark ? "dark" : "light"}
            style={[StyleSheet.absoluteFill, { borderRadius: 18, overflow: "hidden" }]}
            pointerEvents="none"
          />
        )}

        {badgeCount > 0 ? (
          <View style={[styles.tileBadge, textScale > 1 && { minWidth: 28 + (textScale - 1) * 10, height: 28 + (textScale - 1) * 10, borderRadius: 14 + (textScale - 1) * 5 }]}>
            <Text style={[styles.tileBadgeText, textScale > 1 && { fontSize: 11 + (textScale - 1) * 6 }]}>
              {badgeCount > 99 ? "99+" : String(badgeCount)}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.tileIconWrap,
            { backgroundColor: iconBubbleBg },
            textScale > 1 && { width: 52 + (textScale - 1) * 20, height: 52 + (textScale - 1) * 20, borderRadius: 16 + (textScale - 1) * 6 },
          ]}
        >
          {LucideCmp ? (
            <LucideCmp
              size={iconSize + (textScale - 1) * 15}
              color={iconColor}
              strokeWidth={2.25}
            />
          ) : (
            <Ionicons
              name={icon ?? "ellipse-outline"}
              size={iconSize + (textScale - 1) * 15}
              color={iconColor}
            />
          )}
        </View>

        <Text
          style={[
            styles.tileTitle,
            { fontFamily: "CalSans" },
            textScale > 1 && { fontSize: 16 + (textScale - 1) * 8 },
          ]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.5 + (textScale - 1) * 1}
        >
          {title}
        </Text>
        <Text
          style={[styles.tileSub, textScale > 1 && { fontSize: 13 + (textScale - 1) * 5, lineHeight: 18 + (textScale - 1) * 6 }]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.4 + (textScale - 1) * 0.9}
        >
          {sub}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
