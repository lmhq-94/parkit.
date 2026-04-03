"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { checkPasswordRequirements, isPasswordSecure } from "@parkit/shared";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, User, ShieldCheck } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";

const REDIRECT_DELAY_SECONDS = 3;

const IL = "w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

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
    const id = setInterval(() => setRedirectSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [success]);

  useEffect(() => {
    if (success && redirectSeconds <= 0) router.push("/login");
  }, [success, redirectSeconds, router]);

  const req = checkPasswordRequirements(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim()) { setError(t("auth.nameRequired")); return; }
    if (!isPasswordSecure(password)) { setError(t("auth.passwordDoesNotMeetRequirements")); return; }
    if (password !== confirmPassword) { setError(t("auth.passwordsDoNotMatch")); return; }
    if (!token?.trim()) { setError(t("auth.inviteExpiredOrInvalid")); return; }

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

  /* ── Token invalid ─────────────────────────────────────────────────── */
  if (!token?.trim()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
        <div className="w-full max-w-[360px] text-center">
          <Logo variant={logoVariant} className="text-4xl mx-auto" />
          <div className="mt-8">
            <p className="text-text-primary font-medium">{t("auth.inviteExpiredOrInvalid")}</p>
            <p className="mt-2 text-sm text-text-muted">{t("auth.inviteExpiredHint")}</p>
            <Link href="/login" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-company-primary px-6 py-3 text-sm font-medium text-white transition-colors">
              {t("auth.backToSignIn")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success ───────────────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
        <div className="w-full max-w-[360px] text-center">
          <Logo variant={logoVariant} className="text-4xl mx-auto" />
          <div className="mt-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-semibold text-text-primary mb-2">{t("auth.registrationComplete")}</h1>
            <p className="text-sm text-text-muted mb-8">{t("auth.redirectingToLogin", { seconds: redirectSeconds })}</p>
            <Link href="/login" className="w-full flex items-center justify-center gap-2 rounded-lg bg-company-primary py-3 text-sm font-medium text-white transition-colors">
              {t("auth.goToLogin")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form — split panel ───────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-stretch bg-page">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-company-primary px-10 py-12 text-white">
        <Logo variant="onDark" className="text-3xl" />

        <div className="space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold leading-snug">{t("auth.completeProfile")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{t("auth.completeProfileDescription")}</p>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-white/60 shrink-0" />
              {t("auth.passwordReqMinLength")}
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-white/60 shrink-0" />
              {t("auth.passwordReqUppercase")}
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-white/60 shrink-0" />
              {t("auth.passwordReqNumber")}
            </li>
          </ul>
        </div>

        <p className="text-xs text-white/40">© {new Date().getFullYear()} Parkit</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        {/* Logo on mobile */}
        <div className="lg:hidden flex justify-center mb-8">
          <Logo variant={logoVariant} className="text-4xl" />
        </div>

        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-text-primary">{t("auth.completeProfile")}</h1>
            <p className="mt-1 text-sm text-text-muted">{t("auth.completeProfileDescription")}</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>{t("users.firstName")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={IL + " pl-9"} placeholder="Juan" />
                </div>
              </div>
              <div>
                <label className={LABEL}>{t("users.lastName")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={IL + " pl-9"} placeholder="Pérez" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={LABEL}>{t("auth.createPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={IL + " pl-9 pr-10"}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary" aria-label={showPassword ? "Hide" : "Show"}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                <PasswordReq label={t("auth.passwordReqMinLength")} met={req.minLength} />
                <PasswordReq label={t("auth.passwordReqUppercase")} met={req.hasUppercase} />
                <PasswordReq label={t("auth.passwordReqLowercase")} met={req.hasLowercase} />
                <PasswordReq label={t("auth.passwordReqNumber")} met={req.hasNumber} />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className={LABEL}>{t("auth.confirmPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={IL + " pl-9"} placeholder="••••••••" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-company-primary py-3 text-sm font-medium text-white hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {isSubmitting ? <LoadingSpinner size="sm" variant="white" /> : <>{t("auth.completeRegistration")} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/login" className="font-medium text-company-primary hover:underline underline-offset-2">
              {t("auth.signIn")}
            </Link>
          </p>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-xs text-text-muted">
            {t("auth.supportHint")}{" "}
            <a href="mailto:soporte@parkit.app" className="font-medium text-company-primary hover:underline underline-offset-2">
              {t("auth.supportLinkLabel")}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function PasswordReq({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${met ? "bg-emerald-500" : "bg-text-muted/30"}`} />
      <span className={`text-[11px] font-medium transition-colors ${met ? "text-emerald-600 dark:text-emerald-400" : "text-text-muted"}`}>
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
