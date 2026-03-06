"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useTranslation } from "@/hooks/useTranslation";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const { login, setError, error } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const isDark = resolvedTheme === "dark";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        };
        token: string;
      }>("/auth/login", formData);

      if (response) {
        login(response.user, response.token);
        apiClient.setToken(response.token);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-page px-4 py-12">
      {/* Theme + Language toggles (top right) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <ThemeToggle />
        <LocaleToggle />
      </div>
      {/* Background: subtle gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(59,130,246,0.14),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_85%_60%,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_15%_90%,rgba(59,130,246,0.06),transparent_50%)]" />

      <div className="relative w-full max-w-[400px] animate-fade-in">
        <div className="rounded-2xl border border-card-border bg-card bg-clip-padding p-8 shadow-2xl shadow-black/10 dark:shadow-black/30 backdrop-blur-2xl md:p-10">
          <div className="mb-8 flex flex-col items-center">
            <Logo variant={isDark ? "onDark" : "default"} className="text-5xl md:text-6xl" />
            <p className="mt-6 text-center text-text-secondary text-sm">
              {t("auth.signInToContinue")}
            </p>
          </div>

          {error && (
            <div
              className="mb-6 animate-slide-in rounded-xl border border-red-500/25 bg-red-500/15 px-4 py-3 text-sm text-red-100"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
              >
                {t("auth.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-input-border bg-input-bg py-3.5 pl-12 pr-4 text-text-primary placeholder-text-muted transition-all duration-200 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/25"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                >
                  {t("auth.password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-sky-500 hover:text-sky-400 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input-border bg-input-bg py-3.5 pl-12 pr-12 text-text-primary placeholder-text-muted transition-all duration-200 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-input-bg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/25 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3.5 font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-400 hover:shadow-sky-400/30 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-page disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t("common.loading")}
                </span>
              ) : (
                <>
                  {t("auth.signIn")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-card-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs font-medium text-text-muted">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-input-border bg-input-bg py-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
                title="Coming soon"
              >
                <GoogleIcon className="h-5 w-5 shrink-0" />
                {t("auth.continueWithGoogle")}
              </button>
              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-input-border bg-input-bg py-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
                title="Coming soon"
              >
                <MicrosoftIcon className="h-5 w-5 shrink-0" />
                {t("auth.continueWithMicrosoft")}
              </button>
              <p className="text-center text-xs text-text-muted">
                {t("auth.moreOptionsComing")}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
