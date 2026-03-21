import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useValetTheme } from "@/theme/valetTheme";

const MIN_ROW = 58;

type Theme = ReturnType<typeof useValetTheme>;

function createSettingsStyles(theme: Theme) {
  const C = theme.colors;
  const S = theme.space;
  const F = theme.font;
  const R = theme.radius;
  const M = theme.minTouch;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg,
    },
    inner: {
      flex: 1,
      backgroundColor: C.bg,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: S.md,
      paddingVertical: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    backBtn: {
      width: M,
      height: M,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: C.text,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: S.lg,
      paddingBottom: 40,
    },
    helpText: {
      fontSize: F.secondary,
      lineHeight: 24,
      color: C.textMuted,
      fontWeight: "600",
      marginBottom: S.lg,
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
    localeRowActive: {
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
    },
    localeRowPressed: {
      opacity: Platform.OS === "ios" ? 0.85 : 1,
      backgroundColor: theme.isDark ? "rgba(148, 163, 184, 0.12)" : "#E2E8F0",
    },
    localeLabel: {
      fontSize: F.body,
      fontWeight: "700",
      color: C.text,
    },
  });
}

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale } = useLocaleStore();
  const theme = useValetTheme();
  const styles = useMemo(() => createSettingsStyles(theme), [theme]);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={16}
            accessibilityRole="button"
            accessibilityLabel={t(locale, "common.back")}
          >
            <Ionicons name="chevron-back" size={32} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title} maxFontSizeMultiplier={1.8}>
            {t(locale, "settings.language")}
          </Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.helpText} maxFontSizeMultiplier={2}>
            {t(locale, "settings.helpHint")}
          </Text>
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
    </SafeAreaView>
  );
}
