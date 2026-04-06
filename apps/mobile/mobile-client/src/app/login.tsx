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
import { Redirect, useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import apiClient, { setAuthToken } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useAuthStore, useLocaleStore, usePreferencesStore } from "@/lib/store";
import { getHasSeenOnboarding } from "@/lib/onboarding";
import { t } from "@/lib/i18n";
import { getTranslatedApiErrorMessage } from "@/lib/apiErrors";
import { Ionicons } from "@expo/vector-icons";
import {
  initializeGoogleSignIn,
  signInWithGoogle,
  signInWithFacebook,
  signInWithMicrosoft,
  type OAuthResponse,
} from "@/lib/oauth";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { useColorScheme } from "react-native";

const PRIMARY = "#3B82F6";
const DARK_BTN = "#1E293B";
const BORDER_COLOR = "#E2E8F0";
const TEXT_PRIMARY = "#0F172A";
const TEXT_MUTED = "#64748B";

function useIsDark() {
  const systemScheme = useColorScheme();
  const preference = usePreferencesStore((s) => s.theme);
  return preference === "dark"
    ? true
    : preference === "light"
      ? false
      : systemScheme === "dark";
}

// OAuth configuration check
const isGoogleConfigured = () => !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const isFacebookConfigured = () => !!process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
const isMicrosoftConfigured = () => !!process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID;

export default function LoginScreen() {
  const router = useRouter();
  const { user, setUser, setError } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  const isDark = useIsDark();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setErrorState] = useState<string | null>(null);

  // Initialize Google Sign-In on mount
  useState(() => {
    initializeGoogleSignIn();
  });

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    setErrorState(null);
    setError(null);
    if (!email.trim() || !password) {
      setErrorState(t(locale, "common.errorFillFields"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post<{ data: { user: unknown; token: string } }>("/auth/login", {
        email: email.trim(),
        password,
      });

      if (response.data?.data) {
        const { user: userData, token } = response.data.data;
        await saveUser(userData as Parameters<typeof saveUser>[0], token);
        setAuthToken(token);
        setUser(userData as Parameters<typeof setUser>[0], token);
        const hasSeenOnboarding = await getHasSeenOnboarding();
        router.replace(hasSeenOnboarding ? "/(tabs)" : "/onboarding");
      }
    } catch (err) {
      const msg = getTranslatedApiErrorMessage(err, t, locale);
      setErrorState(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'microsoft') => {
    setOauthLoading(provider);
    setErrorState(null);
    setError(null);

    let result: OAuthResponse;

    try {
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'microsoft':
          result = await signInWithMicrosoft();
          break;
        default:
          result = { success: false, error: 'Unknown provider' };
      }

      if (result.success && result.user && result.token) {
        await saveUser(result.user as Parameters<typeof saveUser>[0], result.token);
        setAuthToken(result.token);
        setUser(result.user as Parameters<typeof setUser>[0], result.token);
        const hasSeenOnboarding = await getHasSeenOnboarding();
        router.replace(hasSeenOnboarding ? "/(tabs)" : "/onboarding");
      } else {
        setErrorState(result.error || `${provider} sign-in failed`);
        setError(result.error || `${provider} sign-in failed`);
      }
    } catch (err: any) {
      const msg = err.message || `${provider} sign-in failed`;
      setErrorState(msg);
      setError(msg);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <AnimatedAuthBackground isDark={isDark}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity
          onPress={() => router.replace("/welcome")}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.hero}>
        <Logo size={48} style={styles.heroLogo} darkBackground />
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
                  onChangeText={(v) => { setEmail(v); setErrorState(null); }}
                  keyboardType="email-address"
                  editable={!isLoading}
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
                  onChangeText={(v) => { setPassword(v); setErrorState(null); }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.eyeWrap}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotWrap} onPress={() => router.push("/forgot-password")} hitSlop={8}>
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
              disabled={isLoading}
              style={({ pressed }) => [
                styles.loginBtn,
                pressed && styles.btnPressed,
                isLoading && styles.btnDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>{t(locale, "login.submit")}</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t(locale, "login.newTo")}</Text>
              <Pressable onPress={() => router.replace("/signup")} hitSlop={8}>
                <Text style={styles.footerLink}>{t(locale, "login.signUp")}</Text>
              </Pressable>
            </View>

            {/* OAuth Divider */}
            <View style={styles.oauthDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth Buttons */}
            <View style={styles.oauthContainer}>
              {isGoogleConfigured() && (
                <Pressable
                  onPress={() => handleOAuthSignIn('google')}
                  disabled={oauthLoading !== null}
                  style={({ pressed }) => [
                    styles.oauthButton,
                    pressed && styles.oauthButtonPressed,
                    oauthLoading === 'google' && styles.oauthButtonDisabled,
                  ]}
                >
                  {oauthLoading === 'google' ? (
                    <ActivityIndicator size="small" color="#EA4335" />
                  ) : (
                    <View style={styles.googleIcon}>
                      <View style={[styles.googleCircle, { backgroundColor: '#EA4335' }]} />
                      <View style={[styles.googleCircle, { backgroundColor: '#FBBC05' }]} />
                      <View style={[styles.googleCircle, { backgroundColor: '#34A853' }]} />
                      <View style={[styles.googleCircle, { backgroundColor: '#4285F4' }]} />
                    </View>
                  )}
                </Pressable>
              )}

              {isMicrosoftConfigured() && (
                <Pressable
                  onPress={() => handleOAuthSignIn('microsoft')}
                  disabled={oauthLoading !== null}
                  style={({ pressed }) => [
                    styles.oauthButton,
                    pressed && styles.oauthButtonPressed,
                    oauthLoading === 'microsoft' && styles.oauthButtonDisabled,
                  ]}
                >
                  {oauthLoading === 'microsoft' ? (
                    <ActivityIndicator size="small" color="#0078D4" />
                  ) : (
                    <View style={styles.microsoftIcon}>
                      <View style={[styles.microsoftSquare, { backgroundColor: '#F25022' }]} />
                      <View style={[styles.microsoftSquare, { backgroundColor: '#7FBA00' }]} />
                      <View style={[styles.microsoftSquare, { backgroundColor: '#00A4EF' }]} />
                      <View style={[styles.microsoftSquare, { backgroundColor: '#FFB900' }]} />
                    </View>
                  )}
                </Pressable>
              )}

              {isFacebookConfigured() && (
                <Pressable
                  onPress={() => handleOAuthSignIn('facebook')}
                  disabled={oauthLoading !== null}
                  style={({ pressed }) => [
                    styles.oauthButton,
                    pressed && styles.oauthButtonPressed,
                    oauthLoading === 'facebook' && styles.oauthButtonDisabled,
                  ]}
                >
                  {oauthLoading === 'facebook' ? (
                    <ActivityIndicator size="small" color="#1877F2" />
                  ) : (
                    <Text style={styles.facebookIcon}>f</Text>
                  )}
                </Pressable>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedAuthBackground>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: Platform.OS === "android" ? "normal" : "700",
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
    marginBottom: 28,
    letterSpacing: -0.2,
  },
  inputBlock: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
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
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
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
  loginBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  btnPressed: { opacity: 0.92 },
  btnDisabled: { opacity: 0.7 },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  footerText: { fontSize: 14, color: TEXT_MUTED },
  footerLink: { fontSize: 14, fontWeight: "700", color: PRIMARY },

  // OAuth Styles
  oauthDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  oauthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  oauthButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oauthButtonPressed: {
    backgroundColor: '#F1F5F9',
  },
  oauthButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 24,
    height: 24,
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  microsoftIcon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 22,
    height: 22,
    gap: 2,
  },
  microsoftSquare: {
    width: 10,
    height: 10,
  },
  facebookIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1877F2',
  },
});
