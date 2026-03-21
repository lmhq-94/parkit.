import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/store";
import { WelcomeContent } from "./welcome";

// Colores alineados con la web (themeDefaults)
const SPLASH_BG = "#020617"; // slate-900
const LOGO_PARK = "#FFFFFF";
const LOGO_IT = "#3B82F6"; // blue-500 (primary dark)
const SUBTLE_TEXT = "rgba(148, 163, 184, 0.58)"; // slate-400 sutil pero legible

const SPLASH_DURATION_MS = 2600;
const LOGO_SIZE = 72;

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showWelcome, setShowWelcome] = useState(false);

  const parkOpacity = useRef(new Animated.Value(0)).current;
  const parkTranslate = useRef(new Animated.Value(16)).current;
  const itOpacity = useRef(new Animated.Value(0)).current;
  const itScale = useRef(new Animated.Value(0.88)).current;
  const itTranslate = useRef(new Animated.Value(12)).current;
  const subtleOpacity = useRef(new Animated.Value(0)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const stagger = Animated.sequence([
      // "park" entra primero: fade + deslizamiento suave
      Animated.parallel([
        Animated.timing(parkOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(parkTranslate, {
          toValue: 0,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
      // "it." entra después: fade + scale + ligero deslizamiento
      Animated.parallel([
        Animated.timing(itOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(itScale, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(itTranslate, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
      // "valet" muy sutil aparece al final del reveal
      Animated.timing(subtleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Un solo “respiro” suave del logo
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
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (user) {
        router.replace("/tickets");
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
    return () => clearTimeout(t);
  }, [user, router, splashOpacity, welcomeOpacity]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={SPLASH_BG} />
      <Animated.View style={[styles.logoWrap, { opacity: splashOpacity, transform: [{ scale: breathScale }] }]}>
        <View style={styles.logoRow}>
          <Animated.Text
            style={[
              styles.logoPart,
              styles.park,
              {
                opacity: parkOpacity,
                transform: [{ translateX: parkTranslate }],
              },
            ]}
          >
            park
          </Animated.Text>
          <Animated.Text
            style={[
              styles.logoPart,
              styles.it,
              {
                opacity: itOpacity,
                transform: [
                  { translateX: itTranslate },
                  { scale: itScale },
                ],
              },
            ]}
          >
            it.
          </Animated.Text>
        </View>
        <Animated.Text style={[styles.valetLabel, { opacity: subtleOpacity }]}>
          valet
        </Animated.Text>
      </Animated.View>

      {showWelcome && (
        <Animated.View style={[styles.welcomeOverlay, { opacity: welcomeOpacity }]}>
          <WelcomeContent
            onLogin={() => router.replace("/login")}
            onSignup={() => router.replace("/login?mode=signup")}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoPart: {
    fontFamily: "CalSans",
    fontSize: LOGO_SIZE,
    letterSpacing: -1.5,
  },
  park: {
    color: LOGO_PARK,
  },
  it: {
    color: LOGO_IT,
  },
  valetLabel: {
    marginTop: 28,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 4,
    color: SUBTLE_TEXT,
    textTransform: "lowercase",
  },
  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
