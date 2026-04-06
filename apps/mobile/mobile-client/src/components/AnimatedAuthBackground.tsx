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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

interface Position {
  x: number;
  y: number;
  size: number;
}

interface BlobConfig {
  x: number;
  y: number;
  size: number;
  colors: string[];
  opacity: number;
  duration: number;
  delay: number;
}

// Blob configuration with position, size, colors and animation params
const createBlobConfig = (index: number, isDark: boolean): BlobConfig => {
  const positions: Position[] = [
    { x: -120, y: -120, size: 500 }, // Top left
    { x: SCREEN_WIDTH - 350, y: SCREEN_HEIGHT * 0.2, size: 420 }, // Right
    { x: SCREEN_WIDTH * 0.15, y: SCREEN_HEIGHT * 0.55, size: 380 }, // Bottom left
    { x: SCREEN_WIDTH * 0.45, y: SCREEN_HEIGHT * 0.35, size: 340 }, // Center right
    { x: -50, y: SCREEN_HEIGHT * 0.4, size: 300 }, // Left middle
    { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.1, size: 260 }, // Top right
    { x: SCREEN_WIDTH * 0.25, y: SCREEN_HEIGHT * 0.65, size: 240 }, // Bottom
  ];

  const darkColors: string[][] = [
    ["#1e3a8a", "#312e81", "#1e1b4b"],
    ["#3730a3", "#4338ca", "#1e3a5f"],
    ["#1e1b4b", "#312e81", "#1e3a8a"],
    ["#4338ca", "#3730a3", "#312e81"],
    ["#312e81", "#1e1b4b"],
    ["#4c1d95", "#5b21b6", "#312e81"],
    ["#1e3a8a", "#3730a3"],
  ];

  const lightColors: string[][] = [
    ["#2563eb", "#3b82f6", "#60a5fa"],
    ["#4f46e5", "#6366f1", "#818cf8"],
    ["#7c3aed", "#8b5cf6", "#a78bfa"],
    ["#4338ca", "#4f46e5", "#6366f1"],
    ["#3b82f6", "#60a5fa"],
    ["#6d28d9", "#7c3aed", "#8b5cf6"],
    ["#2563eb", "#3b82f6"],
  ];

  const posIndex = index % positions.length;
  const pos = positions[posIndex]!;
  const colorIndex = index % (isDark ? darkColors.length : lightColors.length);
  const colors = isDark ? darkColors[colorIndex]! : lightColors[colorIndex]!;
  const opacity = isDark ? 0.5 - index * 0.06 : 0.65 - index * 0.05;

  return {
    x: pos.x,
    y: pos.y,
    size: pos.size,
    colors,
    opacity: Math.max(opacity, 0.25),
    duration: 15000 + index * 3000,
    delay: index * 500,
  };
};


// Animated blob component using solid colors
const AnimatedBlob = ({
  config,
}: {
  config: BlobConfig;
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

    const timeout = setTimeout(() => {
      animation.start();
    }, config.delay);

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [animatedValue, config.duration, config.delay]);

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

  // Use first color as background for simplicity
  const backgroundColor = config.colors[0] || "#3b82f6";

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
          backgroundColor,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate },
          ],
          borderRadius: config.size / 2,
        },
      ]}
    />
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

  // Base background color (simulating gradient with solid color)
  const baseBgColor = useMemo(() => {
    return isDark ? "#0a0a1a" : "#f0f9ff";
  }, [isDark]);

  return (
    <View style={[styles.container, { backgroundColor: baseBgColor }, style]}>
      {/* Animated blob layer */}
      <View style={styles.blobContainer}>
        {blobConfigs.map((config, index) => (
          <AnimatedBlob key={index} config={config} />
        ))}
      </View>

      {/* Blur overlay - secondary blobs with different colors */}
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
                opacity: config.opacity * 0.6,
                backgroundColor: config.colors[1] || config.colors[0] || "#3b82f6",
                borderRadius: config.size / 2,
              },
            ]}
          />
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
    transform: [{ scale: 1.2 }],
    opacity: 0.4,
  },
});

export default AnimatedAuthBackground;
