import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocaleStore, useThemeStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { useMemo } from "react";
import { useValetTheme, ticketsA11y, useResponsiveLayout } from "@/theme/valetTheme";
import type { ThemePreference } from "@/lib/themeStore";
import { ValetBackButton } from "@/components/ValetBackButton";

const MIN_ROW = 58;

type Theme = ReturnType<typeof useValetTheme>;

function createSettingsStyles(theme: Theme, contentMaxWidth: number, sectionPadding: number) {
  const C = theme.colors;
  const S = theme.space;
  const F = theme.font;
  const Fa = ticketsA11y.font;
  const R = theme.radius;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg,
    },
    inner: {
      flex: 1,
      backgroundColor: C.bg,
      alignItems: "center",
    },
    contentFrame: {
      flex: 1,
      width: "100%",
      maxWidth: contentMaxWidth,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: sectionPadding,
      paddingVertical: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    headerSpacer: {
      width: 44,
    },
    title: {
      fontSize: Fa.title - 4,
      fontWeight: "800",
      color: C.text,
      flex: 1,
      textAlign: "center",
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: sectionPadding,
      paddingTop: S.sm,
      paddingBottom: 40,
    },
    /** Misma jerarquía visual que `receive` / tickets (legible en ES/EN). */
    sectionTitle: {
      fontSize: Fa.secondary - 3,
      fontWeight: "800",
      color: C.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.65,
      marginBottom: S.sm,
      marginTop: S.md,
    },
    helpText: {
      fontSize: F.secondary,
      lineHeight: 24,
      color: C.textMuted,
      fontWeight: "600",
      marginBottom: S.md,
    },
    section: {
      backgroundColor: C.card,
      borderRadius: R.card,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: C.border,
    },
    localeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: MIN_ROW,
      paddingVertical: S.md,
      paddingHorizontal: S.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    localeRowLast: {
      borderBottomWidth: 0,
    },
    localeRowActive: {
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
    },
    localeRowPressed: {
      opacity: 0.85,
      backgroundColor: theme.isDark ? "rgba(148, 163, 184, 0.12)" : "#E2E8F0",
    },
    localeLabel: {
      fontSize: F.body,
      fontWeight: "700",
      color: C.text,
    },
    localeHint: {
      fontSize: 12,
      color: C.textSubtle,
      marginTop: 2,
    },
  });
}

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale } = useLocaleStore();
  const { preference, setPreference } = useThemeStore();
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const styles = useMemo(
    () => createSettingsStyles(theme, responsive.contentMaxWidth, responsive.sectionPadding),
    [theme, responsive.contentMaxWidth, responsive.sectionPadding]
  );

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const handleSetTheme = (pref: ThemePreference) => {
    setPreference(pref);
  };

  const themeLabel = (pref: ThemePreference) => {
    if (pref === "system") return t(locale, "settings.themeSystem");
    if (pref === "light") return t(locale, "settings.themeLight");
    return t(locale, "settings.themeDark");
  };

  const isThemeActive = (pref: ThemePreference) => preference === pref;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.card}
        translucent={Platform.OS === "android"}
      />
      <View style={styles.inner} key={locale}>
        <View style={styles.contentFrame}>
        <View style={[styles.header, { paddingTop: insets.top + theme.space.md }]}>
          <ValetBackButton
            onPress={() => router.back()}
            accessibilityLabel={t(locale, "common.back")}
          />
          <Text style={styles.title} maxFontSizeMultiplier={1.8}>
            {t(locale, "settings.title")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.helpText} maxFontSizeMultiplier={2}>
            {t(locale, "settings.intro")}
          </Text>

          <Text style={styles.sectionTitle}>{t(locale, "settings.themeSection")}</Text>
          <View style={styles.section}>
            {(["system", "light", "dark"] as const).map((pref, i, arr) => (
              <Pressable
                key={pref}
                style={({ pressed }) => [
                  styles.localeRow,
                  i === arr.length - 1 && styles.localeRowLast,
                  isThemeActive(pref) && styles.localeRowActive,
                  pressed && styles.localeRowPressed,
                ]}
                onPress={() => handleSetTheme(pref)}
                accessibilityRole="button"
                accessibilityState={{ selected: isThemeActive(pref) }}
              >
                <View>
                  <Text style={styles.localeLabel}>{themeLabel(pref)}</Text>
                  {pref === "system" && (
                    <Text style={styles.localeHint}>
                      {systemScheme === "light"
                        ? t(locale, "settings.themeSystemHintLight")
                        : t(locale, "settings.themeSystemHintDark")}
                    </Text>
                  )}
                </View>
                {isThemeActive(pref) && (
                  <Ionicons name="checkmark-circle" size={28} color={theme.colors.primary} />
                )}
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t(locale, "settings.languageSection")}</Text>
          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.localeRow,
                locale === "es" && styles.localeRowActive,
                pressed && styles.localeRowPressed,
              ]}
              onPress={() => handleSetLocale("es")}
              accessibilityRole="button"
              accessibilityState={{ selected: locale === "es" }}
            >
              <Text style={styles.localeLabel}>{t(locale, "settings.spanish")}</Text>
              {locale === "es" && (
                <Ionicons name="checkmark-circle" size={28} color={theme.colors.primary} />
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.localeRow,
                styles.localeRowLast,
                locale === "en" && styles.localeRowActive,
                pressed && styles.localeRowPressed,
              ]}
              onPress={() => handleSetLocale("en")}
              accessibilityRole="button"
              accessibilityState={{ selected: locale === "en" }}
            >
              <Text style={styles.localeLabel}>{t(locale, "settings.english")}</Text>
              {locale === "en" && (
                <Ionicons name="checkmark-circle" size={28} color={theme.colors.primary} />
              )}
            </Pressable>
          </View>
        </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
