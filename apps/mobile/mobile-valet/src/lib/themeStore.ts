import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export type ThemePreference = "system" | "light" | "dark";

const KEY = "parkit_valet_theme_pref";

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (p: ThemePreference) => Promise<void>;
  hydrateTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  hydrated: false,
  setPreference: async (preference) => {
    await SecureStore.setItemAsync(KEY, preference);
    set({ preference });
  },
  hydrateTheme: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      const preference: ThemePreference =
        raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
      set({ preference, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));
