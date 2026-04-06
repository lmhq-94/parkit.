import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

// Blob configuration with position, size, colors and animation params
const createBlobConfig = (index: number, isDark: boolean) => {
  const positions = [
    { x: -120, y: -120, size: 500 }, // Top left
    { x: SCREEN_WIDTH - 350, y: SCREEN_HEIGHT * 0.2, size: 420 }, // Right
    { x: SCREEN_WIDTH * 0.15, y: SCREEN_HEIGHT * 0.55, size: 380 }, // Bottom left
    { x: SCREEN_WIDTH * 0.45, y: SCREEN_HEIGHT * 0.35, size: 340 }, // Center right
    { x: -50, y: SCREEN_HEIGHT * 0.4, size: 300 }, // Left middle
    { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.1, size: 260 }, // Top right
    { x: SCREEN_WIDTH * 0.25, y: SCREEN_HEIGHT * 0.65, size: 240 }, // Bottom
  ];

  const darkColors = [
    ["#1e3a8a", "#312e81", "#1e1b4b"],
    ["#3730a3", "#4338ca", "#1e3a5f"],
    ["#1e1b4b", "#312e81", "#1e3a8a"],
    ["#4338ca", "#3730a3", "#312e81"],
    ["#312e81", "#1e1b4b"],
    ["#4c1d95", "#5b21b6", "#312e81"],
    ["#1e3a8a", "#3730a3"],
  ];

  const lightColors = [
    ["#2563eb", "#3b82f6", "#60a5fa"],
    ["#4f46e5", "#6366f1", "#818cf8"],
    ["#7c3aed", "#8b5cf6", "#a78bfa"],
    ["#4338ca", "#4f46e5", "#6366f1"],
    ["#3b82f6", "#60a5fa"],
    ["#6d28d9", "#7c3aed", "#8b5cf6"],
    ["#2563eb", "#3b82f6"],
  ];

  const pos = positions[index % positions.length];
  const colors = isDark ? darkColors[index % darkColors.length] : lightColors[index % lightColors.length];
  const opacity = isDark ? 0.5 - index * 0.06 : 0.65 - index * 0.05;

  return {
    ...pos,
    size: pos.size,
    colors,
    opacity: Math.max(opacity, 0.25),
    duration: 15000 + index * 3000,
    delay: index * 500,
  };
};

// Animated blob component
const AnimatedBlob = ({
  config,
}: {
  config: ReturnType<typeof createBlobConfig>;
}) => {
  const animatedValue = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: config.duration,
        useNativeDriver: true,
      })
    );

    // Add delay before starting
    const timeout = setTimeout(() => {
      animation.start();
    }, config.delay);

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [animatedValue, config.duration, config.delay]);

  // Interpolate animations for morphing effect
  const translateX = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 60, -40, 30, 0],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -50, 40, -30, 0],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 1.3, 0.8, 1.15, 1],
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "180deg", "360deg"],
  });

  // Border radius animation for organic shape morphing
  const borderRadiusAnim = animatedValue.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: ["50%", "45%", "55%", "40%", "60%", "50%"],
  });

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          left: config.x,
          top: config.y,
          width: config.size,
          height: config.size,
          opacity: config.opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate },
          ],
          borderRadius: borderRadiusAnim,
        },
      ]}
    >
      <LinearGradient
        colors={config.colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

/**
 * Animated background with lava-morphing blobs for auth screens.
 * Replicates the web's animated gradient background effect.
 */
export function AnimatedAuthBackground({ isDark, style, children }: Props) {
  const blobConfigs = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => createBlobConfig(i, isDark));
  }, [isDark]);

  // Base gradient colors
  const baseGradientColors = useMemo(() => {
    return isDark
      ? ["#0a0a1a", "#1a1a2e", "#16213e", "#1a1a2e", "#0a0a1a"]
      : ["#f0f9ff", "#e0f2fe", "#dbeafe", "#e0f2fe", "#f0f9ff"];
  }, [isDark]);

  return (
    <View style={[styles.container, style]}>
      {/* Base gradient background */}
      <LinearGradient
        colors={baseGradientColors as [string, string, ...string[]]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated blob layer */}
      <View style={styles.blobContainer}>
        {blobConfigs.map((config, index) => (
          <AnimatedBlob key={index} config={config} />
        ))}
      </View>

      {/* Blur overlay using semi-transparent view */}
      <View style={StyleSheet.absoluteFill}>
        {blobConfigs.map((config, index) => (
          <View
            key={`blur-${index}`}
            style={[
              styles.blurBlob,
              {
                left: config.x,
                top: config.y,
                width: config.size,
                height: config.size,
                opacity: config.opacity * 0.8,
              },
            ]}
          >
            <LinearGradient
              colors={config.colors as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ))}
      </View>

      {/* Radial overlay for depth */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark
              ? "rgba(10, 10, 26, 0.3)"
              : "rgba(255, 255, 255, 0.2)",
          },
        ]}
      />

      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  blobContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    overflow: "hidden",
  },
  blurBlob: {
    position: "absolute",
    borderRadius: 1000,
    transform: [{ scale: 1.2 }],
    opacity: 0.6,
  },
});

export default AnimatedAuthBackground;
