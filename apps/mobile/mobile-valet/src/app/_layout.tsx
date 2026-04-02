import "@/lib/androidTextDefaults";
import { Stack, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useAuthStore, useLocaleStore } from '@/lib/store';
import { useThemeStore } from '@/lib/themeStore';
import { getStoredUser } from '@/lib/auth';
import { useFonts } from 'expo-font';
import { FeedbackModal } from '@/components/FeedbackModal';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, setLoading, isLoading } = useAuthStore();
  const { hydrateLocale } = useLocaleStore();
  const { hydrateTheme } = useThemeStore();

  const [fontsLoaded] = useFonts({
    'CalSans': require('../../assets/fonts/CalSans.ttf'),
  });

  useEffect(() => {
    const hydrate = async () => {
      setLoading(true);
      try {
        await hydrateLocale();
        await hydrateTheme();
        const user = await getStoredUser();
        setUser(user);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [hydrateLocale, hydrateTheme, setLoading, setUser]);

  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded]);

  if (isLoading || !fontsLoaded) {
    return null;
  }

  return (
    <>
      <KeyboardProvider preload={false}>
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
          <Stack.Screen name="home" />
          <Stack.Screen name="receive" />
          <Stack.Screen name="return-pickup" />
          <Stack.Screen name="tickets" />
          <Stack.Screen name="park" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="workflow" />
          <Stack.Screen name="help" />
          <Stack.Screen
            name="welcome"
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen
            name="login"
            options={{ animation: 'slide_from_right', gestureEnabled: true }}
          />
          <Stack.Screen
            name="forgot-password"
            options={{ animation: 'slide_from_right', gestureEnabled: true }}
          />
        </Stack>
      </KeyboardProvider>
      <FeedbackModal />
    </>
  );
}
