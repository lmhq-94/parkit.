import { useHeaderEntranceAnimation, useAvatarPulseAnimation } from "@/lib/animations";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { ReactNode } from "react";

interface HeaderAnimatedViewProps {
  children: ReactNode;
  style?: ViewStyle;
  reduceMotion?: boolean;
}

export function HeaderAnimatedView({ children, style, reduceMotion }: HeaderAnimatedViewProps) {
  const animatedStyle = useHeaderEntranceAnimation(reduceMotion);
  return (
    <Animated.View style={[animatedStyle, { width: "100%" }, style]}>
      {children}
    </Animated.View>
  );
}

interface AvatarPulseViewProps {
  children: ReactNode;
  isAvailable: boolean;
  color: string;
  size: number;
  reduceMotion?: boolean;
}

export function AvatarPulseView({ children, isAvailable, color, size, reduceMotion }: AvatarPulseViewProps) {
  const pulseStyle = useAvatarPulseAnimation(isAvailable, reduceMotion);
  return (
    <View style={{ position: "relative" }}>
      {isAvailable && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            pulseStyle,
            {
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}
