import { Stack, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { getStoredUser } from '@/lib/auth';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, setLoading, isLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    'CalSans': require('../../assets/fonts/CalSans.ttf'),
  });

  useEffect(() => {
    const hydrate = async () => {
      setLoading(true);
      try {
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
      <Stack.Screen name="index" />
      <Stack.Screen
        name="login"
        options={{ animation: 'none', gestureEnabled: false }}
      />
    </Stack>
  );
}
