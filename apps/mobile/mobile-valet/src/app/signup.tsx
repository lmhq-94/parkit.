import { View, Text, StyleSheet, Pressable, StatusBar, TextInput, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLocaleStore, useAccessibilityStore, useAuthStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useMemo, useState, useRef, useEffect } from "react";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { AnimatedFormCard } from "@/components/AnimatedFormCard";
import { AnimatedBackButton } from "@/components/AnimatedBackButton";
import { useValetTheme, useResponsiveLayout } from "@/theme/valetTheme";
import { Logo } from "@parkit/shared";
import { signup, translateError } from "@/lib/auth";
import { IconMail, IconLock, IconUser, IconEye, IconEyeOff, IconClipboardText, IconCar } from "@/components/Icons";
import { AuthMessage } from "@/components/AuthMessage";

const LOGO_SIZE = 72;

const CONTROL_HEIGHT = 56;

export default function SignupScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const insets = useSafeAreaInsets();
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const { textScale } = useAccessibilityStore();
  const { setUser } = useAuthStore();
  const { auth: a } = theme;
  const F = theme.font;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staffRole, setStaffRole] = useState<"receptionist" | "driver">("receptionist");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          fontSize: Math.round(F.status * 0.65 * textScale),
          fontWeight: "600",
          color: a.text,
          marginBottom: 20,
          textAlign: "center",
        },
        btnPrimary: {
          backgroundColor: a.btnSignupBg,
          minHeight: CONTROL_HEIGHT,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        },
        btnPrimaryText: {
          fontSize: Math.round(F.status * 0.65 * textScale),
          fontWeight: "600",
          color: a.btnSignupText,
          letterSpacing: 0.5,
        },
        btnPressed: { opacity: 0.9 },
        roleSelection: {
          marginBottom: 20,
        },
        roleLabel: {
          fontSize: Math.round(F.status * 0.6 * textScale),
          fontWeight: "600",
          color: a.text,
          marginBottom: 12,
        },
        roleButtons: {
          flexDirection: 'row',
          backgroundColor: a.inputBg,
          borderRadius: 16,
          padding: 4,
          borderWidth: 2,
          borderColor: a.inputBorder,
        },
        roleButton: {
          flex: 1,
          height: CONTROL_HEIGHT - 8,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginHorizontal: 2,
        },
        roleButtonSelected: {
          backgroundColor: a.btnLoginBg,
          shadowColor: a.btnLoginBg,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 2,
        },
        roleButtonContent: {
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        },
        roleButtonText: {
          fontSize: Math.round(F.status * 0.52 * textScale),
          fontWeight: '700',
          color: a.textMuted,
          textAlign: 'center',
          letterSpacing: 0.3,
        },
        roleButtonTextSelected: {
          color: '#FFFFFF',
        },
        inputContainer: {
          position: 'relative',
          marginBottom: 16,
        },
        nameRow: {
          flexDirection: 'row',
        },
        nameInputContainer: {
          backgroundColor: a.inputBg,
          borderWidth: 1,
          borderColor: a.inputBorder,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          height: CONTROL_HEIGHT - 8,
          marginBottom: 16,
        },
        nameInputWrapper: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          gap: 8,
        },
        nameSeparator: {
          width: 1,
          height: '60%',
          backgroundColor: a.inputBorder,
          opacity: 0.5,
        },
        nameInput: {
          flex: 1,
          fontSize: Math.round(F.status * 0.6 * textScale),
          color: a.text,
          paddingVertical: 12,
          letterSpacing: 0.3,
        },
        input: {
          backgroundColor: a.inputBg,
          borderWidth: 1,
          borderColor: a.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingLeft: 48,
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
          fontSize: Math.round(F.status * 0.6 * textScale),
          fontWeight: "500",
          color: a.text,
          marginBottom: 6,
        },
        passwordToggle: {
          position: 'absolute',
          right: 16,
          top: '50%',
          marginTop: -12,
          padding: 4,
          zIndex: 1,
        },
        scrollView: {
          maxHeight: responsive.height * 0.5,
        },
      }),
    [a, responsive.formMaxWidth, responsive.horizontalPadding, F, responsive.height, textScale]
  );


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
              <Text style={styles.ctaText}>Únete a Nuestro Equipo de Valet</Text>
              
              <View style={styles.roleSelection}>
                <Text style={styles.roleLabel}>Función</Text>
                <View style={styles.roleButtons}>
                  <Pressable
                    style={[
                      styles.roleButton,
                      staffRole === 'receptionist' && styles.roleButtonSelected
                    ]}
                    onPress={() => setStaffRole('receptionist')}
                  >
                    <View style={styles.roleButtonContent}>
                      <IconClipboardText 
                        size={24} 
                        color={staffRole === 'receptionist' ? '#FFFFFF' : a.textMuted} 
                      />
                      <Text style={[
                        styles.roleButtonText,
                        staffRole === 'receptionist' && styles.roleButtonTextSelected
                      ]}>
                        Recepcionista
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.roleButton,
                      staffRole === 'driver' && styles.roleButtonSelected
                    ]}
                    onPress={() => setStaffRole('driver')}
                  >
                    <View style={styles.roleButtonContent}>
                      <IconCar 
                        size={24} 
                        color={staffRole === 'driver' ? '#FFFFFF' : a.textMuted} 
                      />
                      <Text style={[
                        styles.roleButtonText,
                        staffRole === 'driver' && styles.roleButtonTextSelected
                      ]}>
                        Conductor
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              <Text style={styles.inputLabel}>Nombre completo</Text>
                <View style={styles.nameInputContainer}>
                  <View style={styles.nameInputWrapper}>
                    <IconUser 
                      size={20} 
                      color={a.textMuted} 
                    />
                    <TextInput
                      style={styles.nameInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder={t(locale, "signup.placeholderFirstName")}
                      placeholderTextColor={a.textMuted}
                      autoCapitalize="words"
                      textContentType="givenName"
                      autoComplete="name-given"
                    />
                  </View>
                  <View style={styles.nameSeparator} />
                  <View style={styles.nameInputWrapper}>
                    <IconUser 
                      size={20} 
                      color={a.textMuted} 
                    />
                    <TextInput
                      style={styles.nameInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder={t(locale, "signup.placeholderLastName")}
                      placeholderTextColor={a.textMuted}
                      autoCapitalize="words"
                      textContentType="familyName"
                      autoComplete="name-family"
                    />
                  </View>
                </View>
                
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
                    textContentType="newPassword"
                    autoComplete="password-new"
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

              <Pressable
                onPress={async () => {
                  setError(null);
                  if (!firstName || !lastName || !email || !password) {
                    setError(t(locale, "auth.validation.requiredFields"));
                    return;
                  }
                  setIsLoading(true);
                  const result = await signup({
                    firstName,
                    lastName,
                    email,
                    password,
                    valetStaffRole: staffRole.toUpperCase() as 'RECEPTIONIST' | 'DRIVER',
                  });
                  setIsLoading(false);
                  if (result.success && result.user) {
                    setUser(result.user);
                    router.replace("/home");
                  } else {
                    setError(result.error ? translateError(result.error, locale, t) : t(locale, "auth.signup.failed"));
                  }
                }}
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={a.btnSignupText} />
                ) : (
                  <Text style={styles.btnPrimaryText}>Registrarse</Text>
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
