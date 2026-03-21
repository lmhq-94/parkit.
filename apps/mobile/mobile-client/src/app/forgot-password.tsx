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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import api from "@/lib/api";

const DARK_BG = "#0F172A";
const PRIMARY = "#3B82F6";
const DARK_BTN = "#1E293B";
const BORDER_COLOR = "#E2E8F0";
const TEXT_PRIMARY = "#0F172A";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || t(locale, "forgot.errorSend"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.hero}>
        <Logo size={48} style={styles.heroLogo} darkBackground />
        <Text style={styles.heroBrand}>Parkit</Text>
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
            <Text style={styles.cardHeadline}>{t(locale, "forgot.headline")}</Text>
            <Text style={styles.subtitle}>
              {submitted
                ? t(locale, "forgot.sent", { email })
                : t(locale, "forgot.description")}
            </Text>

            {submitted ? (
              <TouchableOpacity
                onPress={() => router.replace("/login")}
                style={styles.backToLoginBtn}
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={20} color={PRIMARY} />
                <Text style={styles.backToLoginText}>{t(locale, "forgot.backToLogin")}</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.inputBlock}>
                  <Text style={styles.label}>{t(locale, "login.email")}</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder={t(locale, "forgot.placeholderEmail")}
                      placeholderTextColor="#94A3B8"
                      value={email}
                      onChangeText={(v) => {
                        setEmail(v);
                        setError(null);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                    <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIconRight} />
                  </View>
                </View>

                {error ? (
                  <View style={styles.errorWrap}>
                    <Ionicons name="alert-circle" size={18} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading || !email.trim()}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    pressed && styles.btnPressed,
                    (isLoading || !email.trim()) && styles.btnDisabled,
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>{t(locale, "forgot.sendLink")}</Text>
                  )}
                </Pressable>

                <View style={styles.footer}>
                  <TouchableOpacity onPress={() => router.replace("/login")} hitSlop={8}>
                    <Text style={styles.footerLink}>{t(locale, "forgot.backToLogin")}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    fontFamily: "CalSans",
    fontSize: 28,
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: -0.5,
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
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  subtitle: { fontSize: 15, lineHeight: 22, color: "#64748B", marginBottom: 28 },
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
  inputIconRight: { marginLeft: 10 },
  submitBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: DARK_BTN,
  },
  submitBtnText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.3 },
  btnPressed: { opacity: 0.92 },
  btnDisabled: { opacity: 0.6 },
  backToLoginBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  backToLoginText: { fontSize: 15, fontWeight: "600", color: PRIMARY },
  footer: { alignItems: "center" },
  footerLink: { fontSize: 14, fontWeight: "600", color: PRIMARY },
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: { color: "#EF4444", fontSize: 14, fontWeight: "500", flex: 1 },
});
