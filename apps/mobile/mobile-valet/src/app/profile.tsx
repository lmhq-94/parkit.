import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { ValetBackButton } from "@/components/ValetBackButton";
import api from "@/lib/api";
import { messageFromAxios } from "@/lib/apiErrors";
import { saveUser } from "@/lib/auth";

type MePayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const { user, mergeUser } = useAuthStore();
  const theme = useValetTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const C = theme.colors;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  /** Vista previa local (data URL) o null si el usuario quitó la foto antes de guardar */
  const [localAvatar, setLocalAvatar] = useState<string | null | undefined>(undefined);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: MePayload }>("/users/me");
      const d = res.data?.data;
      if (d) {
        setFirstName(String(d.firstName ?? ""));
        setLastName(String(d.lastName ?? ""));
        setEmail(String(d.email ?? ""));
        setPhone(d.phone != null ? String(d.phone) : "");
        setLocalAvatar(undefined);
        setAvatarRemoved(false);
      }
    } catch {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "profile.loadError"));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    load();
  }, [load]);

  const displayAvatarUri =
    localAvatar !== undefined
      ? avatarRemoved
        ? null
        : localAvatar
      : user?.avatarUrl?.trim() || null;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "profile.photoPermissionDenied"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.92,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    try {
      const manipulated = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 480 } }],
        { compress: 0.82, format: SaveFormat.JPEG, base64: true }
      );
      if (manipulated.base64) {
        setLocalAvatar(`data:image/jpeg;base64,${manipulated.base64}`);
        setAvatarRemoved(false);
      }
    } catch {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "profile.photoProcessError"));
    }
  };

  const clearLocalPhoto = () => {
    setLocalAvatar(undefined);
    setAvatarRemoved(true);
  };

  const handleSave = async () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    if (!fn || !ln || !em) {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "profile.errorRequired"));
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: fn,
        lastName: ln,
        email: em,
        phone: phone.trim() || undefined,
      };
      if (localAvatar !== undefined) {
        payload.avatarUrl = avatarRemoved ? null : localAvatar;
      }
      const res = await api.patch<{ data: MePayload }>("/users/me", payload);
      const d = res.data?.data;
      if (d && user) {
        const nextAvatar =
          localAvatar !== undefined
            ? avatarRemoved
              ? null
              : localAvatar
            : d.avatarUrl != null
              ? String(d.avatarUrl)
              : user.avatarUrl ?? null;
        mergeUser({
          firstName: String(d.firstName ?? fn),
          lastName: String(d.lastName ?? ln),
          email: String(d.email ?? em),
          phone: d.phone != null ? String(d.phone) : phone.trim() || null,
          avatarUrl: nextAvatar,
        });
        const next = useAuthStore.getState().user;
        if (next) await saveUser(next);
        setLocalAvatar(undefined);
        setAvatarRemoved(false);
        Alert.alert(t(locale, "common.successTitle"), t(locale, "profile.saveSuccess"));
      }
    } catch (e) {
      Alert.alert(
        t(locale, "common.errorTitle"),
        messageFromAxios(e) || t(locale, "profile.saveError")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <ValetBackButton
            onPress={() => router.back()}
            accessibilityLabel={t(locale, "common.back")}
          />
          <Text style={styles.headerTitle}>{t(locale, "profile.title")}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingText}>{t(locale, "common.loading")}</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.intro}>{t(locale, "profile.intro")}</Text>

            <View style={styles.avatarBlock}>
              <Pressable
                onPress={pickImage}
                style={({ pressed }) => [styles.avatarRing, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={t(locale, "profile.changePhoto")}
              >
                {displayAvatarUri ? (
                  <Image source={{ uri: displayAvatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={48} color={C.textSubtle} />
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              </Pressable>
              <View style={styles.avatarActions}>
                <Pressable onPress={pickImage} style={styles.secondaryLink}>
                  <Text style={styles.secondaryLinkText}>{t(locale, "profile.changePhoto")}</Text>
                </Pressable>
                {(!!displayAvatarUri ||
                  (typeof localAvatar === "string" && localAvatar.length > 0)) && (
                  <Pressable onPress={clearLocalPhoto} style={styles.secondaryLink}>
                    <Text style={[styles.secondaryLinkText, styles.dangerText]}>
                      {t(locale, "profile.removePhoto")}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            <Text style={styles.label}>{t(locale, "profile.firstName")}</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t(locale, "profile.placeholderFirstName")}
              placeholderTextColor={C.textSubtle}
              autoCapitalize="words"
            />

            <Text style={styles.label}>{t(locale, "profile.lastName")}</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t(locale, "profile.placeholderLastName")}
              placeholderTextColor={C.textSubtle}
              autoCapitalize="words"
            />

            <Text style={styles.label}>{t(locale, "profile.email")}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t(locale, "profile.placeholderEmail")}
              placeholderTextColor={C.textSubtle}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>{t(locale, "profile.phone")}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t(locale, "profile.placeholderPhone")}
              placeholderTextColor={C.textSubtle}
              keyboardType="phone-pad"
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                saving && styles.btnDisabled,
                pressed && !saving && styles.pressed,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>{t(locale, "profile.save")}</Text>
              )}
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type Theme = ReturnType<typeof useValetTheme>;

function createStyles(theme: Theme) {
  const C = theme.colors;
  const S = theme.space;
  const F = ticketsA11y.font;
  const R = theme.radius;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    flex: { flex: 1 },
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
    headerSpacer: { width: 44 },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: F.title - 4,
      fontWeight: "800",
      color: C.text,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: S.md,
    },
    loadingText: { fontSize: F.secondary, color: C.textMuted },
    scroll: { flex: 1 },
    scrollContent: { padding: S.lg, paddingBottom: S.xxl * 2 },
    intro: {
      fontSize: F.secondary,
      color: C.textMuted,
      lineHeight: 24,
      marginBottom: S.lg,
      fontWeight: "600",
    },
    avatarBlock: { alignItems: "center", marginBottom: S.xl },
    avatarRing: {
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: "hidden",
      borderWidth: 3,
      borderColor: C.primary,
      backgroundColor: C.card,
    },
    avatarImage: { width: "100%", height: "100%" },
    avatarPlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDark ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.06)",
    },
    avatarEditBadge: {
      position: "absolute",
      right: 6,
      bottom: 6,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(15,23,42,0.75)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: C.card,
    },
    avatarActions: { marginTop: S.md, alignItems: "center", gap: S.sm },
    secondaryLink: { paddingVertical: S.xs },
    secondaryLinkText: {
      fontSize: F.secondary,
      fontWeight: "700",
      color: C.primary,
    },
    dangerText: { color: C.logout },
    label: {
      fontSize: 12,
      fontWeight: "800",
      color: C.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: S.xs,
    },
    input: {
      backgroundColor: C.card,
      borderWidth: 2,
      borderColor: C.border,
      borderRadius: R.button,
      paddingHorizontal: S.md,
      paddingVertical: 14,
      fontSize: F.body,
      color: C.text,
      marginBottom: S.md,
    },
    primaryBtn: {
      marginTop: S.lg,
      backgroundColor: C.primary,
      borderRadius: R.button + 2,
      paddingVertical: S.md,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 52,
    },
    primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: F.button },
    btnDisabled: { opacity: 0.55 },
    pressed: { opacity: 0.9 },
  });
}
