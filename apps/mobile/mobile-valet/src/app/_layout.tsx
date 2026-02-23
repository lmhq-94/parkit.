import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { getStoredUser } from '@/lib/auth';

export default function RootLayout() {
  const { setUser, setLoading } = useAuthStore();

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
