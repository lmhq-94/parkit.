import { View, Text, StyleSheet, Pressable, StatusBar, ActivityIndicator, TextInput, KeyboardAvoidingView, ScrollView, Platform, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLocaleStore, useAccessibilityStore, useAuthStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useMemo, useState, useRef, useEffect } from "react";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { AnimatedFormCard } from "@/components/AnimatedFormCard";
import { AnimatedBackButton } from "@/components/AnimatedBackButton";
import { useValetTheme, ACCENT, useResponsiveLayout } from "@/theme/valetTheme";
import { Logo, getAppVersionString } from "@parkit/shared";
import { login, getStoredCredentials, translateError } from "@/lib/auth";
import { GoogleIcon as _GoogleIcon, MicrosoftIcon as _MicrosoftIcon, FacebookIcon as _FacebookIcon } from "@/components/OAuthIcons";
import { IconMail, IconLock, IconEye, IconEyeOff } from "@/components/Icons";
import { AuthMessage } from "@/components/AuthMessage";

const LOGO_SIZE = 72;

const CONTROL_HEIGHT = 56;

export default function LoginScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const insets = useSafeAreaInsets();
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const { textScale } = useAccessibilityStore();
  const { setUser } = useAuthStore();
  const { auth: a } = theme;
  const F = theme.font;
  const [_oauthLoading, _setOauthLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const formCardRef = useRef<(() => void) | null>(null);

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Load stored credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      const stored = await getStoredCredentials();
      if (stored) {
        setEmail(stored.email);
        setPassword(stored.password);
        setRememberMe(true);
      }
    };
    loadCredentials();
  }, []);

  const handleBackPress = () => {
    if (formCardRef.current) {
      formCardRef.current(); // Start exit animation
      setTimeout(() => {
        router.replace("/welcome");
      }, 450); // Wait for premium animation to complete
    } else {
      router.replace("/welcome");
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        rootColumn: { flex: 1 },
        heroStrip: {
          flex: 1,
        },
        topBar: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: Math.max(12, responsive.horizontalPadding - 12),
          paddingTop: 8,
          paddingBottom: 8,
          width: "100%",
          maxWidth: responsive.formMaxWidth,
          alignSelf: "center",
          backgroundColor: 'transparent',
        },
        hero: {
          position: 'absolute',
          top: 140,
          left: 0,
          right: 0,
          alignItems: 'center',
        },
        logoWrap: { alignItems: "center" },
        logo: { marginBottom: 0 },
        valetLabel: {
          marginTop: 0,
          fontSize: Math.round(F.secondary * textScale),
          fontWeight: "700",
          letterSpacing: 2,
          color: a.authHeroValetLabel,
          textTransform: "lowercase",
        },
        bottomSection: {
          backgroundColor: a.bottomSheet,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          ...a.authFormSheetSeparator,
          paddingHorizontal: responsive.horizontalPadding,
          paddingTop: 28,
          paddingBottom: 0,
          alignItems: "stretch",
          width: "100%",
          maxWidth: responsive.formMaxWidth,
          alignSelf: "center",
        },
        ctaText: {
          fontSize: Math.round(F.status * 0.6 * textScale),
          fontWeight: "600",
          color: a.text,
          marginBottom: 20,
          textAlign: "center",
        },
        btnPrimary: {
          backgroundColor: a.btnLoginBg,
          minHeight: CONTROL_HEIGHT,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          shadowColor: ACCENT,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 4,
        },
        btnPrimaryText: {
          fontSize: Math.round(F.status * 0.6 * textScale),
          fontWeight: "600",
          color: a.btnLoginText,
          letterSpacing: 0.5,
        },
        btnSecondary: {
          backgroundColor: a.btnSignupBg,
          minHeight: CONTROL_HEIGHT,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 0,
        },
        btnSecondaryText: {
          fontSize: Math.round(F.status * 0.6 * textScale),
          fontWeight: "600",
          color: a.btnSignupText,
          letterSpacing: 0.5,
        },
        btnPressed: { opacity: 0.9 },
        versionLabel: {
          marginTop: 24,
          fontSize: Math.round(F.status * 0.6 * textScale),
          fontWeight: "500",
          color: a.textMuted,
          textAlign: "center",
        },
        oauthDivider: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 20,
          paddingHorizontal: 10,
        },
        dividerLine: {
          flex: 1,
          height: 1,
          backgroundColor: a.inputBorder,
        },
        dividerText: {
          marginHorizontal: 10,
          fontSize: Math.round(F.status * 0.6 * textScale),
          color: a.textMuted,
          fontWeight: '500',
        },
        oauthContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 0,
        },
        oauthButton: {
          width: 50,
          height: 50,
          borderRadius: 12,
          backgroundColor: a.bottomSheet,
          borderWidth: 1,
          borderColor: a.inputBorder,
          alignItems: 'center',
          justifyContent: 'center',
        },
        oauthButtonPressed: {
          backgroundColor: a.inputBg,
        },
        inputContainer: {
          position: 'relative',
          marginBottom: 16,
        },
        input: {
          backgroundColor: a.inputBg,
          borderWidth: 1,
          borderColor: a.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingLeft: 48,
          paddingRight: 48,
          fontSize: Math.round(F.status * 0.6 * textScale),
          color: a.text,
          height: CONTROL_HEIGHT - 8,
        },
        inputIcon: {
          position: 'absolute',
          left: 16,
          top: '50%',
          marginTop: -10,
          zIndex: 1,
        },
inputLabel: {
          fontSize: Math.round(F.status * 0.6),
          fontWeight: "500",
          color: a.text,
          marginBottom: 6,
        },
        passwordToggle: {
          position: 'absolute',
          right: 16,
          top: '50%',
          marginTop: -10,
          padding: 4,
          zIndex: 1,
        },
        forgotPasswordLink: {
          fontSize: Math.round(F.status * 0.6 * textScale),
          color: a.btnLoginBg,
          fontWeight: '600',
        },
        formActions: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12,
          marginBottom: 28,
        },
        rememberMeContainer: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        checkbox: {
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: a.inputBorder,
          marginRight: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        checkboxChecked: {
          borderColor: a.btnLoginBg,
          backgroundColor: a.btnLoginBg,
        },
        checkboxInner: {
          width: 10,
          height: 10,
          borderRadius: 2,
          backgroundColor: '#FFFFFF',
        },
        rememberMeText: {
          fontSize: Math.round(F.status * 0.6 * textScale),
          color: a.text,
          fontWeight: '500',
        },
        oauthButtonDisabled: {
          opacity: 0.6,
        },
      }),
    [a, responsive.formMaxWidth, responsive.horizontalPadding, F, textScale]
  );

  const _versionLabel = t(locale, "welcome.version", {
    version: getAppVersionString() || "â",
  });

  return (
    <AnimatedAuthBackground isDark={theme.isDark}>
      <StatusBar barStyle={a.statusBarStyle} backgroundColor="transparent" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.rootColumn}>
            <View style={styles.heroStrip}>
          <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
            <View style={{ position: 'absolute', left: Math.max(12, responsive.horizontalPadding - 12), top: 56 }}>
              <AnimatedBackButton
                onPress={handleBackPress}
                accessibilityLabel={t(locale, "common.back")}
                appearance="auth"
              />
            </View>
          </View>
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              {!isKeyboardVisible && (
                <>
                  <Logo size={LOGO_SIZE} style={styles.logo} variant={theme.isDark ? "onDark" : "onLight"} />
                  <Text style={styles.valetLabel}>valet</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View>
          <AnimatedFormCard ref={formCardRef} isVisible={true} animationType="slide_from_bottom">
            <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <Text style={styles.ctaText}>Acceso para Personal de Valet</Text>
              
<Text style={styles.inputLabel}>Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <IconMail 
                  size={20} 
                  color={a.textMuted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t(locale, "auth.email.placeholder")}
                  placeholderTextColor={a.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  autoComplete="email"
                />
              </View>
              
<Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <IconLock 
                  size={20} 
                  color={a.textMuted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t(locale, "auth.password.placeholder")}
                  placeholderTextColor={a.textMuted}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoComplete="password"
                />
                <Pressable
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IconEyeOff size={20} color={a.textMuted} />
                  ) : (
                    <IconEye size={20} color={a.textMuted} />
                  )}
                </Pressable>
              </View>
              
              <View style={styles.formActions}>
                <Pressable
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <View style={styles.checkboxInner} />}
                  </View>
                  <Text style={styles.rememberMeText}>Recordarme</Text>
                </Pressable>
                
                <Pressable onPress={() => router.push("/forgot-password")}>
                  <Text style={styles.forgotPasswordLink}>¿Olvidaste tu contraseña?</Text>
                </Pressable>
              </View>
              
            <Pressable
              onPress={async () => {
                setError(null);
                if (!email || !password) {
                  setError(t(locale, "auth.validation.requiredFields"));
                  return;
                }
                setIsLoading(true);
                const result = await login({ email, password, rememberMe });
                setIsLoading(false);
                if (result.success && result.user) {
                  setUser(result.user);
                  router.replace("/home");
                } else {
                  setError(result.error ? translateError(result.error, locale, t) : t(locale, "auth.login.failed"));
                }
              }}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={a.btnLoginText} />
              ) : (
                <Text style={styles.btnPrimaryText}>Iniciar Sesión</Text>
              )}
            </Pressable>
            
            {error && (
              <AuthMessage type="error" message={error} />
            )}
                        </View>
          </AnimatedFormCard>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AnimatedAuthBackground>
  );
}
