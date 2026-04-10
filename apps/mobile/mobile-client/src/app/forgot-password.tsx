import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  BackHandler,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@parkit/shared";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import api from "@/lib/api";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { useIsDark } from "@/lib/useIsDark";

const PRIMARY = "#3B82F6";
const DARK_BTN = "#1E293B";
const BORDER_COLOR = "#E2E8F0";
const TEXT_PRIMARY = "#0F172A";
const TEXT_MUTED = "#64748B";
const LOGO_SIZE = 72;
const CONTROL_HEIGHT = 56;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((s) => s.locale);
  const isDark = useIsDark();
  const { width, height } = useWindowDimensions();
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 600;
  const isLandscape = width > height;
  const horizontalPadding = isTablet ? 36 : 28;
  const sheetMaxWidth = width;
  const heroMinHeight = Math.round((isLandscape ? height * 0.24 : height * 0.32));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        heroStrip: {
          flex: 1,
          backgroundColor: 'transparent',
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
          backgroundColor: 'transparent',
        },
        backBtn: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: isDark ? "rgba(248, 250, 252, 0.12)" : "rgba(15, 23, 42, 0.12)",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: -2,
        },
        hero: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          minHeight: heroMinHeight,
          backgroundColor: 'transparent',
        },
        heroForgot: {
          minHeight: Math.round(heroMinHeight * 0.74),
        },
        heroLogo: { marginBottom: 0 },
        heroBrand: {
          marginTop: 28,
          fontSize: 15,
          fontWeight: "600",
          letterSpacing: 4,
          color: "#F8FAFC",
          textTransform: "lowercase",
        },
        bottomSection: {
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
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
          justifyContent: "flex-end",
        },
        formContent: {
          paddingBottom: 0,
        },
        inputsScroll: {},
        inputsScrollContent: {
          paddingBottom: 12,
        },
        cardHeadline: {
          fontSize: 26,
          fontWeight: "700",
          color: TEXT_PRIMARY,
          marginBottom: 4,
          letterSpacing: -0.4,
        },
        cardTagline: {
          fontSize: 15,
          lineHeight: 21,
          fontWeight: "500",
          color: TEXT_MUTED,
          marginBottom: 40,
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
        inputIconRight: { marginLeft: 10 },
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
        submitBtn: {
          minHeight: CONTROL_HEIGHT,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 8,
          marginBottom: 4,
          backgroundColor: DARK_BTN,
          ...Platform.select({
            ios: {
              shadowColor: PRIMARY,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
            },
            android: { elevation: 4 },
          }),
        },
        submitBtnText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
        btnPressed: { opacity: 0.92 },
        btnDisabled: { opacity: 0.7 },
        successWrap: {
          alignItems: "center",
          paddingVertical: 40,
        },
        successText: {
          fontSize: 16,
          fontWeight: "600",
          color: TEXT_PRIMARY,
          textAlign: "center",
          marginBottom: 24,
        },
        backToLoginBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        backToLoginText: { fontSize: 15, fontWeight: "600", color: PRIMARY },
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
        footerLink: { fontSize: 13, fontWeight: "600", color: PRIMARY },
      }),
    [heroMinHeight, horizontalPadding, sheetMaxWidth, isDark]
  );

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const heroTranslateY = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(22)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

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
  }, [formOpacity, formTranslateY]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
      Animated.timing(heroTranslateY, {
        toValue: -56,
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
      router.replace("/login");
      return true;
    });
    return () => sub.remove();
  }, [router]);

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

  const ph = "#94A3B8";
  const keyboardInputsMaxHeight = Math.max(
    160,
    height - keyboardHeight - Math.max(insets.top, 12) - Math.round(height * (isTablet ? 0.30 : 0.36))
  );
  const inputsMaxHeight = keyboardVisible
    ? keyboardInputsMaxHeight
    : Math.round(height * 0.30);

  return (
    <AnimatedAuthBackground isDark={isDark}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" />
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'transparent' }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Keyboard background color matching form */}
        {keyboardVisible && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: keyboardHeight,
              backgroundColor: "#FFFFFF",
              zIndex: 0,
            }}
          />
        )}
        <View style={styles.heroStrip}>
          <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "android") {
                  router.replace("/login");
                  return;
                }
                Keyboard.dismiss();
                requestAnimationFrame(() => {
                  router.replace("/login");
                });
              }}
              style={styles.backBtn}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={24} color={isDark ? "#F8FAFC" : "#0F172A"} />
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.hero,
              styles.heroForgot,
              keyboardVisible ? { height: 0, opacity: 0, overflow: "hidden" } : null,
              { transform: [{ translateY: heroTranslateY }] },
            ]}
          >
            <Logo size={LOGO_SIZE} style={styles.heroLogo} darkBackground />
            <Text style={styles.heroBrand}>parkit</Text>
          </Animated.View>
        </View>

        <View
          style={[
            styles.bottomWrap,
            keyboardVisible ? { marginTop: 0, paddingTop: Math.max(insets.top, 12) } : null,
          ]}
        >
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
                keyboardVisible ? { paddingTop: 16 } : null,
                { paddingBottom: keyboardVisible ? 0 : 14 },
              ]}
            >
              <View style={styles.formContent}>
                <Text style={styles.cardHeadline}>{t(locale, "forgot.headline")}</Text>
                <Text style={styles.cardTagline}>
                  {submitted
                    ? t(locale, "forgot.sent", { email })
                    : t(locale, "forgot.description")}
                </Text>

                {submitted ? (
                  <View style={styles.successWrap}>
                    <TouchableOpacity
                      onPress={() => router.replace("/login")}
                      style={styles.backToLoginBtn}
                      hitSlop={8}
                    >
                      <Ionicons name="arrow-back" size={20} color={PRIMARY} />
                      <Text style={styles.backToLoginText}>{t(locale, "forgot.backToLogin")}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <ScrollView
                      style={[styles.inputsScroll, { maxHeight: inputsMaxHeight }]}
                      contentContainerStyle={styles.inputsScrollContent}
                      scrollEnabled
                      keyboardShouldPersistTaps="always"
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
                          />
                          <Ionicons name="mail-outline" size={20} color={ph} style={styles.inputIconRight} />
                        </View>
                      </View>

                      {error ? (
                        <View style={styles.errorWrap}>
                          <Ionicons name="alert-circle" size={18} color="#EF4444" />
                          <Text style={styles.errorText}>{error}</Text>
                        </View>
                      ) : null}
                    </ScrollView>

                    <Pressable
                      onPress={handleSubmit}
                      disabled={isLoading || !email.trim()}
                      style={({ pressed }) => [
                        styles.submitBtn,
                        keyboardVisible ? { marginTop: 10 } : null,
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

                    <View
                      style={[
                        styles.footer,
                        keyboardVisible ? { marginBottom: 0, paddingBottom: 16 } : null,
                      ]}
                    >
                      <TouchableOpacity onPress={() => router.replace("/login")} hitSlop={8}>
                        <Text style={styles.footerLink}>{t(locale, "forgot.backToLogin")}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </AnimatedAuthBackground>
  );
}
