import { View, Text, StyleSheet, Pressable, StatusBar, Dimensions, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useEffect, useRef } from "react";

// Mismos valores que el splash para que logo y "valet" se vean igual y en el mismo lugar
const SPLASH_BG = "#020617";
const LOGO_SIZE = 72;
const SUBTLE_TEXT = "rgba(148, 163, 184, 0.58)";
const ACCENT = "#3B82F6";
const CONTROL_HEIGHT = 56;
const WINDOW_HEIGHT = Dimensions.get("window").height;
const HERO_MIN_HEIGHT = Math.round(WINDOW_HEIGHT * 0.32);

/**
 * Pantalla inicial valet: logo + valet (mismo lugar y estilo que el splash) y,
 * en la parte inferior, botones LOGIN y SIGN UP.
 */
export function WelcomeContent({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  const locale = useLocaleStore((s) => s.locale);
  const buttonsTranslateY = useRef(new Animated.Value(26)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(buttonsTranslateY, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonsOpacity, buttonsTranslateY]);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Logo size={LOGO_SIZE} style={styles.logo} darkBackground />
          <Text style={styles.valetLabel}>valet</Text>
        </View>
      </View>

      <Animated.View
        style={{
          transform: [{ translateY: buttonsTranslateY }],
          opacity: buttonsOpacity,
        }}
      >
      <SafeAreaView style={styles.bottomSection} edges={["bottom"]}>
        <Text style={styles.ctaText}>{t(locale, "welcome.cta")}</Text>
        <Pressable
          onPress={onLogin}
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnPrimaryText}>{t(locale, "welcome.login")}</Text>
        </Pressable>
        <Pressable
          onPress={onSignup}
          style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnSecondaryText}>{t(locale, "welcome.signup")}</Text>
        </Pressable>
      </SafeAreaView>
      </Animated.View>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={SPLASH_BG} />
      <WelcomeContent
        onLogin={() => router.push("/login")}
        onSignup={() => router.push("/login?mode=signup")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SPLASH_BG },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: HERO_MIN_HEIGHT,
  },
  logoWrap: {
    alignItems: "center",
  },
  logo: { marginBottom: 0 },
  valetLabel: {
    marginTop: 28,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 4,
    color: SUBTLE_TEXT,
    textTransform: "lowercase",
  },
  bottomSection: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: "stretch",
  },
  ctaText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 24,
    textAlign: "center",
  },
  btnPrimary: {
    backgroundColor: ACCENT,
    minHeight: CONTROL_HEIGHT,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  btnSecondary: {
    backgroundColor: "#0F172A",
    minHeight: CONTROL_HEIGHT,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  btnPressed: { opacity: 0.9 },
});
