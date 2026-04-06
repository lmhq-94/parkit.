import { View, Text, StyleSheet, Pressable, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import { useLocaleStore, usePreferencesStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { getAppVersionString } from "@/lib/appVersion";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { useColorScheme } from "react-native";

const ACCENT = "#3B82F6";

function useIsDark() {
  const systemScheme = useColorScheme();
  const preference = usePreferencesStore((s) => s.theme);
  return preference === "dark"
    ? true
    : preference === "light"
      ? false
      : systemScheme === "dark";
}

export default function WelcomeScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const isDark = useIsDark();

  return (
    <AnimatedAuthBackground isDark={isDark}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.hero}>
          <Logo size={56} style={styles.logo} darkBackground />
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomSection} edges={["bottom"]}>
        <Text style={styles.ctaText}>{t(locale, "welcome.cta")}</Text>
        <Pressable
          onPress={() => router.replace("/login")}
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnPrimaryText}>{t(locale, "welcome.login")}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace("/signup")}
          style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnSecondaryText}>{t(locale, "welcome.signup")}</Text>
        </Pressable>
        <Text style={styles.versionLabel} accessibilityRole="text">
          {t(locale, "welcome.version", { version: getAppVersionString() || "—" })}
        </Text>
      </SafeAreaView>
    </AnimatedAuthBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  hero: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    marginBottom: 14,
  },
  brandName: {
    fontFamily: "CalSans",
    fontSize: 32,
    fontWeight: Platform.OS === "android" ? "normal" : "700",
    color: ACCENT,
    letterSpacing: -0.5,
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
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
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
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  btnPressed: {
    opacity: 0.9,
  },
  versionLabel: {
    marginTop: 20,
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
  },
});
