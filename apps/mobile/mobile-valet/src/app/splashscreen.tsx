import { View, StyleSheet, StatusBar, Dimensions, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import { Animated } from "react-native";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { useValetTheme } from "@/theme/valetTheme";

const LOGO_SIZE = 72;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const theme = useValetTheme();
  const { auth: a } = theme;
  const F = theme.font;

  const logoPosition = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start with logo centered and slightly transparent
    opacity.setValue(0);
    scale.setValue(0.5);
    labelOpacity.setValue(0);
    logoPosition.setValue(0);

    // Calculate distance from center to 140px position
    const centerY = SCREEN_HEIGHT / 2;
    const targetY = 140;
    const distance = targetY - centerY;

    // First animation: dramatic scale up with bounce
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Show valet label with fade
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Dramatic transition: move logo up with easing
        Animated.parallel([
          Animated.timing(logoPosition, {
            toValue: distance,
            duration: 1200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.85,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Final scale bounce to position
          Animated.spring(scale, {
            toValue: 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          }).start(() => {
            // Navigate to welcome screen after delay to show final position
            setTimeout(() => {
              router.replace("/welcome");
            }, 800);
          });
        });
      });
    });
  }, [logoPosition, opacity, scale, labelOpacity, router]);

  const styles = StyleSheet.create({
    root: { flex: 1 },
    hero: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    logoWrap: { alignItems: "center" },
    logo: { marginBottom: 0 },
    valetLabel: {
      marginTop: 0,
      fontSize: Math.round(F.secondary),
      fontWeight: "700",
      letterSpacing: 2,
      color: a.authHeroValetLabel,
      textTransform: "lowercase",
    },
  });

  return (
    <AnimatedAuthBackground isDark={theme.isDark}>
      <StatusBar barStyle={a.statusBarStyle} backgroundColor="transparent" />
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.hero,
            {
              opacity,
              transform: [
                { translateY: logoPosition },
                { scale },
              ],
            },
          ]}
        >
          <View style={styles.logoWrap}>
            <Logo size={LOGO_SIZE} style={styles.logo} variant={theme.isDark ? "onDark" : "onLight"} />
            <Animated.Text style={[styles.valetLabel, { opacity: labelOpacity }]}>valet</Animated.Text>
          </View>
        </Animated.View>
      </View>
    </AnimatedAuthBackground>
  );
}
