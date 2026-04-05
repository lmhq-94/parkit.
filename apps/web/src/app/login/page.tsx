"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { apiClient, getApiErrorMessage, getTranslatedApiErrorMessage } from "@/lib/api";
import { useAuthStore, useLocaleStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemeToggleSimple } from "@/components/ThemeToggleSimple";
import { LocaleToggleSimple } from "@/components/LocaleToggleSimple";

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { login, setError, error } = useAuthStore();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const setCompanyBranding = useDashboardStore((s) => s.setCompanyBranding);
  const setBrandingInCache = useDashboardStore((s) => s.setBrandingInCache);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const logoVariant = mounted && resolvedTheme === "dark" ? "onDark" : "default";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.post<{
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          systemRole: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";
          companyId?: string;
          appPreferences?: {
            theme?: "light" | "dark";
            locale?: "es" | "en";
          };
        };
        token: string;
      }>("/auth/login", formData);
      if (response) {
        login(response.user, response.token);
        apiClient.setToken(response.token);
        const prefs = response.user.appPreferences;

        const detectDeviceTheme = (): "light" | "dark" => {
          if (typeof window !== "undefined" && "matchMedia" in window) {
            try {
              return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            } catch {
              // ignore
            }
          }
          const rt = resolvedTheme;
          return rt === "dark" ? "dark" : "light";
        };

        const detectDeviceLocale = (): "es" | "en" => {
          if (typeof navigator !== "undefined") {
            const lang = (navigator.language || navigator.languages?.[0] || "es").toLowerCase();
            if (lang.startsWith("en")) return "en";
          }
          return "es";
        };

        const finalTheme: "light" | "dark" = prefs?.theme ?? detectDeviceTheme();
        const finalLocale: "es" | "en" = prefs?.locale ?? detectDeviceLocale();

        setTheme(finalTheme);
        setLocale(finalLocale);

        // Sync preferences to database (does not block navigation).
        apiClient
          .patch("/users/me", {
            appPreferences: {
              theme: finalTheme,
              locale: finalLocale,
            },
          })
          .catch(() => {
            // Silence preference errors; they should not block login.
          });

        // Load branding during loading so dashboard does not flash defaults before company theme.
        const loadBranding = async () => {
          try {
            const superAdminUser = isSuperAdmin(response.user);
            if (superAdminUser) {
              const selectedId =
                typeof window !== "undefined" ? localStorage.getItem("parkit_selected_company_id") : null;
              if (selectedId) {
                const data = await apiClient.get<{
                  brandingConfig?: Record<string, string | null | undefined> | null;
                }>(`/companies/${selectedId}/branding`);
                const bc = data?.brandingConfig && typeof data.brandingConfig === "object" ? data.brandingConfig : null;
                const branding = bc
                  ? {
                    bannerImageUrl: bc.bannerImageUrl ?? null,
                    logoImageUrl: bc.logoImageUrl ?? null,
                    primaryColor: bc.primaryColor ?? null,
                    primaryColorDark: bc.primaryColorDark ?? null,
                    secondaryColor: bc.secondaryColor ?? null,
                    secondaryColorDark: bc.secondaryColorDark ?? null,
                    tertiaryColor: bc.tertiaryColor ?? null,
                    tertiaryColorDark: bc.tertiaryColorDark ?? null,
                  }
                  : null;
                setCompanyBranding(branding);
                if (branding) setBrandingInCache(selectedId, branding);
              } else {
                setCompanyBranding(null);
              }
            } else {
              const data = await apiClient.get<{
                brandingConfig?: Record<string, string | null | undefined> | null;
              }>("/companies/me/branding");
              const bc = data?.brandingConfig && typeof data.brandingConfig === "object" ? data.brandingConfig : null;
              const branding = bc
                ? {
                  bannerImageUrl: bc.bannerImageUrl ?? null,
                  logoImageUrl: bc.logoImageUrl ?? null,
                  primaryColor: bc.primaryColor ?? null,
                  primaryColorDark: bc.primaryColorDark ?? null,
                  secondaryColor: bc.secondaryColor ?? null,
                  secondaryColorDark: bc.secondaryColorDark ?? null,
                  tertiaryColor: bc.tertiaryColor ?? null,
                  tertiaryColorDark: bc.tertiaryColorDark ?? null,
                }
                : null;
              setCompanyBranding(branding);
            }
          } catch {
            setCompanyBranding(null);
          }
        };
        await loadBranding();

        // Keep spinner active while navigation happens -
        // setIsSubmitting(false) is NOT called on successful path to avoid
        // form flash before dashboard loads.
        router.push("/dashboard");
        return;
      }
    } catch (err: unknown) {
      const raw = getApiErrorMessage(err);
      if (raw === "USER_INACTIVE") {
        setError(t("auth.errorUserInactive"));
      } else if (raw === "COMPANY_INACTIVE") {
        setError(t("auth.errorCompanyInactive"));
      } else {
        setError(getTranslatedApiErrorMessage(err, t));
      }
    }
    setIsSubmitting(false);
  };

  // Prevent hydration mismatch
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* Full screen animated gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)'
              : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)',
          }}
        />

        {/* Blob shapes */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px]" style={{ background: isDark ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(60px)', opacity: isDark ? 0.6 : 0.7, animation: 'lava-morph-1 20s ease-in-out infinite' }} />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px]" style={{ background: isDark ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)' : 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(50px)', opacity: isDark ? 0.5 : 0.65, animation: 'lava-morph-2 25s ease-in-out infinite' }} />
        <div className="absolute bottom-20 left-1/4 w-[450px] h-[450px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' : 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', filter: 'blur(70px)', opacity: isDark ? 0.55 : 0.75, animation: 'lava-morph-3 22s ease-in-out infinite' }} />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px]" style={{ background: isDark ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' : 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(55px)', opacity: isDark ? 0.45 : 0.6, animation: 'lava-morph-4 18s ease-in-out infinite' }} />
        <div className="absolute bottom-1/3 left-10 w-[350px] h-[350px]" style={{ background: isDark ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%', filter: 'blur(45px)', opacity: isDark ? 0.4 : 0.6, animation: 'lava-morph-5 24s ease-in-out infinite' }} />
        <div className="absolute top-1/4 right-1/5 w-[300px] h-[300px]" style={{ background: isDark ? 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #312e81 100%)' : 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)', borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%', filter: 'blur(40px)', opacity: isDark ? 0.35 : 0.65, animation: 'lava-morph-6 28s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[280px] h-[280px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e3a8a 0%, #3730a3 100%)' : 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)', borderRadius: '40% 60% 50% 50% / 50% 40% 50% 60%', filter: 'blur(35px)', opacity: isDark ? 0.3 : 0.55, animation: 'lava-morph-7 30s ease-in-out infinite' }} />

        {/* Overlay */}
        <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)' : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)' }} />
      </div>

      {/* TOP RIGHT: Theme and Locale toggles */}
      <div className="absolute top-4 right-4 z-30 hidden md:flex items-center gap-3">
        <ThemeToggleSimple />
        <LocaleToggleSimple />
      </div>

      {/* MAIN: Centered Form with Logo */}
      <main className="w-full max-w-[480px] relative z-10">
        {/* Premium Glass Card Container */}
        <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-10">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-10">
            <Logo variant={logoVariant} className="text-5xl mb-5" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("auth.signIn")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{t("auth.signInToContinue")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t("auth.email")}</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-600 dark:text-slate-400">{t("auth.password")}</label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">{t("auth.forgotPassword")}</Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-4 pr-10 text-slate-900 dark:text-white text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-all">
              {isSubmitting ? <LoadingSpinner size="sm" variant="white" /> : <>{t("auth.signIn")}<ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {error && <p className="mt-4 text-xs text-red-600 dark:text-red-400 text-center">{error}</p>}

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.dontHaveAccount")} <Link href="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline-offset-2 hover:underline transition-colors">{t("auth.registerNow")}</Link></p>
          </div>
        </div>

        {/* Bottom section - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 py-4 px-4 text-center z-20">
          <div className="max-w-[480px] mx-auto space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t("auth.supportHint")}{" "}
              <a href="mailto:soporte@parkit.app" className="font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline-offset-2 hover:underline transition-colors">
                {t("auth.supportLinkLabel")}
              </a>
            </p>

            <div className="flex flex-col items-center justify-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">

              <span>© {new Date().getFullYear()} Parkit. {t("privacy.footerRights")}</span>

              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  {t("privacy.footerTerms")}
                </Link>

                <span className="shrink-0 w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />

                <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  {t("privacy.footerPrivacy")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
