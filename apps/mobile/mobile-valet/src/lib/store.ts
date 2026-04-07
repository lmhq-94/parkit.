import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from './auth';
import type { Locale } from '@parkit/shared';
import { getStoredLocale, setStoredLocale } from './i18n';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  mergeUser: (patch: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

interface TicketStore {
  selectedTicketId: string | null;
  filter: 'assigned' | 'in-transit' | 'completed';
  setSelectedTicketId: (id: string | null) => void;
  setFilter: (filter: 'assigned' | 'in-transit' | 'completed') => void;
}

interface LocaleStore {
  locale: Locale;
  isHydrated: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  hydrateLocale: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  mergeUser: (patch) =>
    set((s) => {
      if (!s.user) return s;
      return { user: { ...s.user, ...patch } };
    }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

export const useTicketStore = create<TicketStore>((set) => ({
  selectedTicketId: null,
  filter: 'assigned',
  setSelectedTicketId: (id) => set({ selectedTicketId: id }),
  setFilter: (filter) => set({ filter }),
}));

export { useThemeStore } from './themeStore';
export { useCompanyStore } from './companyStore';
export { useParkingPreferenceStore } from './parkingPreferenceStore';

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: 'es',
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

interface AccessibilityStore {
  /** Escala de texto para accesibilidad (1.0 = normal, 1.5 = máximo) */
  textScale: number;
  /** Animaciones reducidas para usuarios sensibles */
  reduceMotion: boolean;
  setTextScale: (scale: number) => void;
  setReduceMotion: (enabled: boolean) => void;
}

export const useAccessibilityStore = create<AccessibilityStore>()(
  persist(
    (set) => ({
      textScale: 1,
      reduceMotion: false,
      setTextScale: (scale) => set({ textScale: Math.max(1, Math.min(1.25, scale)) }),
      setReduceMotion: (enabled) => set({ reduceMotion: enabled }),
    }),
    {
      name: 'parkit-accessibility',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
