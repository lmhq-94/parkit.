import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, StatusBar, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/store";
import { getHasSeenOnboarding } from "@/lib/onboarding";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { useIsDark } from "@/lib/useIsDark";
import { Logo } from "@parkit/shared";

const SPLASH_DURATION_MS = 2600;
const LOGO_SIZE = 72;

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isDark = useIsDark();

  const breathScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Single subtle "breath" for the logo
    const breathAnimation = Animated.sequence([
      Animated.timing(breathScale, {
        toValue: 1.032,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(breathScale, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
    ]);
    breathAnimation.start();
  }, [breathScale]);

  useEffect(() => {
    const go = async () => {
      await new Promise((r) => setTimeout(r, SPLASH_DURATION_MS));
      if (!user) {
        router.replace("/welcome");
        return;
      }
      const hasSeenOnboarding = await getHasSeenOnboarding();
      if (hasSeenOnboarding) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    };
    go();
  }, [user, router]);

  return (
    <AnimatedAuthBackground isDark={isDark}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" />
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: breathScale }] }]}>
          <Logo size={LOGO_SIZE} style={styles.logo} variant="onDark" />
          <Text style={styles.brandLabel}>parkit</Text>
        </Animated.View>
      </View>
    </AnimatedAuthBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'transparent',
  },
  logoWrap: {
    alignItems: "center",
  },
  logo: { marginBottom: 0 },
  brandLabel: {
    marginTop: 28,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#F8FAFC",
    textTransform: "lowercase",
  },
});
