import { View, Text, StyleSheet, Pressable, StatusBar, TextInput, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLocaleStore, useAccessibilityStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useMemo, useState, useRef, useEffect } from "react";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { AnimatedFormCard } from "@/components/AnimatedFormCard";
import { AnimatedBackButton } from "@/components/AnimatedBackButton";
import { useValetTheme, ACCENT, useResponsiveLayout } from "@/theme/valetTheme";
import { Logo, getAppVersionString } from "@parkit/shared";
import { forgotPassword } from "@/lib/auth";
import { GoogleIcon, MicrosoftIcon, FacebookIcon } from "@/components/OAuthIcons";
import { IconMail } from "@/components/TablerIcons";

const LOGO_SIZE = 72;

const CONTROL_HEIGHT = 56;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const insets = useSafeAreaInsets();
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const { textScale } = useAccessibilityStore();
  const { auth: a } = theme;
  const F = theme.font;
  const [oauthLoading, _setOauthLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  const heroMinHeight = Math.round(140 + LOGO_SIZE + 16);

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
          paddingBottom: 16,
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
          fontSize: Math.round(F.status * 0.65 * textScale),
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
          fontSize: Math.round(F.status * 0.65 * textScale),
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
          fontSize: Math.round(F.status * 0.65 * textScale),
          fontWeight: "600",
          color: a.btnSignupText,
          letterSpacing: 0.5,
        },
        btnPressed: { opacity: 0.9 },
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
          paddingVertical: 16,
          paddingLeft: 48,
          fontSize: Math.round(F.status * 0.65 * textScale),
          color: a.text,
          height: CONTROL_HEIGHT,
        },
        inputIcon: {
          position: 'absolute',
          left: 16,
          top: '50%',
          marginTop: -12,
          zIndex: 1,
        },
inputLabel: {
          fontSize: Math.round(F.status * 0.6 * textScale),
          fontWeight: "500",
          color: a.text,
          marginBottom: 6,
        },
        explanationText: {
          fontSize: Math.round(F.status * 0.6 * textScale),
          fontWeight: "400",
          color: a.textMuted,
          textAlign: "left",
          marginBottom: 20,
          lineHeight: Math.round(F.status * 0.9),
        },
        forgotPasswordLink: {
          textAlign: 'center',
          fontSize: Math.round(F.status * 0.6 * textScale),
          color: a.btnLoginBg,
          fontWeight: '600',
          marginTop: 16,
          marginBottom: 20,
        },
        versionLabel: {
          marginTop: 24,
          fontSize: Math.round(F.status * 0.65 * textScale),
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
          fontSize: Math.round(F.status * 0.65 * textScale),
          color: a.textMuted,
          fontWeight: '500',
        },
        errorText: {
          fontSize: Math.round(F.status * 0.55 * textScale),
          fontWeight: "500",
          color: "#EF4444",
          marginBottom: 20,
          textAlign: "center",
        },
        successText: {
          fontSize: Math.round(F.status * 0.55 * textScale),
          fontWeight: "500",
          color: "#10B981",
          marginBottom: 20,
          textAlign: "center",
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
        oauthButtonDisabled: {
          opacity: 0.6,
        },
      }),
    [a, responsive.formMaxWidth, responsive.horizontalPadding, F, textScale]
  );

  const versionLabel = t(locale, "welcome.version", {
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
            <Text style={styles.ctaText}>Recupera tu Acceso de Valet</Text>
            
            <Text style={styles.explanationText}>
              Ingresa tu correo electrónico y te enviaremos un enlace para que puedas restablecer tu contraseña.
            </Text>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            {success && (
              <Text style={styles.successText}>Se ha enviado un enlace de recuperación a tu correo.</Text>
            )}
            
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
            
            <Pressable
              onPress={async () => {
                setError(null);
                setSuccess(false);
                if (!email) {
                  setError(t(locale, "auth.validation.requiredFields"));
                  return;
                }
                setIsLoading(true);
                const result = await forgotPassword(email);
                setIsLoading(false);
                if (result.success) {
                  setSuccess(true);
                  setEmail("");
                } else {
                  setError(result.error || t(locale, "auth.forgotPassword.failed"));
                }
              }}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={a.btnLoginText} />
              ) : (
                <Text style={styles.btnPrimaryText}>Enviar Enlace de Recuperación</Text>
              )}
            </Pressable>
            
            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.forgotPasswordLink}>Volver al Inicio de Sesión</Text>
            </Pressable>

            </View>
          </AnimatedFormCard>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AnimatedAuthBackground>
  );
}
