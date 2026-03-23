import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Animated,
  Easing,
  Modal,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@parkit/shared";
import api, { setAuthToken } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { AuthHeroGradient } from "@/components/AuthHeroGradient";
import { StickyFormFooter } from "@/components/StickyFormFooter";
import { useValetTheme, ACCENT } from "@/theme/valetTheme";

const SUPPORT_EMAIL = "mailto:soporte@parkit.app";
const LOGO_SIZE = 72;
const CONTROL_HEIGHT = 56;

const STAFF_ROLES = ["RECEPTIONIST", "DRIVER"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUser } = useAuthStore();
  const params = useLocalSearchParams();
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const { width, height } = useWindowDimensions();
  const a = theme.auth;
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 600;
  const isLandscape = width > height;
  const horizontalPadding = isTablet ? 36 : 28;
  const sheetMaxWidth = isTablet ? 640 : 560;
  const heroMinHeight = Math.round((isLandscape ? height * 0.24 : height * 0.32));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        heroStrip: {
          backgroundColor: a.authHeroStripBg,
          zIndex: 0,
        },
        topBar: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: horizontalPadding,
          paddingTop: 8,
          paddingBottom: 16,
          width: "100%",
          maxWidth: sheetMaxWidth,
          alignSelf: "center",
        },
        backBtn: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: a.authHeroBackBtnBg,
          alignItems: "center",
          justifyContent: "center",
        },
        hero: {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
          minHeight: heroMinHeight,
        },
        heroLogin: {
          minHeight: Math.round(heroMinHeight * 0.74),
        },
        heroCompact: {
          minHeight: Math.round(heroMinHeight * 0.55),
          paddingVertical: 8,
        },
        heroLogo: { marginBottom: 0 },
        heroBrand: {
          marginTop: 28,
          fontSize: 15,
          fontWeight: "600",
          letterSpacing: 4,
          color: a.authHeroValetLabel,
          textTransform: "lowercase",
        },
        bottomSection: {
          backgroundColor: a.bottomSheet,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          ...a.authFormSheetSeparator,
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 0,
          width: "100%",
          maxWidth: sheetMaxWidth,
          alignSelf: "center",
        },
        bottomWrap: {
          flex: 1,
          backgroundColor: "transparent",
          marginTop: -28,
          zIndex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          width: "100%",
        },
        /** Relleno superior para mantener la hoja abajo cuando hay espacio; permite scroll real al abrir el teclado. */
        scrollTopSpacer: { flexGrow: 1, minHeight: 1 },
        formContent: {
          paddingBottom: 0,
        },
        formContentLogin: { justifyContent: "flex-start" },
        formContentSignup: {
          justifyContent: "flex-start",
        },
        cardHeadline: {
          fontSize: 26,
          fontWeight: "700",
          color: a.text,
          marginBottom: 4,
          letterSpacing: -0.4,
        },
        cardTagline: {
          fontSize: 15,
          lineHeight: 21,
          fontWeight: "500",
          color: a.textMuted,
          marginBottom: 20,
        },
        inputBlock: { marginBottom: 12 },
        label: { fontSize: 13, fontWeight: "600", color: a.textSecondary, marginBottom: 6 },
        inputRow: {
          flexDirection: "row",
          alignItems: "center",
          minHeight: CONTROL_HEIGHT,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: a.inputBorder,
          backgroundColor: a.inputBg,
          paddingLeft: 16,
          paddingRight: 14,
        },
        input: { flex: 1, paddingVertical: 12, fontSize: 15, color: a.text },
        passwordInput: { paddingRight: 10 },
        inputIconRight: { marginLeft: 10 },
        eyeWrap: { padding: 4, marginLeft: 6 },
        forgotWrap: { alignSelf: "flex-end", marginTop: 8, marginBottom: 20 },
        forgot: { fontSize: 12, fontWeight: "600", color: a.linkAccent },
        errorWrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: a.errorBg,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 12,
          marginBottom: 12,
        },
        errorText: { color: a.errorText, fontSize: 14, fontWeight: "500" },
        loginBtn: {
          minHeight: CONTROL_HEIGHT,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
          marginBottom: 4,
        },
        loginBtnLogin: {
          backgroundColor: a.btnLoginBg,
          ...Platform.select({
            ios: {
              shadowColor: ACCENT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
            },
            android: { elevation: 4 },
          }),
        },
        loginBtnSignup: {
          backgroundColor: a.btnSignupBg,
          ...Platform.select({
            ios: {
              shadowColor: "transparent",
              shadowOpacity: 0,
              shadowRadius: 0,
              shadowOffset: { width: 0, height: 0 },
            },
            android: { elevation: 0 },
          }),
        },
        loginBtnText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
        btnPressed: { opacity: 0.92 },
        btnDisabled: { opacity: 0.7 },
        footer: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          marginTop: 0,
          paddingTop: 14,
        },
        footerText: { fontSize: 12, color: a.textMuted },
        footerLink: { fontSize: 13, fontWeight: "600", color: a.linkAccent },
        modalBackdrop: {
          flex: 1,
          backgroundColor: a.modalBackdrop,
          justifyContent: "flex-end",
          paddingHorizontal: 20,
          paddingBottom: 28,
        },
        modalSheet: {
          backgroundColor: a.modalSheet,
          borderRadius: 20,
          paddingVertical: 12,
          paddingHorizontal: 8,
          maxHeight: "50%",
        },
        modalTitle: {
          fontSize: 16,
          fontWeight: "700",
          color: a.text,
          paddingHorizontal: 16,
          paddingVertical: 10,
        },
        modalOption: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderRadius: 12,
        },
        modalOptionActive: { backgroundColor: a.modalOptionActive },
        modalOptionText: { fontSize: 16, color: a.text, fontWeight: "500" },
        modalOptionTextActive: { fontWeight: "700", color: a.linkAccent },
        modalCloseBtn: {
          marginTop: 4,
          paddingVertical: 14,
          alignItems: "center",
        },
        modalCloseBtnText: { fontSize: 15, fontWeight: "600", color: a.textMuted },
      }),
    [a, heroMinHeight, horizontalPadding, sheetMaxWidth]
  );

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>("RECEPTIONIST");
  const [staffRolePickerOpen, setStaffRolePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const heroTranslateY = useRef(new Animated.Value(0)).current;
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

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      Animated.timing(heroTranslateY, {
        toValue: -56,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      Animated.timing(heroTranslateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [heroTranslateY]);


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
      router.replace("/home");
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
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
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
        staffRole,
      });
      const { token, user } = response.data.data;
      await setAuthToken(token);
      await saveUser(user);
      setUser(user);
      router.replace("/home");
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

  const ph = a.placeholder;

  return (
    <AuthHeroGradient chromeBg={a.authScreenChromeBg}>
      <StatusBar barStyle={a.statusBarStyle} backgroundColor={a.statusBarBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.heroStrip}>
          <SafeAreaView style={styles.topBar} edges={["top"]}>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                requestAnimationFrame(() => {
                  router.replace("/welcome");
                });
              }}
              style={styles.backBtn}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={24} color={a.authHeroBackBtnIcon} />
            </TouchableOpacity>
          </SafeAreaView>

          <Animated.View
            style={[
              styles.hero,
              mode === "signup" ? styles.heroCompact : styles.heroLogin,
              { transform: [{ translateY: heroTranslateY }] },
            ]}
          >
            <Logo size={LOGO_SIZE} style={styles.heroLogo} variant="onDark" />
            <Text style={styles.heroBrand}>valet</Text>
          </Animated.View>
        </View>

        <View style={styles.bottomWrap}>
          <ScrollView
            style={{ flex: 1, backgroundColor: "transparent" }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
          <View style={styles.scrollTopSpacer} />
          <Animated.View
            style={{
              transform: [{ translateY: formTranslateY }],
              opacity: formOpacity,
              width: "100%",
            }}
          >
            <View
              style={[
                styles.bottomSection,
                { paddingBottom: 14 },
              ]}
            >
              <View
                style={[
                  styles.formContent,
                  mode === "login" ? styles.formContentLogin : styles.formContentSignup,
                ]}
              >
              <Text style={styles.cardHeadline}>
                {mode === "login" ? t(locale, "login.headline") : t(locale, "signup.headline")}
              </Text>
              <Text style={styles.cardTagline}>
                {mode === "login" ? t(locale, "login.tagline") : t(locale, "signup.tagline")}
              </Text>

              {mode === "signup" ? (
                <>
                  <View style={styles.inputBlock}>
                    <Text style={styles.label}>{t(locale, "signup.firstName")}</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={styles.input}
                        placeholder={t(locale, "signup.placeholderFirstName")}
                        placeholderTextColor={ph}
                        value={firstName}
                        onChangeText={(v) => {
                          setFirstName(v);
                          setError(null);
                        }}
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
                        placeholderTextColor={ph}
                        value={lastName}
                        onChangeText={(v) => {
                          setLastName(v);
                          setError(null);
                        }}
                        editable={!loading}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <View style={styles.inputBlock}>
                    <Text style={styles.label}>{t(locale, "signup.staffRoleLabel")}</Text>
                    <TouchableOpacity
                      style={styles.inputRow}
                      onPress={() => {
                        if (!loading) setStaffRolePickerOpen(true);
                      }}
                      activeOpacity={0.85}
                      disabled={loading}
                    >
                      <Text style={styles.input}>
                        {staffRole === "RECEPTIONIST"
                          ? t(locale, "signup.staffRoleReceptionist")
                          : t(locale, "signup.staffRoleDriver")}
                      </Text>
                      <Ionicons name="chevron-down" size={22} color={ph} style={styles.inputIconRight} />
                    </TouchableOpacity>
                    <Modal
                      visible={staffRolePickerOpen}
                      transparent
                      animationType="fade"
                      onRequestClose={() => setStaffRolePickerOpen(false)}
                    >
                      <Pressable style={styles.modalBackdrop} onPress={() => setStaffRolePickerOpen(false)}>
                        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
                          <Text style={styles.modalTitle}>{t(locale, "signup.staffRoleLabel")}</Text>
                          {STAFF_ROLES.map((r) => (
                            <TouchableOpacity
                              key={r}
                              style={[styles.modalOption, staffRole === r && styles.modalOptionActive]}
                              onPress={() => {
                                setStaffRole(r);
                                setStaffRolePickerOpen(false);
                                setError(null);
                              }}
                            >
                              <Text
                                style={[
                                  styles.modalOptionText,
                                  staffRole === r && styles.modalOptionTextActive,
                                ]}
                              >
                                {r === "RECEPTIONIST"
                                  ? t(locale, "signup.staffRoleReceptionist")
                                  : t(locale, "signup.staffRoleDriver")}
                              </Text>
                              {staffRole === r ? (
                                <Ionicons name="checkmark-circle" size={22} color={a.linkAccent} />
                              ) : null}
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setStaffRolePickerOpen(false)}
                          >
                            <Text style={styles.modalCloseBtnText}>{t(locale, "common.cancel")}</Text>
                          </TouchableOpacity>
                        </Pressable>
                      </Pressable>
                    </Modal>
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
                    placeholderTextColor={ph}
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      setError(null);
                    }}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                  <Ionicons name="mail-outline" size={20} color={ph} style={styles.inputIconRight} />
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
                    placeholderTextColor={ph}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      setError(null);
                    }}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    autoComplete="password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.eyeWrap}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={ph} />
                  </TouchableOpacity>
                </View>
                {mode === "login" ? (
                  <TouchableOpacity
                    style={styles.forgotWrap}
                    onPress={() => router.push("/forgot-password")}
                    hitSlop={8}
                  >
                    <Text style={styles.forgot}>{t(locale, "login.forgetPassword")}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {error ? (
                <View style={styles.errorWrap}>
                  <Ionicons name="alert-circle" size={18} color={a.errorText} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {!keyboardVisible ? (
                <Pressable
                  onPress={mode === "login" ? handleLogin : handleSignup}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.loginBtn,
                    mode === "login" ? styles.loginBtnLogin : styles.loginBtnSignup,
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
              ) : null}

              {!keyboardVisible ? (
                <View style={styles.footer}>
                  <Text style={styles.footerText}>{t(locale, "login.footer")}</Text>
                  <Pressable onPress={() => Linking.openURL(SUPPORT_EMAIL)}>
                    <Text style={styles.footerLink}>{t(locale, "login.contactSupport")}</Text>
                  </Pressable>
                </View>
              ) : null}
              </View>
            </View>
          </Animated.View>
          </ScrollView>
        </View>
        {keyboardVisible ? (
          <StickyFormFooter
            backgroundColor={a.bottomSheet}
            borderColor="transparent"
            paddingHorizontal={horizontalPadding}
          >
            <Pressable
              onPress={mode === "login" ? handleLogin : handleSignup}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginBtn,
                { marginTop: 0, marginBottom: 0 },
                mode === "login" ? styles.loginBtnLogin : styles.loginBtnSignup,
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
          </StickyFormFooter>
        ) : null}
      </KeyboardAvoidingView>
    </AuthHeroGradient>
  );
}
