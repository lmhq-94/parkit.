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
import Svg, { Defs, RadialGradient, Stop, Ellipse } from "react-native-svg";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

type BlobConfig = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  colors: [string, string];
  opacity: number;
  blur: number;
  duration: number;
  delay: number;
};

const getDarkBlobs = (): BlobConfig[] => [
  { cx: -40, cy: -40, rx: 300, ry: 300, colors: ["#1e3a8a", "#312e81"], opacity: 0.6, blur: 80, duration: 20000, delay: 0 },
  { cx: SCREEN_W - 100, cy: SCREEN_H * 0.2, rx: 250, ry: 250, colors: ["#3730a3", "#4338ca"], opacity: 0.5, blur: 70, duration: 25000, delay: 500 },
  { cx: SCREEN_W * 0.2, cy: SCREEN_H * 0.6, rx: 225, ry: 225, colors: ["#312e81", "#1e1b4b"], opacity: 0.55, blur: 90, duration: 22000, delay: 1000 },
  { cx: SCREEN_W * 0.6, cy: SCREEN_H * 0.4, rx: 200, ry: 200, colors: ["#4338ca", "#3730a3"], opacity: 0.45, blur: 75, duration: 18000, delay: 1500 },
  { cx: 50, cy: SCREEN_H * 0.5, rx: 175, ry: 175, colors: ["#312e81", "#1e3a8a"], opacity: 0.4, blur: 65, duration: 24000, delay: 2000 },
  { cx: SCREEN_W * 0.8, cy: SCREEN_H * 0.15, rx: 150, ry: 150, colors: ["#4c1d95", "#5b21b6"], opacity: 0.35, blur: 60, duration: 28000, delay: 2500 },
  { cx: SCREEN_W * 0.4, cy: SCREEN_H * 0.75, rx: 140, ry: 140, colors: ["#1e3a8a", "#3730a3"], opacity: 0.3, blur: 55, duration: 30000, delay: 3000 },
];

const getLightBlobs = (): BlobConfig[] => [
  { cx: -40, cy: -40, rx: 300, ry: 300, colors: ["#2563eb", "#3b82f6"], opacity: 0.7, blur: 80, duration: 20000, delay: 0 },
  { cx: SCREEN_W - 100, cy: SCREEN_H * 0.2, rx: 250, ry: 250, colors: ["#4f46e5", "#6366f1"], opacity: 0.65, blur: 70, duration: 25000, delay: 500 },
  { cx: SCREEN_W * 0.2, cy: SCREEN_H * 0.6, rx: 225, ry: 225, colors: ["#8b5cf6", "#7c3aed"], opacity: 0.75, blur: 90, duration: 22000, delay: 1000 },
  { cx: SCREEN_W * 0.6, cy: SCREEN_H * 0.4, rx: 200, ry: 200, colors: ["#6366f1", "#4338ca"], opacity: 0.6, blur: 75, duration: 18000, delay: 1500 },
  { cx: 50, cy: SCREEN_H * 0.5, rx: 175, ry: 175, colors: ["#60a5fa", "#3b82f6"], opacity: 0.6, blur: 65, duration: 24000, delay: 2000 },
  { cx: SCREEN_W * 0.8, cy: SCREEN_H * 0.15, rx: 150, ry: 150, colors: ["#a78bfa", "#8b5cf6"], opacity: 0.65, blur: 60, duration: 28000, delay: 2500 },
  { cx: SCREEN_W * 0.4, cy: SCREEN_H * 0.75, rx: 140, ry: 140, colors: ["#3b82f6", "#60a5fa"], opacity: 0.55, blur: 55, duration: 30000, delay: 3000 },
];

type Props = {
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

const LavaBlob = ({ config, index }: { config: BlobConfig; index: number }) => {
  const animatedValue = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(animatedValue, { toValue: 1, duration: config.duration, useNativeDriver: true })
    );
    const t = setTimeout(() => anim.start(), config.delay);
    return () => { clearTimeout(t); anim.stop(); };
  }, [animatedValue, config.duration, config.delay]);

  const tx = animatedValue.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 50, -30, 25, 0] });
  const ty = animatedValue.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -40, 35, -20, 0] });
  const scale = animatedValue.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: config.cx - config.rx,
        top: config.cy - config.ry,
        width: config.rx * 2,
        height: config.ry * 2,
        opacity: config.opacity,
        transform: [{ translateX: tx }, { translateY: ty }, { scale }],
      }}
    >
      <Svg width={config.rx * 2} height={config.ry * 2} viewBox={`0 0 ${config.rx * 2} ${config.ry * 2}`}>
        <Defs>
          {/* Main soft radial gradient with many stops for cloud effect */}
          <RadialGradient id={`grad-${index}`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={config.colors[0]} stopOpacity={1} />
            <Stop offset="20%" stopColor={config.colors[0]} stopOpacity={0.9} />
            <Stop offset="40%" stopColor={config.colors[1]} stopOpacity={0.6} />
            <Stop offset="60%" stopColor={config.colors[1]} stopOpacity={0.3} />
            <Stop offset="80%" stopColor={config.colors[1]} stopOpacity={0.1} />
            <Stop offset="100%" stopColor={config.colors[1]} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {/* Main soft ellipse */}
        <Ellipse cx={config.rx} cy={config.ry} rx={config.rx} ry={config.ry} fill={`url(#grad-${index})`} />
      </Svg>
    </Animated.View>
  );
};

export function AnimatedAuthBackground({ isDark, style, children }: Props) {
  const blobs = useMemo(() => (isDark ? getDarkBlobs() : getLightBlobs()), [isDark]);
  const baseColors = useMemo(() => (isDark ? ["#0a0a1a", "#1a1a2e", "#16213e", "#1a1a2e", "#0a0a1a"] : ["#f0f9ff", "#e0f2fe", "#dbeafe", "#e0f2fe", "#f0f9ff"]), [isDark]) as [string, string, ...string[]];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient colors={baseColors} locations={[0, 0.25, 0.5, 0.75, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {blobs.map((b, i) => <LavaBlob key={i} config={b} index={i} />)}
      </View>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "rgba(10, 10, 26, 0.4)" : "rgba(255, 255, 255, 0.3)" }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, width: "100%", height: "100%", overflow: "hidden" } });
export default AnimatedAuthBackground;
