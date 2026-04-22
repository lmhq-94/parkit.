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
import { useLocaleStore, useThemeStore, useAccessibilityStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { IconMinus, IconPlus, IconCircleCheck } from "@/components/TablerIcons";
import type { Locale } from "@parkit/shared";
import { useMemo } from "react";
import { useValetTheme, useResponsiveLayout } from "@/theme/valetTheme";
import type { ThemePreference } from "@/lib/themeStore";
import { ValetBackButton } from "@/components/ValetBackButton";

const MIN_ROW = 58;

type Theme = ReturnType<typeof useValetTheme>;

/** Sección de accesibilidad con slider para escala de texto */
function AccessibilitySection() {
  const { textScale, setTextScale, reduceMotion, setReduceMotion } = useAccessibilityStore();
  const theme = useValetTheme();
  const locale = useLocaleStore((s) => s.locale);
  const responsive = useResponsiveLayout();

  const styles = useMemo(() => {
    const C = theme.colors;
    const S = theme.space;
    const F = theme.font;
    const Fonts = theme.fontFamily;

    return StyleSheet.create({
      sliderRow: {
        paddingVertical: S.md,
        paddingHorizontal: S.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.border,
      },
      sliderRowLast: {
        borderBottomWidth: 0,
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: MIN_ROW,
        paddingVertical: S.md,
        paddingHorizontal: S.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.border,
      },
      rowLast: {
        borderBottomWidth: 0,
      },
      rowActive: {
        backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
      },
      rowPressed: {
        opacity: 0.85,
        backgroundColor: theme.isDark ? "rgba(148, 163, 184, 0.12)" : "#E2E8F0",
      },
      label: {
        fontSize: Math.round(F.status * 0.65),
        fontWeight: "700",
        fontFamily: Fonts.primary,
        color: C.text,
      },
      hint: {
        fontSize: Math.round(F.status * 0.65),
        fontFamily: Fonts.primary,
        color: C.textSubtle,
        marginTop: 2,
        maxWidth: responsive.contentMaxWidth - 120,
      },
      sliderLabelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: S.sm,
      },
      sliderValue: {
        fontSize: Math.round(F.status * 0.65),
        fontWeight: "800",
        fontFamily: Fonts.primary,
        color: C.primary,
      },
      sliderControls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: S.sm,
      },
      sliderButton: {
        width: 28 * textScale,
        height: 28 * textScale,
        borderRadius: 14 * textScale,
        backgroundColor: C.primary,
        alignItems: "center",
        justifyContent: "center",
      },
      sliderButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
      },
      sliderValueBox: {
        alignItems: "center",
        justifyContent: "center",
        minWidth: 80,
      },
      progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: S.sm,
        marginTop: S.sm,
      },
      progressBarTrack: {
        flex: 1,
        height: 8,
        backgroundColor: theme.isDark ? 'rgba(148, 163, 184, 0.3)' : '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
      },
      progressBarFill: {
        height: '100%',
        backgroundColor: C.primary,
        borderRadius: 4,
      },
      progressLabel: {
        fontSize: Math.round(F.status * 0.65),
        fontWeight: '700',
        fontFamily: Fonts.primary,
        color: C.primary,
        minWidth: 40,
        textAlign: 'right',
      },
    });
  }, [theme, responsive.contentMaxWidth, textScale]);

  const progressPercent = Math.round(((textScale - 1) / 0.25) * 100);

  return (
    <>
      <View style={styles.sliderRow}>
        <View>
          <Text style={styles.label}>{t(locale, "settings.textScale")}</Text>
          <Text style={styles.hint}>{t(locale, "settings.textScaleDesc")}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.sliderButton,
              pressed && styles.sliderButtonPressed,
              textScale <= 1 && { opacity: 0.4 },
            ]}
            onPress={() => textScale > 1 && setTextScale(textScale - 0.05)}
            disabled={textScale <= 1}
          >
            <IconMinus size={28 * textScale} color="#fff" />
          </Pressable>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>{Math.round((textScale - 1) * 100)}%</Text>
          <Pressable
            style={({ pressed }) => [
              styles.sliderButton,
              pressed && styles.sliderButtonPressed,
              textScale >= 1.25 && { opacity: 0.4 },
            ]}
            onPress={() => textScale < 1.25 && setTextScale(textScale + 0.05)}
            disabled={textScale >= 1.25}
          >
            <IconPlus size={28 * textScale} color="#fff" />
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.row,
          styles.rowLast,
          reduceMotion && styles.rowActive,
          pressed && styles.rowPressed,
        ]}
        onPress={() => setReduceMotion(!reduceMotion)}
        accessibilityRole="button"
        accessibilityState={{ selected: reduceMotion }}
        accessibilityLabel={t(locale, "settings.reduceMotion")}
        accessibilityHint={t(locale, "settings.reduceMotionHint")}
      >
        <View>
          <Text style={styles.label}>{t(locale, "settings.reduceMotion")}</Text>
          <Text style={styles.hint}>{t(locale, "settings.reduceMotionDesc")}</Text>
        </View>
        {reduceMotion && (
          <IconCircleCheck size={28 * textScale} color={theme.colors.primary} />
        )}
      </Pressable>
    </>
  );
}

function createSettingsStyles(theme: Theme, contentMaxWidth: number, sectionPadding: number, textScale: number) {
  const C = theme.colors;
  const S = theme.space;
  const F = theme.font;
  const R = theme.radius;
  const Fonts = theme.fontFamily;

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
      fontSize: Math.round(F.secondary * 0.85),
      fontWeight: "800",
      fontFamily: Fonts.primary,
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
      fontSize: Math.round(F.secondary * 0.85 * textScale),
      fontWeight: "800",
      fontFamily: Fonts.primary,
      color: C.textMuted,
      letterSpacing: 0.65,
      marginBottom: S.sm,
      marginTop: S.md,
    },
    helpText: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      lineHeight: 18,
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
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "700",
      fontFamily: Fonts.primary,
      color: C.text,
    },
    localeHint: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.textSubtle,
      marginTop: 2,
    },
  });
}

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale } = useLocaleStore();
  const { preference, setPreference } = useThemeStore();
  const { textScale } = useAccessibilityStore();
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const styles = useMemo(
    () => createSettingsStyles(theme, responsive.contentMaxWidth, responsive.sectionPadding, textScale),
    [theme, responsive.contentMaxWidth, responsive.sectionPadding, textScale]
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
                  <IconCircleCheck size={28 * textScale} color={theme.colors.primary} />
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
                <IconCircleCheck size={28 * textScale} color={theme.colors.primary} />
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
                <IconCircleCheck size={28 * textScale} color={theme.colors.primary} />
              )}
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>{t(locale, "settings.accessibilitySection")}</Text>
          <View style={styles.section}>
            <AccessibilitySection />
          </View>
        </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
