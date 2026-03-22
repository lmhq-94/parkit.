import { View, Text, StyleSheet, Pressable, StatusBar, Dimensions, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useEffect, useRef, useMemo } from "react";
import { AuthHeroGradient } from "@/components/AuthHeroGradient";
import { useValetTheme, ACCENT } from "@/theme/valetTheme";
import { getAppVersionString } from "@/lib/appVersion";

const LOGO_SIZE = 72;
const CONTROL_HEIGHT = 56;
const WINDOW_HEIGHT = Dimensions.get("window").height;
const HERO_MIN_HEIGHT = Math.round(WINDOW_HEIGHT * 0.32);

/**
 * Pantalla inicial valet: logo + valet y botones LOGIN (azul) / SIGN UP (oscuro), como tokens de tema.
 */
export function WelcomeContent({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  const locale = useLocaleStore((s) => s.locale);
  const insets = useSafeAreaInsets();
  const theme = useValetTheme();
  const { auth: a } = theme;
  const buttonsTranslateY = useRef(new Animated.Value(26)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        rootColumn: { flex: 1 },
        heroStrip: {
          flex: 1,
          backgroundColor: a.authHeroStripBg,
        },
        hero: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          minHeight: HERO_MIN_HEIGHT,
        },
        logoWrap: { alignItems: "center" },
        logo: { marginBottom: 0 },
        valetLabel: {
          marginTop: 28,
          fontSize: 15,
          fontWeight: "600",
          letterSpacing: 4,
          color: a.authHeroValetLabel,
          textTransform: "lowercase",
        },
        bottomSection: {
          backgroundColor: a.bottomSheet,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          ...a.authFormSheetSeparator,
          paddingHorizontal: 28,
          paddingTop: 28,
          paddingBottom: 0,
          alignItems: "stretch",
        },
        ctaText: {
          fontSize: 20,
          fontWeight: "600",
          color: a.text,
          marginBottom: 20,
          textAlign: "center",
        },
        btnPrimary: {
          backgroundColor: a.btnLoginBg,
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
          color: a.btnLoginText,
          letterSpacing: 0.5,
        },
        btnSecondary: {
          backgroundColor: a.btnSignupBg,
          minHeight: CONTROL_HEIGHT,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 0,
        },
        btnSecondaryText: {
          fontSize: 16,
          fontWeight: "800",
          color: a.btnSignupText,
          letterSpacing: 0.5,
        },
        btnPressed: { opacity: 0.9 },
        versionLabel: {
          marginTop: 20,
          fontSize: 12,
          fontWeight: "500",
          color: a.textMuted,
          textAlign: "center",
        },
      }),
    [a]
  );

  const versionLabel = t(locale, "welcome.version", {
    version: getAppVersionString() || "—",
  });

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
    <AuthHeroGradient chromeBg={a.authScreenChromeBg}>
      <StatusBar barStyle={a.statusBarStyle} backgroundColor={a.statusBarBg} />
      <View style={styles.rootColumn}>
        <View style={styles.heroStrip}>
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Logo size={LOGO_SIZE} style={styles.logo} variant="onDark" />
              <Text style={styles.valetLabel}>valet</Text>
            </View>
          </View>
        </View>

        <Animated.View
          style={{
            transform: [{ translateY: buttonsTranslateY }],
            opacity: buttonsOpacity,
          }}
        >
          <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 12) }]}>
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
            <Text style={styles.versionLabel} accessibilityRole="text">
              {versionLabel}
            </Text>
          </View>
        </Animated.View>
      </View>
    </AuthHeroGradient>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <WelcomeContent
      onLogin={() => router.push("/login")}
      onSignup={() => router.push("/login?mode=signup")}
    />
  );
}
