import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@parkit/shared";
import api, { setAuthToken } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";

const SUPPORT_EMAIL = "mailto:soporte@parkit.app";
const SPLASH_BG = "#020617";
const PRIMARY = "#3B82F6";
const DARK_BTN = "#1E293B";
const BORDER_COLOR = "#E2E8F0";
const TEXT_PRIMARY = "#0F172A";
const TEXT_MUTED = "#64748B";
const LOGO_SIZE = 72;
const SUBTLE_TEXT = "rgba(148, 163, 184, 0.58)";
const WINDOW_HEIGHT = Dimensions.get("window").height;
const HERO_MIN_HEIGHT = Math.round(WINDOW_HEIGHT * 0.32);
const CONTROL_HEIGHT = 56;

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const params = useLocalSearchParams();
  const locale = useLocaleStore((s) => s.locale);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formTranslateY = useRef(new Animated.Value(22)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const raw = params?.mode;
    const next = raw === "signup" ? "signup" : "login";
    setMode(next);
  }, [params?.mode]);

  useEffect(() => {
    formTranslateY.setValue(22);
    formOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [formOpacity, formTranslateY, mode]);

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

  const handleSignup = async () => {
    setError(null);
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password
    ) {
      setError(t(locale, "common.errorFillFields"));
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/register-valet", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
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
      <StatusBar barStyle="light-content" backgroundColor={SPLASH_BG} />
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity onPress={() => router.replace("/welcome")} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={[styles.hero, mode === "signup" ? styles.heroCompact : styles.heroLogin]}>
        <Logo size={LOGO_SIZE} style={styles.heroLogo} darkBackground />
        <Text style={styles.heroBrand}>valet</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.bottomWrap}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
      >
        <Animated.View
          style={{
            transform: [{ translateY: formTranslateY }],
            opacity: formOpacity,
          }}
        >
          <SafeAreaView style={styles.bottomSection} edges={["bottom"]}>
            <View
            style={[
              styles.formContent,
              mode === "login" ? styles.formContentLogin : styles.formContentSignup,
            ]}
            >
            <Text style={styles.cardHeadline}>
              {mode === "login" ? t(locale, "login.headline") : t(locale, "signup.headline")}
            </Text>

            {mode === "signup" ? (
              <>
                <View style={styles.inputBlock}>
                  <Text style={styles.label}>{t(locale, "signup.firstName")}</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder={t(locale, "signup.placeholderFirstName")}
                      placeholderTextColor="#94A3B8"
                      value={firstName}
                      onChangeText={(v) => { setFirstName(v); setError(null); }}
                      editable={!loading}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.inputBlock}>
                  <Text style={styles.label}>{t(locale, "signup.lastName")}</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder={t(locale, "signup.placeholderLastName")}
                      placeholderTextColor="#94A3B8"
                      value={lastName}
                      onChangeText={(v) => { setLastName(v); setError(null); }}
                      editable={!loading}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </>
            ) : null}

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                {mode === "login" ? t(locale, "login.email") : t(locale, "signup.email")}
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder={
                    mode === "login"
                      ? t(locale, "login.placeholderEmail")
                      : t(locale, "signup.placeholderEmail")
                  }
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
              <Text style={styles.label}>
                {mode === "login" ? t(locale, "login.password") : t(locale, "signup.password")}
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={
                    mode === "login"
                      ? t(locale, "login.placeholderPassword")
                      : t(locale, "signup.placeholderPassword")
                  }
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
              {mode === "login" ? (
                <TouchableOpacity style={styles.forgotWrap} onPress={() => {}} hitSlop={8}>
                  <Text style={styles.forgot}>{t(locale, "login.forgetPassword")}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {mode === "signup" ? (
              <>
              </>
            ) : null}

            {error ? (
              <View style={styles.errorWrap}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={mode === "login" ? handleLogin : handleSignup}
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
                <Text style={styles.loginBtnText}>
                  {mode === "login" ? t(locale, "login.submit") : t(locale, "signup.submit")}
                </Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t(locale, "login.footer")}</Text>
              <Pressable onPress={() => Linking.openURL(SUPPORT_EMAIL)}>
                <Text style={styles.footerLink}>{t(locale, "login.contactSupport")}</Text>
              </Pressable>
            </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SPLASH_BG },
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    minHeight: HERO_MIN_HEIGHT,
  },
  heroLogin: {
    minHeight: Math.round(HERO_MIN_HEIGHT * 0.74),
  },
  heroCompact: {
    minHeight: Math.round(HERO_MIN_HEIGHT * 0.55),
    paddingVertical: 8,
  },
  heroLogo: { marginBottom: 0 },
  heroBrand: {
    marginTop: 28,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 4,
    color: SUBTLE_TEXT,
    textTransform: "lowercase",
  },
  bottomSection: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 14,
  },
  bottomWrap: { flex: 1, justifyContent: "flex-end" },
  formContent: {
    paddingBottom: 2,
  },
  formContentLogin: { justifyContent: "flex-start" },
  formContentSignup: {
    justifyContent: "flex-start",
  },
  cardHeadline: {
    fontSize: 20,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  inputBlock: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: CONTROL_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: "#FFFFFF",
    paddingLeft: 16,
    paddingRight: 14,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: TEXT_PRIMARY },
  passwordInput: { paddingRight: 10 },
  inputIconRight: { marginLeft: 10 },
  eyeWrap: { padding: 4, marginLeft: 6 },
  forgotWrap: { alignSelf: "flex-end", marginTop: 8 },
  forgot: { fontSize: 12, fontWeight: "600", color: PRIMARY },
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
  errorText: { color: "#EF4444", fontSize: 14, fontWeight: "500" },
  loginBtn: {
    minHeight: CONTROL_HEIGHT,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 8,
    backgroundColor: DARK_BTN,
  },
  loginBtnText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
  btnPressed: { opacity: 0.92 },
  btnDisabled: { opacity: 0.7 },
  footer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 2 },
  footerText: { fontSize: 12, color: TEXT_MUTED },
  footerLink: { fontSize: 13, fontWeight: "600", color: PRIMARY },
});
