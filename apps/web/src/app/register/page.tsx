"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { checkPasswordRequirements, isPasswordSecure } from "@parkit/shared";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, User } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";

const REDIRECT_DELAY_SECONDS = 3;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(REDIRECT_DELAY_SECONDS);

  useEffect(() => setMounted(true), []);
  const logoVariant = mounted && resolvedTheme === "dark" ? "onDark" : "default";

  useEffect(() => {
    if (!success) return;
    const id = setInterval(() => {
      setRedirectSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [success]);

  useEffect(() => {
    if (success && redirectSeconds <= 0) {
      router.push("/login");
    }
  }, [success, redirectSeconds, router]);

  const req = checkPasswordRequirements(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!firstName.trim() || !lastName.trim()) {
      setError(t("auth.nameRequired"));
      return;
    }
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
      await apiClient.post("/auth/register-invited", {
        token: token.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(getTranslatedApiErrorMessage(err, t) || t("auth.inviteExpiredOrInvalid"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token?.trim()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
        <div className="w-full max-w-[400px] text-center">
          <Logo variant={logoVariant} className="text-4xl mx-auto" />
          <div className="mt-8 p-8 rounded-3xl bg-card border border-card-border shadow-xl">
             <p className="text-text-primary font-medium">{t("auth.inviteExpiredOrInvalid")}</p>
             <p className="mt-2 text-sm text-text-secondary">{t("auth.inviteExpiredHint")}</p>
             <Link
               href="/login"
               className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all"
             >
               {t("auth.backToSignIn")}
               <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
        <div className="w-full max-w-[400px] text-center">
          <div className="flex flex-col items-center p-10 rounded-3xl bg-card border border-card-border shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {t("auth.registrationComplete")}
            </h1>
            <p className="text-text-secondary mb-8">
              {t("auth.redirectingToLogin", { seconds: redirectSeconds })}
            </p>
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-all"
            >
              {t("auth.goToLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="flex flex-col items-center mb-10">
          <Logo variant={logoVariant} className="text-5xl" />
          <h1 className="mt-8 text-2xl font-bold text-text-primary tracking-tight">
            {t("auth.completeProfile")}
          </h1>
          <p className="mt-2 text-text-secondary text-center">
            {t("auth.completeProfileDescription")}
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-[32px] p-8 md:p-10 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 font-medium flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  {t("common.firstName")}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-11 pr-4 h-12 rounded-2xl border border-card-border bg-background text-text-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Juan"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  {t("common.lastName")}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-11 pr-4 h-12 rounded-2xl border border-card-border bg-background text-text-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                {t("auth.createPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 h-12 rounded-2xl border border-card-border bg-background text-text-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                <PasswordReq label={t("auth.passwordReqMinLength")} met={req.minLength} />
                <PasswordReq label={t("auth.passwordReqUppercase")} met={req.hasUppercase} />
                <PasswordReq label={t("auth.passwordReqLowercase")} met={req.hasLowercase} />
                <PasswordReq label={t("auth.passwordReqNumber")} met={req.hasNumber} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                {t("auth.confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 h-12 rounded-2xl border border-card-border bg-background text-text-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? <LoadingSpinner size="sm" variant="white" /> : (
                <>
                  {t("auth.completeRegistration")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-text-secondary">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}

function PasswordReq({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${met ? "bg-emerald-500" : "bg-text-tertiary/30"}`} />
      <span className={`text-[11px] font-medium transition-colors ${met ? "text-emerald-600 dark:text-emerald-400" : "text-text-tertiary"}`}>
        {label}
      </span>
    </div>
  );
}

export default function RegisterInvitedPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RegisterForm />
    </Suspense>
  );
}
