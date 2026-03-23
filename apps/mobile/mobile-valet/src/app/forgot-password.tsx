import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  Animated,
  Easing,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import api from "@/lib/api";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { AuthHeroGradient } from "@/components/AuthHeroGradient";
import { StickyFormFooter } from "@/components/StickyFormFooter";
import { useValetTheme, ACCENT } from "@/theme/valetTheme";

const SUPPORT_EMAIL = "mailto:soporte@parkit.app";
const LOGO_SIZE = 72;
const CONTROL_HEIGHT = 56;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const { width, height } = useWindowDimensions();
  const a = theme.auth;
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 600;
  const isLandscape = width > height;
  const horizontalPadding = isTablet ? 36 : 28;
  const sheetMaxWidth = isTablet ? 640 : 560;
  const heroMin = Math.round((isLandscape ? height * 0.2 : height * 0.22));

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
          minHeight: heroMin,
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
        scrollTopSpacer: { flexGrow: 1, minHeight: 1 },
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
        formContent: { paddingBottom: 0 },
        cardHeadline: {
          fontSize: 26,
          fontWeight: "700",
          color: a.text,
          marginBottom: 8,
          letterSpacing: -0.4,
        },
        subtitle: { fontSize: 15, lineHeight: 22, color: a.textMuted, marginBottom: 18 },
        inputBlock: { marginBottom: 14 },
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
        inputIconRight: { marginLeft: 10 },
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
        errorText: { color: a.errorText, fontSize: 14, fontWeight: "500", flex: 1 },
        submitBtn: {
          minHeight: CONTROL_HEIGHT,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 4,
          marginBottom: 6,
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
        submitBtnText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
        btnPressed: { opacity: 0.92 },
        btnDisabled: { opacity: 0.6 },
        backToLoginBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 8 },
        backToLoginText: { fontSize: 15, fontWeight: "600", color: a.linkAccent },
        footerLinkWrap: { alignItems: "center", marginBottom: 4 },
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
        footerLink: { fontSize: 14, fontWeight: "600", color: a.linkAccent },
        footerLinkMuted: { fontSize: 13, fontWeight: "600", color: a.linkAccent },
      }),
    [a, heroMin, horizontalPadding, sheetMaxWidth]
  );

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const heroTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      Animated.timing(heroTranslateY, {
        toValue: -48,
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

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError(t(locale, "common.errorFillFields"));
      return;
    }
    setLoading(true);
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
                  router.back();
                });
              }}
              style={styles.backBtn}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={24} color={a.authHeroBackBtnIcon} />
            </TouchableOpacity>
          </SafeAreaView>

          <Animated.View style={[styles.hero, { transform: [{ translateY: heroTranslateY }] }]}>
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
          <View
            style={[
              styles.bottomSection,
              {
                paddingBottom: submitted ? Math.max(insets.bottom, 14) : 14,
                width: "100%",
              },
            ]}
          >
            <View style={styles.formContent}>
            <Text style={styles.cardHeadline}>{t(locale, "forgot.headline")}</Text>
            <Text style={styles.subtitle}>
              {submitted ? t(locale, "forgot.sent", { email }) : t(locale, "forgot.description")}
            </Text>

            {submitted ? (
              <TouchableOpacity
                onPress={() => router.replace("/login")}
                style={styles.backToLoginBtn}
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={20} color={a.linkAccent} />
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
                      placeholderTextColor={ph}
                      value={email}
                      onChangeText={(v) => {
                        setEmail(v);
                        setError(null);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!loading}
                    />
                    <Ionicons name="mail-outline" size={20} color={ph} style={styles.inputIconRight} />
                  </View>
                </View>

                {error ? (
                  <View style={styles.errorWrap}>
                    <Ionicons name="alert-circle" size={18} color={a.errorText} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity onPress={() => router.replace("/login")} hitSlop={8} style={styles.footerLinkWrap}>
                  <Text style={styles.footerLink}>{t(locale, "forgot.backToLogin")}</Text>
                </TouchableOpacity>
              </>
            )}

            {!submitted && !keyboardVisible ? (
              <Pressable
                onPress={handleSubmit}
                disabled={loading || !email.trim()}
                style={({ pressed }) => [
                  styles.submitBtn,
                  { marginTop: 0, marginBottom: 0 },
                  pressed && styles.btnPressed,
                  (loading || !email.trim()) && styles.btnDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t(locale, "forgot.sendLink")}</Text>
                )}
              </Pressable>
            ) : null}

            {!keyboardVisible ? (
              <View style={styles.footer}>
                <Text style={styles.footerText}>{t(locale, "login.footer")}</Text>
                <Pressable onPress={() => Linking.openURL(SUPPORT_EMAIL)}>
                  <Text style={styles.footerLinkMuted}>{t(locale, "login.contactSupport")}</Text>
                </Pressable>
              </View>
            ) : null}
            </View>
          </View>
          </ScrollView>
        </View>
        {!submitted && keyboardVisible ? (
          <StickyFormFooter
            backgroundColor={a.bottomSheet}
            borderColor="transparent"
            paddingHorizontal={horizontalPadding}
          >
            <Pressable
              onPress={handleSubmit}
              disabled={loading || !email.trim()}
              style={({ pressed }) => [
                styles.submitBtn,
                { marginTop: 0, marginBottom: 0 },
                pressed && styles.btnPressed,
                (loading || !email.trim()) && styles.btnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>{t(locale, "forgot.sendLink")}</Text>
              )}
            </Pressable>
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t(locale, "login.footer")}</Text>
              <Pressable onPress={() => Linking.openURL(SUPPORT_EMAIL)}>
                <Text style={styles.footerLinkMuted}>{t(locale, "login.contactSupport")}</Text>
              </Pressable>
            </View>
          </StickyFormFooter>
        ) : null}
      </KeyboardAvoidingView>
    </AuthHeroGradient>
  );
}
