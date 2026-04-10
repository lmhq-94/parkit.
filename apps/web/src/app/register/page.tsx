"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { checkPasswordRequirements, isPasswordSecure } from "@parkit/shared";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertOctagon,
  Check,
  X,
  Mail,
  Lock,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaSquareFacebook, FaMicrosoft } from "react-icons/fa6";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";
import { ThemeToggleSimple } from "@/components/ThemeToggleSimple";
import { LocaleToggleSimple } from "@/components/LocaleToggleSimple";

const REDIRECT_DELAY_SECONDS = 3;

const INPUT_BASE = "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white text-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500";
const LABEL_BASE = "block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5";

function PasswordRequirement({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${met ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
        }`}>
        {met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
      </div>
      <span className={`${met ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500 dark:text-slate-500"}`}>
        {label}
      </span>
    </div>
  );
}

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

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/${provider}`;
  };

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

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-[360px] text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-[1.75rem] leading-tight premium-title premium-title-glow mb-2">{t("auth.registrationComplete")}</h1>
          <p className="premium-subtitle text-sm mb-4">{t("auth.redirectingToLogin", { seconds: redirectSeconds })}</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((REDIRECT_DELAY_SECONDS - redirectSeconds) / REDIRECT_DELAY_SECONDS) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Prevent hydration mismatch by not rendering theme-dependent styles until mounted
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* Full screen animated gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Base gradient - Dark navy/purple like Gratafy */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)'
              : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)',
          }}
        />

        {/* Large organic blob shapes - more visible like Gratafy */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px]"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            filter: 'blur(60px)',
            opacity: isDark ? 0.6 : 0.7,
            animation: 'lava-morph-1 20s ease-in-out infinite',
          }}
        />

        <div
          className="absolute top-1/3 -right-32 w-[500px] h-[500px]"
          style={{
            background: isDark
              ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)'
              : 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            filter: 'blur(50px)',
            opacity: isDark ? 0.5 : 0.65,
            animation: 'lava-morph-2 25s ease-in-out infinite',
          }}
        />

        <div
          className="absolute bottom-20 left-1/4 w-[450px] h-[450px]"
          style={{
            background: isDark
              ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)'
              : 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
            borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%',
            filter: 'blur(70px)',
            opacity: isDark ? 0.55 : 0.75,
            animation: 'lava-morph-3 22s ease-in-out infinite',
          }}
        />

        <div
          className="absolute top-1/2 right-1/4 w-[400px] h-[400px]"
          style={{
            background: isDark
              ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)'
              : 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)',
            borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
            filter: 'blur(55px)',
            opacity: isDark ? 0.45 : 0.6,
            animation: 'lava-morph-4 18s ease-in-out infinite',
          }}
        />

        <div
          className="absolute bottom-1/3 left-10 w-[350px] h-[350px]"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%',
            filter: 'blur(45px)',
            opacity: isDark ? 0.4 : 0.6,
            animation: 'lava-morph-5 24s ease-in-out infinite',
          }}
        />

        <div
          className="absolute top-1/4 right-1/5 w-[300px] h-[300px]"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #312e81 100%)'
              : 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)',
            borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%',
            filter: 'blur(40px)',
            opacity: isDark ? 0.35 : 0.65,
            animation: 'lava-morph-6 28s ease-in-out infinite',
          }}
        />

        <div
          className="absolute bottom-1/4 left-1/3 w-[280px] h-[280px]"
          style={{
            background: isDark
              ? 'linear-gradient(45deg, #1e3a8a 0%, #3730a3 100%)'
              : 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)',
            borderRadius: '40% 60% 50% 50% / 50% 40% 50% 60%',
            filter: 'blur(35px)',
            opacity: isDark ? 0.3 : 0.55,
            animation: 'lava-morph-7 30s ease-in-out infinite',
          }}
        />

        {/* Subtle overlay for depth */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)'
              : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)',
          }}
        />
      </div>

      {/* TOP RIGHT: Theme and Locale toggles */}
      <div className="absolute top-4 right-4 z-30 hidden md:flex items-center gap-3">
        <ThemeToggleSimple />
        <LocaleToggleSimple />
      </div>

      {/* MAIN: Centered Form with Logo */}
      <main className="w-full max-w-[480px] relative z-10">
        {/* Premium Glass Card Container */}
        <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-lg border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-10">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-10">
            <Logo variant={logoVariant} className="text-5xl mb-5" />
            <h1 className="text-[1.75rem] leading-tight premium-title premium-title-glow mb-2">{t("auth.completeProfile")}</h1>
            <p className="premium-subtitle text-sm text-center max-w-[280px]">
              {t("auth.completeProfileDescription")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-sm text-red-600 dark:text-red-400 flex items-center gap-3">
                <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={LABEL_BASE}>
                  {t("users.firstName")}
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={INPUT_BASE}
                  placeholder={t("common.placeholderName")}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className={LABEL_BASE}>
                  {t("users.lastName")}
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={INPUT_BASE}
                  placeholder={t("common.placeholderLastName")}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={LABEL_BASE}>
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${INPUT_BASE} pr-10`}
                  placeholder={t("auth.passwordFieldPlaceholder")}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4 strokeWidth={1.5}" /> : <Eye className="w-4 h-4 strokeWidth={1.5}" />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <PasswordRequirement label={t("auth.passwordReqMinLength")} met={req.hasMinLength} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <PasswordRequirement label={t("auth.passwordReqUppercase")} met={req.hasUppercase} />
                    <PasswordRequirement label={t("auth.passwordReqLowercase")} met={req.hasLowercase} />
                    <PasswordRequirement label={t("auth.passwordReqNumber")} met={req.hasNumber} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={LABEL_BASE}>
                {t("auth.confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={INPUT_BASE}
                placeholder={t("auth.passwordFieldPlaceholder")}
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {t("auth.passwordsDoNotMatch")}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" variant="white" />
              ) : (
                <>
                  {t("auth.completeRegistration")}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/90 dark:bg-slate-900/70 px-2 text-slate-500 dark:text-slate-400">{t("auth.orContinueWith")}</span>
            </div>
          </div>

          {/* OAuth Providers - Horizontal row */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              title={t("auth.continueWithGoogle")}
            >
              <FcGoogle className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin("microsoft")}
              className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              title={t("auth.continueWithMicrosoft")}
            >
              <FaMicrosoft className="h-6 w-6 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin("facebook")}
              className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              title={t("auth.continueWithFacebook")}
            >
              <FaSquareFacebook className="h-6 w-6 text-[#1877F2]" />
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline-offset-2 hover:underline transition-colors">
                {t("auth.signIn")}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer - Outside card, part of natural flow */}
        <div className="mt-8 mb-4 text-center">
          <div className="max-w-[480px] mx-auto space-y-3">
            <p className="text-xs text-black dark:text-slate-400">
              {t("auth.supportHint")}{" "}
              <a href="mailto:soporte@parkitcr.com" className="font-bold text-black dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline-offset-2 hover:underline transition-colors">
                {t("auth.supportLinkLabel")}
              </a>
            </p>

            <div className="flex items-center justify-center gap-3 text-[11px] text-black dark:text-slate-500">
              <span>© {new Date().getFullYear()} Parkit</span>
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
              <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {t("privacy.footerTerms")}
              </Link>
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
              <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {t("privacy.footerPrivacy")}
              </Link>
            </div>
          </div>
        </div>
      </main>
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
