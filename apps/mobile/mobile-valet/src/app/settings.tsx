import { View, Text, ScrollView, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale } = useLocaleStore();

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>{t(locale, "settings.language")}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(locale, "settings.language")}</Text>
          <Pressable
            style={[styles.localeRow, locale === "es" && styles.localeRowActive]}
            onPress={() => handleSetLocale("es")}
          >
            <Text style={styles.localeLabel}>{t(locale, "settings.spanish")}</Text>
            {locale === "es" && <Ionicons name="checkmark-circle" size={22} color="#3B82F6" />}
          </Pressable>
          <Pressable
            style={[styles.localeRow, locale === "en" && styles.localeRowActive]}
            onPress={() => handleSetLocale("en")}
          >
            <Text style={styles.localeLabel}>{t(locale, "settings.english")}</Text>
            {locale === "en" && <Ionicons name="checkmark-circle" size={22} color="#3B82F6" />}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  localeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  localeRowActive: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },
  localeLabel: {
    fontSize: 15,
    color: "#111827",
  },
});
