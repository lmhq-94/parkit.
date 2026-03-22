import { create } from 'zustand';
import type { User } from './auth';
import type { Locale } from './i18n';
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
    set((s) => (s.user ? { user: { ...s.user, ...patch } } : {})),
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
