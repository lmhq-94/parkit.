import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { Stack, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hydrate } = useAuthStore();
  const [isHydrating, setIsHydrating] = useState(true);

  const [fontsLoaded] = useFonts({
    "CalSans": require("../../assets/fonts/CalSans.ttf"),
  });

  useEffect(() => {
    const init = async () => {
      await hydrate();
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
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
