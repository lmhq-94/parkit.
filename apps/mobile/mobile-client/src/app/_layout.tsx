import { useEffect, useState } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { Stack, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hydrate } = useAuthStore();
  const { hydrateLocale } = useLocaleStore();
  const [isHydrating, setIsHydrating] = useState(true);

  const [fontsLoaded] = useFonts({
    "CalSans": require("../../assets/fonts/CalSans.ttf"),
  });

  useEffect(() => {
    const init = async () => {
      await Promise.all([hydrate(), hydrateLocale()]);
      setIsHydrating(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isHydrating && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isHydrating, fontsLoaded]);

  if (isHydrating || !fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{ animation: "none", gestureEnabled: false }}
      />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
