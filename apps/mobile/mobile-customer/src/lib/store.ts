import { create } from "zustand";
import { User, getStoredUser, getStoredToken } from "./auth";
import type { Locale } from "./i18n";
import { getStoredLocale, setStoredLocale } from "./i18n";
import { updateProfile } from "./userApi";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user: User, token: string) => {
    set({ user, token, error: null });
  },

  logout: () => {
    set({ user: null, token: null });
  },

  hydrate: async () => {
    try {
      const user = await getStoredUser();
      const token = await getStoredToken();
      set({ user, token });
    } catch (error) {
      // Silently ignore hydration errors
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

// Booking & ticket state
interface BookingStore {
  selectedVehicleId: string | null;
  selectedParkingId: string | null;
  selectVehicle: (id: string) => void;
  selectParking: (id: string) => void;
  clearSelection: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedVehicleId: null,
  selectedParkingId: null,
  selectVehicle: (id: string) => set({ selectedVehicleId: id }),
  selectParking: (id: string) => set({ selectedParkingId: id }),
  clearSelection: () => set({ selectedVehicleId: null, selectedParkingId: null }),
}));

// App Preferences (Locale, Theme) - Persisted and synced with database
export type Theme = "light" | "dark" | "system";

const getDeviceLocale = (): Locale => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.startsWith("en") ? "en" : "es";
  } catch {
    return "es";
  }
};

const getDeviceTheme = (): Theme => {
  return "system";
};

interface PreferencesStore {
  locale: Locale;
  theme: Theme;
  pendingLocale: Locale;
  pendingTheme: Theme;
  isHydrated: boolean;
  isSaving: boolean;
  
  // Real-time getters for "applied" vs "pending"
  isDirty: () => boolean;
  
  // Actions
  setPendingLocale: (locale: Locale) => void;
  setPendingTheme: (theme: Theme) => void;
  savePreferences: () => Promise<void>;
  hydratePreferences: () => Promise<void>;
  resetPending: () => void;
}

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  locale: "es",
  theme: "system",
  pendingLocale: "es",
  pendingTheme: "system",
  isHydrated: false,
  isSaving: false,

  isDirty: () => {
    const { locale, theme, pendingLocale, pendingTheme } = get();
    return locale !== pendingLocale || theme !== pendingTheme;
  },

  setPendingLocale: (locale: Locale) => {
    set({ pendingLocale: locale });
  },

  setPendingTheme: (theme: Theme) => {
    set({ pendingTheme: theme });
  },

  savePreferences: async () => {
    const { pendingLocale, pendingTheme } = get();
    set({ isSaving: true });
    try {
      await updateProfile({
        appPreferences: {
          locale: pendingLocale,
          theme: pendingTheme,
        },
      });
      
      await setStoredLocale(pendingLocale);
      // We could also store theme locally if needed
      
      set({ 
        locale: pendingLocale, 
        theme: pendingTheme,
        isSaving: false 
      });
    } catch (error) {
      set({ isSaving: false });
      throw error;
    }
  },

  hydratePreferences: async () => {
    const storedLocale = await getStoredLocale();
    const deviceLocale = getDeviceLocale();
    const deviceTheme = getDeviceTheme();

    // Logic: use stored if exists, else device
    const finalLocale = storedLocale || deviceLocale;
    const finalTheme = deviceTheme;

    set({ 
      locale: finalLocale, 
      theme: finalTheme,
      pendingLocale: finalLocale,
      pendingTheme: finalTheme,
      isHydrated: true 
    });
  },

  resetPending: () => {
    const { locale, theme } = get();
    set({ pendingLocale: locale, pendingTheme: theme });
  },
}));

export const useLocaleStore = usePreferencesStore;
