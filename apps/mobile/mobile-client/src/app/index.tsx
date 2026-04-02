import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/store";
import { getHasSeenOnboarding } from "@/lib/onboarding";

// Colors aligned with the web app (themeDefaults)
const SPLASH_BG = "#020617"; // slate-900
const LOGO_PARK = "#FFFFFF";
const LOGO_IT = "#3B82F6"; // blue-500 (primary dark)

const SPLASH_DURATION_MS = 2600;
const LOGO_SIZE = 72;

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const parkOpacity = useRef(new Animated.Value(0)).current;
  const parkTranslate = useRef(new Animated.Value(16)).current;
  const itOpacity = useRef(new Animated.Value(0)).current;
  const itScale = useRef(new Animated.Value(0.88)).current;
  const itTranslate = useRef(new Animated.Value(12)).current;
  const breathScale = useRef(new Animated.Value(1)).current;

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
      // Single subtle "breath" for the logo
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
  }, [breathScale, itOpacity, itScale, itTranslate, parkOpacity, parkTranslate]);

  useEffect(() => {
    const go = async () => {
      await new Promise((r) => setTimeout(r, SPLASH_DURATION_MS));
      if (!user) {
        router.replace("/welcome");
        return;
      }
      const hasSeenOnboarding = await getHasSeenOnboarding();
      if (hasSeenOnboarding) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    };
    go();
  }, [user, router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={SPLASH_BG} />
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: breathScale }] }]}>
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
      </Animated.View>
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
});
