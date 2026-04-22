import { View, Text, StyleSheet, Pressable, StatusBar, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import { useLocaleStore, usePreferencesStore, useAuthStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { getAppVersionString } from "@parkit/shared";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { useColorScheme, useWindowDimensions } from "react-native";
import { useMemo, useState } from "react";
import {
  initializeGoogleSignIn,
  signInWithGoogle,
  signInWithFacebook,
  signInWithMicrosoft,
  type OAuthResponse,
} from "@/lib/oauth";
import { saveUser } from "@/lib/auth";
import { setAuthToken } from "@/lib/api";
import { getHasSeenOnboarding } from "@/lib/onboarding";
import { GoogleIcon, MicrosoftIcon, FacebookIcon } from "@/components/OAuthIcons";
import { IconCircleArrowLeft } from "@/components/TablerIcons";

const ACCENT = "#3B82F6";
const TEXT_MUTED = "#64748B";
const LOGO_SIZE = 72;
const CONTROL_HEIGHT = 56;

function useIsDark() {
  const systemScheme = useColorScheme();
  const preference = usePreferencesStore((s) => s.theme);
  return preference === "dark"
    ? true
    : preference === "light"
      ? false
      : systemScheme === "dark";
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((s) => s.locale);
  const { setUser, setError } = useAuthStore();
  const isDark = useIsDark();
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 600;
  const isLandscape = width > height;
  const horizontalPadding = isTablet ? 36 : 28;
  const sheetMaxWidth = width;
  const heroMinHeight = Math.round((isLandscape ? height * 0.24 : height * 0.32));

  // Initialize Google Sign-In on mount
  useState(() => {
    initializeGoogleSignIn();
  });

  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'microsoft') => {
    setOauthLoading(provider);
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
        setError(result.error || `${provider} sign-in failed`);
      }
    } catch (err: any) {
      const msg = err.message || `${provider} sign-in failed`;
      setError(msg);
    } finally {
      setOauthLoading(null);
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
          paddingHorizontal: Math.max(12, horizontalPadding - 12),
          paddingTop: 8,
          paddingBottom: 16,
          width: "100%",
          maxWidth: sheetMaxWidth,
          alignSelf: "center",
          backgroundColor: 'transparent',
        },
        hero: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          minHeight: heroMinHeight,
        },
        logoWrap: { alignItems: "center" },
        logo: { marginBottom: 0 },
        brandLabel: {
          marginTop: 28,
          fontSize: 15,
          fontWeight: "700",
          letterSpacing: 2,
          color: "#F8FAFC",
          textTransform: "lowercase",
        },
        bottomSection: {
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: horizontalPadding,
          paddingTop: 28,
          paddingBottom: 0,
          alignItems: "stretch",
          width: "100%",
          maxWidth: sheetMaxWidth,
          alignSelf: "center",
        },
        ctaText: {
          fontSize: 20,
          fontWeight: "600",
          color: "#0F172A",
          marginBottom: 20,
          textAlign: "center",
        },
        btnPrimary: {
          backgroundColor: ACCENT,
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
          fontSize: 16,
          fontWeight: "600",
          color: "#FFFFFF",
          letterSpacing: 0.5,
        },
        btnSecondary: {
          backgroundColor: "#0F172A",
          minHeight: CONTROL_HEIGHT,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 0,
        },
        btnSecondaryText: {
          fontSize: 16,
          fontWeight: "600",
          color: "#FFFFFF",
          letterSpacing: 0.5,
        },
        btnPressed: { opacity: 0.9 },
        versionLabel: {
          fontSize: 11,
          fontWeight: "500",
          color: "#94A3B8",
          textAlign: "center",
        },
        footer: {
          marginTop: 20,
          paddingTop: 8,
          alignItems: 'center',
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
          marginBottom: 24,
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
        googleIcon: { display: 'none' },
        googleCircle: { display: 'none' },
        microsoftIcon: { display: 'none' },
        microsoftSquare: { display: 'none' },
        facebookIcon: { display: 'none' },
      }),
    [heroMinHeight, horizontalPadding, sheetMaxWidth]
  );

  const versionLabel = t(locale, "welcome.version", {
    version: getAppVersionString() || "â",
  });

  return (
    <AnimatedAuthBackground isDark={isDark}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.rootColumn}>
        <View style={styles.heroStrip}>
          <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
            <View style={{ position: 'absolute', left: Math.max(12, horizontalPadding - 12), top: 32 }}>
              <Pressable
                onPress={() => router.replace("/welcome")}
                hitSlop={8}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: isDark ? "rgba(248, 250, 252, 0.12)" : "rgba(15, 23, 42, 0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCircleArrowLeft size={20} color={isDark ? "#F8FAFC" : "#0F172A"} />
              </Pressable>
            </View>
          </View>
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Logo size={LOGO_SIZE} style={styles.logo} variant="onDark" />
              <Text style={styles.brandLabel}>parkit</Text>
            </View>
          </View>
        </View>

        <View>
          <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Text style={styles.ctaText}>{t(locale, "login.cta")}</Text>
            <Pressable
              onPress={() => router.replace("/login-form")}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnPrimaryText}>{t(locale, "login.emailLogin")}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/signup")}
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnSecondaryText}>{t(locale, "login.signup")}</Text>
            </Pressable>

            {/* OAuth Divider */}
            <View style={styles.oauthDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth Buttons */}
            <View style={styles.oauthContainer}>
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
                  <GoogleIcon size={24} />
                )}
              </Pressable>

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
                  <MicrosoftIcon size={24} color="#0078D4" />
                )}
              </Pressable>

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
                  <FacebookIcon size={24} color="#1877F2" />
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.versionLabel} accessibilityRole="text">
                {versionLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </AnimatedAuthBackground>
  );
}
