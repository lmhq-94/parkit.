import { create } from "zustand";
import { User, getStoredUser, getStoredToken } from "./auth";
import type { Locale } from "./i18n";
import { getStoredLocale, setStoredLocale } from "./i18n";

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
      console.error("Hydration error:", error);
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

// Locale (es / en) - changed from Settings/Profile and persisted
interface LocaleStore {
  locale: Locale;
  isHydrated: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  hydrateLocale: () => Promise<void>;
}

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: "es",
  isHydrated: false,
  setLocale: async (locale: Locale) => {
    await setStoredLocale(locale);
    set({ locale });
  },
  hydrateLocale: async () => {
    const locale = await getStoredLocale();
    set({ locale, isHydrated: true });
  },
}));
