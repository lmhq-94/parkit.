import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { clearUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { router } from "expo-router";
import type { Locale } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { locale, setLocale } = useLocaleStore();

  const handleLogout = async () => {
    await clearUser();
    logout();
    router.replace("/welcome");
  };

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>{t(locale, "common.loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName[0]}
            {user.lastName[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.systemRole}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(locale, "profile.accountInfo")}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t(locale, "profile.email")}</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t(locale, "profile.name")}</Text>
          <Text style={styles.value}>{`${user.firstName} ${user.lastName}`}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t(locale, "profile.role")}</Text>
          <Text style={styles.value}>{user.systemRole}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(locale, "settings.language")}</Text>
        <Pressable
          style={[styles.localeRow, locale === "es" && styles.localeRowActive]}
          onPress={() => handleSetLocale("es")}
        >
          <Text style={styles.localeLabel}>{t(locale, "settings.spanish")}</Text>
          {locale === "es" && <Ionicons name="checkmark-circle" size={22} color="#0066FF" />}
        </Pressable>
        <Pressable
          style={[styles.localeRow, locale === "en" && styles.localeRowActive]}
          onPress={() => handleSetLocale("en")}
        >
          <Text style={styles.localeLabel}>{t(locale, "settings.english")}</Text>
          {locale === "en" && <Ionicons name="checkmark-circle" size={22} color="#0066FF" />}
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>{t(locale, "profile.logout")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 30,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0066FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  role: {
    fontSize: 12,
    color: "#999",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    marginTop: 8,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  localeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  localeRowActive: {
    backgroundColor: "rgba(0, 102, 255, 0.06)",
  },
  localeLabel: {
    fontSize: 15,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
