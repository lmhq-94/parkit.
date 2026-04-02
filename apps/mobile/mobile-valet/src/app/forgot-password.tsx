import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  BackHandler,
  Animated,
  Easing,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import api from "@/lib/api";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { AuthHeroGradient } from "@/components/AuthHeroGradient";
import { useValetTheme, ACCENT } from "@/theme/valetTheme";
import { getTranslatedApiErrorMessage } from "@/lib/apiErrors";

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
          overflow: "hidden",
        },
        topBar: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: Math.max(12, horizontalPadding - 12),
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
          marginLeft: -2,
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
          justifyContent: "flex-end",
        },
        scrollContent: {
          flexGrow: 1,
          width: "100%",
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
        formContent: { paddingBottom: 0 },
        inputsScroll: {},
        inputsScrollContent: { paddingBottom: 12 },
        cardHeadline: {
          fontSize: 26,
          fontWeight: "700",
          color: a.text,
          marginBottom: 8,
          letterSpacing: -0.4,
        },
        subtitle: { fontSize: 15, lineHeight: 22, color: a.textMuted, marginBottom: 40 },
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
          marginTop: 8,
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
          marginTop: 10,
          paddingTop: 22,
          paddingBottom: 18,
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const heroTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
      Animated.timing(heroTranslateY, {
        toValue: -48,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(false);
      setKeyboardHeight(0);
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

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, [router]);

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
      setError(getTranslatedApiErrorMessage(err, t, locale));
    } finally {
      setLoading(false);
    }
  };

  const ph = a.placeholder;
  const keyboardInputsMaxHeight = Math.max(
    160,
    height - keyboardHeight - Math.max(insets.top, 12) - Math.round(height * (isTablet ? 0.30 : 0.36))
  );
  const inputsMaxHeight = keyboardVisible ? keyboardInputsMaxHeight : Math.round(height * 0.24);

  return (
    <AuthHeroGradient chromeBg={a.authScreenChromeBg}>
      <StatusBar barStyle={a.statusBarStyle} backgroundColor={a.statusBarBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.heroStrip}>
          <SafeAreaView style={styles.topBar} edges={["top"]}>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "android") {
                  router.back();
                  return;
                }
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

          <Animated.View
            style={[
              styles.hero,
              keyboardVisible ? { height: 0, opacity: 0, overflow: "hidden" } : null,
              { transform: [{ translateY: heroTranslateY }] },
            ]}
          >
            <Logo size={LOGO_SIZE} style={styles.heroLogo} variant="onDark" />
            <Text style={styles.heroBrand}>valet</Text>
          </Animated.View>
        </View>

        <View
          style={[
            styles.bottomWrap,
            keyboardVisible ? { marginTop: 0, paddingTop: Math.max(insets.top, 12) } : null,
          ]}
        >
          <View
            style={[
              styles.bottomSection,
              keyboardVisible ? { paddingTop: 16 } : null,
              {
                paddingBottom: keyboardVisible ? 0 : submitted ? Math.max(insets.bottom, 14) : 14,
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
              <ScrollView
                style={[styles.inputsScroll, { maxHeight: inputsMaxHeight }]}
                contentContainerStyle={styles.inputsScrollContent}
                scrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
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

              </ScrollView>
            )}

            {!submitted ? (
              <Pressable
                onPress={handleSubmit}
                disabled={loading || !email.trim()}
                style={({ pressed }) => [
                  styles.submitBtn,
                  keyboardVisible ? { marginTop: 12, marginBottom: 0 } : null,
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

            {!submitted ? (
              <TouchableOpacity
                onPress={() => router.replace("/login")}
                hitSlop={8}
                style={[styles.footerLinkWrap, { marginTop: 12, marginBottom: 12 }]}
              >
                <Text style={styles.footerLink}>{t(locale, "forgot.backToLogin")}</Text>
              </TouchableOpacity>
            ) : null}

            <View
              style={[
                styles.footer,
                keyboardVisible ? { marginBottom: 0, paddingBottom: 16 } : null,
              ]}
            >
              <Text style={styles.footerText}>{t(locale, "login.footer")}</Text>
              <Pressable onPress={() => Linking.openURL(SUPPORT_EMAIL)}>
                <Text style={styles.footerLinkMuted}>{t(locale, "login.contactSupport")}</Text>
              </Pressable>
            </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthHeroGradient>
  );
}
