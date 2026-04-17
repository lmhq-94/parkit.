import { useColorScheme } from "react-native";
import { usePreferencesStore } from "@/lib/store";

export function useIsDark(): boolean {
  const systemScheme = useColorScheme();
  const preference = usePreferencesStore((s) => s.theme);
  return preference === "dark"
    ? true
    : preference === "light"
      ? false
      : systemScheme === "dark";
}
