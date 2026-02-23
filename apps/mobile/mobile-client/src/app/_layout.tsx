import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { Stack } from "expo-router";
import { View, Text } from "react-native";

export default function RootLayout() {
  const { hydrate } = useAuthStore();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const init = async () => {
      await hydrate();
      setIsHydrating(false);
    };
    init();
  }, []);

  if (isHydrating) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
