import { View, Text, StyleSheet, Pressable, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";

const DARK_BG = "#0F172A";
const ACCENT = "#3B82F6";

export default function WelcomeScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.hero}>
          <Logo size={56} style={styles.logo} darkBackground />
          <Text style={styles.brandName}>Parkit</Text>
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
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
    fontWeight: "700",
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
});
