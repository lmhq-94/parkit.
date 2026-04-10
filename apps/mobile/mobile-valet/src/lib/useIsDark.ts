import { useColorScheme } from "react-native";
import { useThemeStore } from "@/lib/themeStore";

export function useIsDark(): boolean {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);
  return preference === "dark"
    ? true
    : preference === "light"
      ? false
      : systemScheme === "dark";
}
