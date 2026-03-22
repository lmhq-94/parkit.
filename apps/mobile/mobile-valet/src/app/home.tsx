import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Logo } from "@parkit/shared";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useValetProfileSync } from "@/lib/useValetProfileSync";

/**
 * Pantalla principal tras iniciar sesión: mensaje y accesos distintos para conductor vs recepción.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  useValetProfileSync(user);

  const isDriverUi = user?.valetStaffRole === "DRIVER";

  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  const C = theme.colors;
  const M = ticketsA11y.minTouch;
  const first = user.firstName?.trim() || user.email?.split("@")[0] || "—";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Logo size={64} variant="onDark" style={styles.logo} />
          <Text style={styles.greeting} maxFontSizeMultiplier={2}>
            {t(locale, "home.greeting", { name: first })}
          </Text>
          <View style={[styles.badge, isDriverUi ? styles.badgeDriver : styles.badgeReception]}>
            <Ionicons
              name={isDriverUi ? "car-sport-outline" : "clipboard-outline"}
              size={26}
              color={C.white}
            />
            <Text style={styles.badgeText} maxFontSizeMultiplier={2}>
              {isDriverUi ? t(locale, "home.roleBadgeDriver") : t(locale, "home.roleBadgeReception")}
            </Text>
          </View>
          <Text style={styles.title} maxFontSizeMultiplier={1.8}>
            {isDriverUi ? t(locale, "home.titleDriver") : t(locale, "home.titleReception")}
          </Text>
          <Text style={styles.body} maxFontSizeMultiplier={2}>
            {isDriverUi ? t(locale, "home.bodyDriver") : t(locale, "home.bodyReception")}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, { minHeight: M }, pressed && styles.pressed]}
            onPress={() => router.push("/tickets")}
            accessibilityRole="button"
            accessibilityHint={t(locale, "home.primaryCta")}
          >
            <Ionicons name="list-outline" size={30} color="#FFFFFF" />
            <Text style={styles.btnPrimaryText} maxFontSizeMultiplier={2}>
              {t(locale, "home.primaryCta")}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnSecondary, { minHeight: M }, pressed && styles.pressed]}
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={28} color={C.text} />
            <Text style={styles.btnSecondaryText} maxFontSizeMultiplier={2}>
              {t(locale, "home.settings")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Theme = ReturnType<typeof useValetTheme>;

function createStyles(theme: Theme) {
  const C = theme.colors;
  const S = theme.space;
  const F = ticketsA11y.font;
  const R = theme.radius;
  const heroBg = theme.isDark ? "#020617" : "#0F172A";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg,
    },
    scroll: {
      flexGrow: 1,
      paddingBottom: S.xxl,
    },
    hero: {
      backgroundColor: heroBg,
      paddingHorizontal: S.lg,
      paddingTop: S.xl,
      paddingBottom: S.xxl,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        android: { elevation: 6 },
      }),
    },
    logo: {
      marginBottom: S.md,
    },
    greeting: {
      fontSize: F.subtitle,
      fontWeight: "600",
      color: "rgba(248, 250, 252, 0.9)",
      marginBottom: S.md,
      textAlign: "center",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.sm,
      paddingVertical: 10,
      paddingHorizontal: S.lg,
      borderRadius: 999,
      marginBottom: S.lg,
    },
    badgeDriver: {
      backgroundColor: "rgba(59, 130, 246, 0.35)",
      borderWidth: 2,
      borderColor: "rgba(147, 197, 253, 0.5)",
    },
    badgeReception: {
      backgroundColor: "rgba(249, 115, 22, 0.35)",
      borderWidth: 2,
      borderColor: "rgba(253, 186, 116, 0.55)",
    },
    badgeText: {
      fontSize: F.secondary,
      fontWeight: "800",
      color: "#F8FAFC",
    },
    title: {
      fontSize: F.title + 4,
      fontWeight: "800",
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: S.md,
      letterSpacing: Platform.OS === "ios" ? -0.5 : 0,
    },
    body: {
      fontSize: F.body,
      lineHeight: 30,
      fontWeight: "600",
      color: "rgba(226, 232, 240, 0.95)",
      textAlign: "center",
      maxWidth: 360,
    },
    actions: {
      paddingHorizontal: S.lg,
      paddingTop: S.xxl,
      gap: S.md,
    },
    btnPrimary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.md,
      backgroundColor: C.primary,
      borderRadius: R.button + 4,
      paddingHorizontal: S.lg,
      ...Platform.select({
        ios: {
          shadowColor: C.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
        },
        android: { elevation: 4 },
      }),
    },
    btnPrimaryText: {
      fontSize: F.button,
      fontWeight: "800",
      color: "#FFFFFF",
      flexShrink: 1,
      textAlign: "center",
    },
    btnSecondary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.md,
      backgroundColor: C.card,
      borderRadius: R.button + 4,
      paddingHorizontal: S.lg,
      borderWidth: 2,
      borderColor: C.border,
    },
    btnSecondaryText: {
      fontSize: F.button,
      fontWeight: "800",
      color: C.text,
    },
    pressed: {
      opacity: 0.92,
    },
  });
}
