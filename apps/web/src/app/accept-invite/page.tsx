"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useTranslation } from "@/hooks/useTranslation";
import { Lock } from "lucide-react";

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);
  const logoVariant = mounted && resolvedTheme === "dark" ? "onDark" : "default";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!token?.trim()) {
      setError(t("auth.inviteExpiredOrInvalid"));
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await apiClient.post<{
        user: { id: string; email: string; firstName: string; lastName: string; systemRole: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER"; companyId?: string };
        token: string;
      }>("/auth/invitations/accept", { token: token.trim(), password });
      if (response?.user && response?.token) {
        login(response.user, response.token);
        apiClient.setToken(response.token);
        router.push("/dashboard");
        return;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.inviteExpiredOrInvalid"));
    }
    setIsSubmitting(false);
  };

  if (!token?.trim()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle />
          <LocaleToggle />
        </div>
        <div className="w-full max-w-[360px] text-center">
          <Logo variant={logoVariant} className="text-4xl mx-auto" />
          <p className="mt-6 text-sm text-text-muted">{t("auth.inviteExpiredOrInvalid")}</p>
          <Link
            href="/login"
            className="mt-6 inline-block text-company-primary hover:text-company-primary text-sm font-medium"
          >
            {t("auth.backToSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <LocaleToggle />
      </div>

      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center mb-10">
          <Logo variant={logoVariant} className="text-4xl" />
          <h1 className="mt-6 text-lg font-semibold text-text-primary">
            {t("auth.acceptInviteTitle")}
          </h1>
          <p className="mt-2 text-sm text-text-muted text-center">
            {t("auth.acceptInviteDescription")}
          </p>
        </div>

        {error && (
          <div
            className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary"
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("auth.confirmPassword")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-company-primary py-3 text-sm font-medium text-white hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              t("auth.setPassword")
            )}
          </button>

          <p className="text-center">
            <Link href="/login" className="text-sm text-company-primary hover:text-company-primary">
              {t("auth.backToSignIn")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-page">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-company-primary-muted border-t-company-primary" />
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
