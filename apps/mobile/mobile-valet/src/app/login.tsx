import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Logo } from "@parkit/shared";
import api, { setAuthToken } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";

const SUPPORT_EMAIL = "mailto:soporte@parkit.app";
const DARK_BG = "#0F172A";
const PRIMARY = "#3B82F6";
const DARK_BTN = "#1E293B";
const BORDER_COLOR = "#E2E8F0";
const TEXT_PRIMARY = "#0F172A";
const TEXT_MUTED = "#64748B";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError(t(locale, "common.errorFillFields"));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email: email.trim(), password });
      const { token, user } = response.data.data;
      await setAuthToken(token);
      await saveUser(user);
      setUser(user);
      router.replace("/tickets");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || t(locale, "common.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity onPress={() => router.replace("/welcome")} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.hero}>
        <Logo size={48} style={styles.heroLogo} darkBackground />
        <Text style={styles.heroBrand}>valet</Text>
      </View>

      <SafeAreaView style={styles.bottomSection} edges={["bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.cardHeadline}>{t(locale, "login.headline")}</Text>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>{t(locale, "login.email")}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder={t(locale, "login.placeholderEmail")}
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(null); }}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIconRight} />
              </View>
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>{t(locale, "login.password")}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={t(locale, "login.placeholderPassword")}
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(null); }}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.eyeWrap}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotWrap} onPress={() => {}} hitSlop={8}>
                <Text style={styles.forgot}>{t(locale, "login.forgetPassword")}</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorWrap}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginBtn,
                pressed && styles.btnPressed,
                loading && styles.btnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>{t(locale, "login.submit")}</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t(locale, "login.footer")}</Text>
              <Pressable onPress={() => Linking.openURL(SUPPORT_EMAIL)}>
                <Text style={styles.footerLink}>{t(locale, "login.contactSupport")}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(248, 250, 252, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  heroLogo: { marginBottom: 10 },
  heroBrand: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 4,
    color: "rgba(148, 163, 184, 0.58)",
    textTransform: "lowercase",
  },
  bottomSection: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
  },
  keyboardWrap: {},
  scrollContent: { paddingBottom: 24 },
  cardHeadline: {
    fontSize: 20,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 28,
    letterSpacing: -0.2,
  },
  inputBlock: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#475569", marginBottom: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: "#FFFFFF",
    paddingLeft: 16,
    paddingRight: 14,
  },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: TEXT_PRIMARY },
  passwordInput: { paddingRight: 10 },
  inputIconRight: { marginLeft: 10 },
  eyeWrap: { padding: 4, marginLeft: 6 },
  forgotWrap: { alignSelf: "flex-end", marginTop: 10 },
  forgot: { fontSize: 13, fontWeight: "600", color: PRIMARY },
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 18,
  },
  errorText: { color: "#EF4444", fontSize: 14, fontWeight: "500" },
  loginBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 28,
    backgroundColor: DARK_BTN,
  },
  loginBtnText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
  btnPressed: { opacity: 0.92 },
  btnDisabled: { opacity: 0.7 },
  footer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 4 },
  footerText: { fontSize: 13, color: TEXT_MUTED },
  footerLink: { fontSize: 13, fontWeight: "600", color: PRIMARY },
});
