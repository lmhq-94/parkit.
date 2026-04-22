import { useEffect, useRef, useState, useMemo } from "react";
import { View, StyleSheet, Animated, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore, useAccessibilityStore } from "@/lib/store";
import { WelcomeContent } from "./welcome";
import { AnimatedAuthBackground } from "@/components/AnimatedAuthBackground";
import { useIsDark } from "@/lib/useIsDark";
import { useValetTheme } from "@/theme/valetTheme";
import { Logo } from "@parkit/shared";

const SPLASH_DURATION_MS = 2600;
const LOGO_SIZE = 72;

export default function Index() {
  const isDark = useIsDark();
  const theme = useValetTheme();
  const F = theme.font;
  const Fonts = theme.fontFamily;
  const { textScale } = useAccessibilityStore();
  const styles = useMemo(() => createStyles(F, Fonts, theme, textScale), [F, Fonts, theme, textScale]);
  
  const router = useRouter();
  const { user } = useAuthStore();
  const [showWelcome, setShowWelcome] = useState(false);

  const subtleOpacity = useRef(new Animated.Value(0)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const stagger = Animated.sequence([
      Animated.timing(subtleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(breathScale, {
          toValue: 1.032,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(breathScale, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
    ]);
    stagger.start();
  }, [breathScale, subtleOpacity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/home");
      } else {
        setShowWelcome(true);
        Animated.parallel([
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(welcomeOpacity, {
            toValue: 1,
            duration: 360,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [user, router, splashOpacity, welcomeOpacity]);

  return (
    <AnimatedAuthBackground isDark={isDark}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" />
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrap, { opacity: splashOpacity, transform: [{ scale: breathScale }] }]}>
          <Logo size={LOGO_SIZE} style={styles.logo} variant={isDark ? "onDark" : "onLight"} />
          <Animated.Text style={[styles.valetLabel, { opacity: subtleOpacity }]}>
            valet
          </Animated.Text>
        </Animated.View>

        {showWelcome && (
          <Animated.View style={[styles.welcomeOverlay, { opacity: welcomeOpacity }]}>
            <WelcomeContent
              onLogin={() => router.replace("/login")}
              onSignup={() => router.replace("/signup")}
            />
          </Animated.View>
        )}
      </View>
    </AnimatedAuthBackground>
  );
}

function createStyles(F: { secondary: number }, Fonts: { primary: string }, theme: any, textScale: number) {
  return StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: 'transparent',
    },
    logoWrap: {
      alignItems: "center",
    },
    logo: { marginBottom: 0 },
    valetLabel: {
      marginTop: 0,
      fontSize: Math.round(F.secondary * textScale),
      fontWeight: "700",
      letterSpacing: 2,
      color: theme.auth.authHeroValetLabel,
      textTransform: "lowercase",
    },
    welcomeOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
  });
}
