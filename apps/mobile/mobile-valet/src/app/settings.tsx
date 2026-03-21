import { View, Text, ScrollView, Pressable, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { valetHomeTheme as T } from "@/theme/valetHomeTheme";

const MIN_ROW = 58;

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale } = useLocaleStore();

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
            <Ionicons name="chevron-back" size={32} color={T.colors.text} />
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
              {locale === "es" && <Ionicons name="checkmark-circle" size={28} color={T.colors.primary} />}
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
              {locale === "en" && <Ionicons name="checkmark-circle" size={28} color={T.colors.primary} />}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: T.colors.bg,
  },
  inner: {
    flex: 1,
    backgroundColor: T.colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: T.space.md,
    paddingVertical: T.space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.colors.border,
    backgroundColor: T.colors.card,
  },
  backBtn: {
    width: T.minTouch,
    height: T.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: T.colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: T.space.lg,
    paddingBottom: 40,
  },
  helpText: {
    fontSize: T.font.secondary,
    lineHeight: 24,
    color: T.colors.textMuted,
    fontWeight: "600",
    marginBottom: T.space.lg,
  },
  section: {
    backgroundColor: T.colors.card,
    borderRadius: T.radius.card,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: T.colors.border,
  },
  localeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: MIN_ROW,
    paddingVertical: T.space.md,
    paddingHorizontal: T.space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.colors.border,
  },
  localeRowActive: {
    backgroundColor: "#EFF6FF",
  },
  localeRowPressed: {
    opacity: Platform.OS === "ios" ? 0.85 : 1,
    backgroundColor: "#E2E8F0",
  },
  localeLabel: {
    fontSize: T.font.body,
    fontWeight: "700",
    color: T.colors.text,
  },
});
