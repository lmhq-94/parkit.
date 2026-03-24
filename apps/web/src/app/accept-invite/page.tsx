"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { checkPasswordRequirements, isPasswordSecure } from "@/lib/passwordValidation";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, Check, Circle } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";

const REDIRECT_DELAY_SECONDS = 3;

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(REDIRECT_DELAY_SECONDS);

  useEffect(() => setMounted(true), []);
  const logoVariant = mounted && resolvedTheme === "dark" ? "onDark" : "default";

  useEffect(() => {
    if (!success) return;
    const id = setInterval(() => {
      setRedirectSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          router.push("/login");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [success, router]);

  const req = checkPasswordRequirements(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!isPasswordSecure(password)) {
      setError(t("auth.passwordDoesNotMeetRequirements"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }
    if (!token?.trim()) {
      setError(t("auth.inviteExpiredOrInvalid"));
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post<{ user: unknown; token: string }>("/auth/invitations/accept", {
        token: token.trim(),
        password,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(getTranslatedApiErrorMessage(err, t) || t("auth.inviteExpiredOrInvalid"));
    }
    setIsSubmitting(false);
  };

  if (!token?.trim()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4 relative">
        <div className="w-full max-w-[360px] text-center">
          <Logo variant={logoVariant} className="text-4xl mx-auto" />
          <p className="mt-6 text-sm text-text-muted">{t("auth.inviteExpiredOrInvalid")}</p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-company-primary hover:text-company-primary text-sm font-medium"
          >
            {t("auth.backToSignIn")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <footer className="absolute bottom-0 left-0 right-0 py-4 text-center">
          <p className="text-xs text-text-muted">
            {t("auth.supportHint")}{" "}
            <a
              href="mailto:soporte@parkit.app"
              className="font-medium text-company-primary hover:text-company-primary underline-offset-2 hover:underline"
            >
              {t("auth.supportLinkLabel")}
            </a>
          </p>
        </footer>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
        <div className="w-full max-w-[360px] text-center">
          <div className="flex flex-col items-center mb-10">
            <Logo variant={logoVariant} className="text-4xl" />
            <span className="mt-6 inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </span>
            <h1 className="mt-4 text-lg font-semibold text-text-primary">
              {t("auth.passwordSetSuccess")}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {t("auth.redirectingToLogin", { seconds: redirectSeconds })}
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-company-primary hover:text-company-primary"
          >
            {t("auth.backToSignIn")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <footer className="absolute bottom-0 left-0 right-0 py-4 text-center">
          <p className="text-xs text-text-muted">
            {t("auth.supportHint")}{" "}
            <a
              href="mailto:soporte@parkit.app"
              className="font-medium text-company-primary hover:text-company-primary underline-offset-2 hover:underline"
            >
              {t("auth.supportLinkLabel")}
            </a>
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-2 text-xs font-medium text-text-secondary">{t("auth.passwordRequirements")}</p>
            <ul className="mt-1.5 space-y-1 text-xs text-text-muted">
              <li className="flex items-center gap-2">
                {req.minLength ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />}
                {t("auth.passwordReqMinLength")}
              </li>
              <li className="flex items-center gap-2">
                {req.hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />}
                {t("auth.passwordReqUppercase")}
              </li>
              <li className="flex items-center gap-2">
                {req.hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />}
                {t("auth.passwordReqLowercase")}
              </li>
              <li className="flex items-center gap-2">
                {req.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />}
                {t("auth.passwordReqNumber")}
              </li>
            </ul>
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
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-company-primary py-3 text-sm font-medium text-white hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" variant="white" />
            ) : (
              <>
                {t("auth.setPassword")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center">
            <Link href="/login" className="text-sm text-company-primary hover:text-company-primary inline-flex items-center gap-1">
              {t("auth.backToSignIn")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </form>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-xs text-text-muted">
          {t("auth.supportHint")}{" "}
          <a
            href="mailto:soporte@parkit.app"
            className="font-medium text-company-primary hover:text-company-primary underline-offset-2 hover:underline"
          >
            {t("auth.supportLinkLabel")}
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-page">
          <PageLoader />
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
