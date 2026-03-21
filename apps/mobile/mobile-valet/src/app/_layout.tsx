import { Stack, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore, useLocaleStore } from '@/lib/store';
import { getStoredUser } from '@/lib/auth';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, setLoading, isLoading } = useAuthStore();
  const { hydrateLocale } = useLocaleStore();

  const [fontsLoaded] = useFonts({
    'CalSans': require('../../assets/fonts/CalSans.ttf'),
  });

  useEffect(() => {
    const hydrate = async () => {
      setLoading(true);
      try {
        await hydrateLocale();
        const user = await getStoredUser();
        setUser(user);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded]);

  if (isLoading || !fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ animation: 'none', gestureEnabled: false }}
      />
      <Stack.Screen name="tickets" />
      <Stack.Screen name="settings" />
      <Stack.Screen
        name="welcome"
        options={{ animation: 'fade', gestureEnabled: false }}
      />
      <Stack.Screen
        name="login"
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
    </Stack>
  );
}
