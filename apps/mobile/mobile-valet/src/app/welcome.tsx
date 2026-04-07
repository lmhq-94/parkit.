import { View, Text, StyleSheet, Pressable, StatusBar, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Logo } from "@parkit/shared";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useMemo, useState } from "react";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { useValetTheme, ACCENT, useResponsiveLayout } from "@/theme/valetTheme";
import { getAppVersionString } from "@parkit/shared";
import { GoogleIcon, MicrosoftIcon, FacebookIcon } from "@/components/OAuthIcons";

const LOGO_SIZE = 72;
const CONTROL_HEIGHT = 56;

export function WelcomeContent({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  const locale = useLocaleStore((s) => s.locale);
  const insets = useSafeAreaInsets();
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const { auth: a } = theme;
  const F = theme.font;
  const [oauthLoading, _setOauthLoading] = useState<string | null>(null);
  const heroMinHeight = Math.round(
    (responsive.isLandscape ? responsive.height * 0.24 : responsive.height * 0.32)
  );

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
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          minHeight: heroMinHeight,
        },
        logoWrap: { alignItems: "center" },
        logo: { marginBottom: 0 },
        valetLabel: {
          marginTop: 28,
          fontSize: F.secondary,
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
          paddingHorizontal: responsive.horizontalPadding,
          paddingTop: 28,
          paddingBottom: 0,
          alignItems: "stretch",
          width: "100%",
          maxWidth: responsive.formMaxWidth,
          alignSelf: "center",
        },
        ctaText: {
          fontSize: F.hero,
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
          fontSize: F.button,
          fontWeight: "800",
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
          fontSize: F.button,
          fontWeight: "800",
          color: a.btnSignupText,
          letterSpacing: 0.5,
        },
        btnPressed: { opacity: 0.9 },
        versionLabel: {
          marginTop: 24,
          fontSize: Math.round(F.secondary * 0.7),
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
          fontSize: F.secondary,
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
        oauthButtonDisabled: {
          opacity: 0.6,
        },
      }),
    [a, heroMinHeight, responsive.formMaxWidth, responsive.horizontalPadding, F]
  );

  const versionLabel = t(locale, "welcome.version", {
    version: getAppVersionString() || "—",
  });

  return (
    <AnimatedAuthBackground isDark={theme.isDark}>
      <StatusBar barStyle={a.statusBarStyle} backgroundColor="transparent" />
      <View style={styles.rootColumn}>
        <View style={styles.heroStrip}>
          <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]} />
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Logo size={LOGO_SIZE} style={styles.logo} variant={theme.isDark ? "onDark" : "onLight"} />
              <Text style={styles.valetLabel}>valet</Text>
            </View>
          </View>
        </View>

        <View>
          <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Text style={styles.ctaText}>{t(locale, "welcome.cta")}</Text>
            <Pressable
              onPress={onLogin}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnPrimaryText}>{t(locale, "welcome.login")}</Text>
            </Pressable>
            <Pressable
              onPress={onSignup}
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnSecondaryText}>{t(locale, "welcome.signup")}</Text>
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
                onPress={() => {}}
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
                onPress={() => {}}
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
                onPress={() => {}}
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

            <Text style={styles.versionLabel} accessibilityRole="text">
              {versionLabel}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedAuthBackground>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <WelcomeContent
      onLogin={() => router.push("/login")}
      onSignup={() => router.push("/login?mode=signup")}
    />
  );
}
