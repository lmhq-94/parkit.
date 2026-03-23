import { create } from "zustand";
import { User, getStoredUser, setStoredUser, clearStoredUser } from "./auth";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  loggingOut: boolean;
  error: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  loggingOut: false,
  error: null,

  login: (user: User, token: string) => {
    setStoredUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
    set({ user, error: null, loggingOut: false });
  },

  logout: () => {
    clearStoredUser();
    set({ user: null, loggingOut: true });
  },

  hydrate: () => {
    const user = getStoredUser();
    set({ user, loggingOut: false });
  },

  setUser: (user: User | null) => {
    if (user) setStoredUser(user);
    set({ user });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

// Locale (i18n)
const LOCALE_KEY = "parkit_locale";
export type Locale = "es" | "en";

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// Always initialize to "es" so SSR and first client paint match (avoids hydration mismatch).
// Actual value is restored in Providers with getStoredLocale() in useEffect.
export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: "es",
  setLocale: (locale: Locale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_KEY, locale);
    }
    set({ locale });
  },
}));

// Current company branding (banner, logo, primary color). Loaded when entering dashboard or saving in Settings.
export type CompanyBranding = {
  bannerImageUrl?: string | null;
  logoImageUrl?: string | null;
  primaryColor?: string | null;
  primaryColorDark?: string | null;
  secondaryColor?: string | null;
  secondaryColorDark?: string | null;
  tertiaryColor?: string | null;
  tertiaryColorDark?: string | null;
} | null;

// UI/Dashboard state (sidebarCollapsed starts true to avoid SSR mismatch; hydrated from localStorage in sidebar)
export const SIDEBAR_COLLAPSED_KEY = "parkit_sidebar_collapsed";

interface DashboardStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectedCompanyId: string | null;
  selectedCompanyName: string | null;
  setSelectedCompany: (id: string | null, name: string | null) => void;
  /** Incrementar para forzar recarga de la lista de companies en el sidebar */
  companiesVersion: number;
  bumpCompanies: () => void;
  /** Incrementar cuando cambian parkings (ej. requiere reserva) para que el sidebar actualice "Reservas" */
  parkingsVersion: number;
  bumpParkings: () => void;
  companyBranding: CompanyBranding;
  setCompanyBranding: (b: CompanyBranding) => void;
  /** Caché de branding por companyId para mostrar al instante al cambiar de empresa (super admin). */
  brandingCache: Record<string, CompanyBranding>;
  setBrandingInCache: (companyId: string, b: CompanyBranding) => void;
  getBrandingFromCache: (companyId: string) => CompanyBranding | undefined;
}

const SELECTED_COMPANY_KEY = "parkit_selected_company_id";
const SELECTED_COMPANY_NAME_KEY = "parkit_selected_company_name";

export const useDashboardStore = create<DashboardStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  sidebarCollapsed: true,
  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    }
    set({ sidebarCollapsed: collapsed });
  },
  selectedCompanyId:
    typeof window !== "undefined" ? localStorage.getItem(SELECTED_COMPANY_KEY) : null,
  selectedCompanyName:
    typeof window !== "undefined" ? localStorage.getItem(SELECTED_COMPANY_NAME_KEY) : null,
  setSelectedCompany: (id: string | null, name: string | null) => {
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem(SELECTED_COMPANY_KEY, id);
        localStorage.setItem(SELECTED_COMPANY_NAME_KEY, name || "");
      } else {
        localStorage.removeItem(SELECTED_COMPANY_KEY);
        localStorage.removeItem(SELECTED_COMPANY_NAME_KEY);
      }
    }
    set({ selectedCompanyId: id, selectedCompanyName: name });
  },
  companiesVersion: 0,
  bumpCompanies: () => set((s) => ({ companiesVersion: s.companiesVersion + 1 })),
  parkingsVersion: 0,
  bumpParkings: () => set((s) => ({ parkingsVersion: s.parkingsVersion + 1 })),
  companyBranding: null,
  setCompanyBranding: (b) => set({ companyBranding: b }),
  brandingCache: {},
  setBrandingInCache: (companyId, b) =>
    set((s) => ({
      brandingCache: { ...s.brandingCache, [companyId]: b ?? null },
    })),
  getBrandingFromCache: (companyId) => useDashboardStore.getState().brandingCache[companyId],
}));
