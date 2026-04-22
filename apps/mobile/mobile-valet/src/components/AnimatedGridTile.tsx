import { View, Text, Pressable, Platform, StyleSheet, Animated } from "react-native";
import { BlurView } from "expo-blur";
import type { ComponentType } from "react";
import { useEffect, useRef } from "react";
import { useValetTheme } from "@/theme/valetTheme";
import {
  parkitTilePalette,
  tileIconHex,
  TILE_ICON_BG_LIGHT,
  TILE_ICON_BG_DARK,
  TILE_ICON_SIZE,
  type GridVariant,
} from "@/lib/homeUtils";
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
  lucideIcon: TileLucideIcon;
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

  const theme = useValetTheme();
  const Fonts = theme.fontFamily;

  const P = parkitTilePalette(isDark);
  const iconColor = tileIconHex(variant, P);
  const iconBubbleBg = isDark ? TILE_ICON_BG_DARK[variant] : TILE_ICON_BG_LIGHT[variant];
  const glowColor = iconColor;

  // Simple fade-in animation using React Native Animated
  const fadeAnim = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(reduceMotion ? 1 : 0.95)).current;
  
  useEffect(() => {
    if (reduceMotion) return;
    
    const delay = index * 80;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [index, reduceMotion, fadeAnim, scaleAnim]);

  const handlePress = () => {
    void hapticTilePress(variant === "accent" || variant === "warm" ? "primary" : "secondary");
    onPress();
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

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };

  return (
    <Animated.View style={[animatedStyle, { flex: 1, minWidth: 0 }]}>
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
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${sub}`}
      >
        {/* Glow effect overlay */}
        <View style={glowContainerStyle} pointerEvents="none" />

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
            textScale > 1 && { width: 56 + (textScale - 1) * 20, height: 56 + (textScale - 1) * 20, borderRadius: 28 + (textScale - 1) * 10 },
          ]}
        >
          <LucideCmp
            size={iconSize + (textScale - 1) * 15}
            color={iconColor}
            strokeWidth={2.25}
          />
        </View>

        <Text
          style={[
            styles.tileTitle,
            { fontFamily: Fonts.primary },
            textScale > 1 && { fontSize: Math.round(12 * textScale) },
          ]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.5 + (textScale - 1) * 1}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.tileSub,
            { fontFamily: Fonts.primary },
            textScale > 1 && { fontSize: Math.round(12 * textScale), lineHeight: Math.round(15 * textScale) }
          ]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.4 + (textScale - 1) * 0.9}
        >
          {sub}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
