import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, StatusBar, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/store";
import { WelcomeContent } from "./welcome";

const SPLASH_DURATION_MS = 2600;
const LOGO_SIZE = 72;

/** Mismo fondo que la franja del logo en welcome/login/registro/forgot. */
const SPLASH_BG = "#020617";

export default function SplashScreen() {
  const splashBg = SPLASH_BG;
  /** Logo sobre franja oscura (misma lógica que `Logo` variant onDark). */
  const parkColor = "#FFFFFF";
  const itColor = "#7DD3FC";
  const subtleColor = "rgba(148, 163, 184, 0.58)";

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
  }, [breathScale, itOpacity, itScale, itTranslate, parkOpacity, parkTranslate, subtleOpacity]);

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
    <View style={[styles.container, { backgroundColor: splashBg }]}>
      <StatusBar barStyle="light-content" backgroundColor={splashBg} />
      <Animated.View style={[styles.logoWrap, { opacity: splashOpacity, transform: [{ scale: breathScale }] }]}>
        <View style={styles.logoRow}>
          <Animated.Text
            style={[
              styles.logoPart,
              {
                color: parkColor,
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
              {
                color: itColor,
                opacity: itOpacity,
                transform: [{ translateX: itTranslate }, { scale: itScale }],
              },
            ]}
          >
            it.
          </Animated.Text>
        </View>
        <Animated.Text style={[styles.valetLabel, { color: subtleColor, opacity: subtleOpacity }]}>
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
    fontWeight: Platform.OS === "android" ? "normal" : "700",
    letterSpacing: -1.5,
  },
  valetLabel: {
    marginTop: 28,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 4,
    textTransform: "lowercase",
  },
  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
