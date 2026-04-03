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
  CheckCircle2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";
import { ThemeToggleSimple } from "@/components/ThemeToggleSimple";
import { LocaleToggleSimple } from "@/components/LocaleToggleSimple";

const REDIRECT_DELAY_SECONDS = 3;

const INPUT_BASE = "w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-text-primary text-sm transition-all duration-200 focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted/40";
const LABEL_BASE = "block text-sm font-medium text-text-secondary mb-1.5";

function PasswordRequirement({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
        met ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
      }`}>
        {met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
      </div>
      <span className={`${met ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-text-muted"}`}>
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
        <div className="w-full max-w-[360px] text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">{t("auth.registrationComplete")}</h1>
          <p className="text-sm text-text-muted mb-4">{t("auth.redirectingToLogin", { seconds: redirectSeconds })}</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((REDIRECT_DELAY_SECONDS - redirectSeconds) / REDIRECT_DELAY_SECONDS) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch bg-page overflow-hidden">
      
      {/* TOP RIGHT: Theme and Locale toggles */}
      <div className="absolute top-4 right-4 z-30 hidden md:flex items-center gap-3">
        <ThemeToggleSimple />
        <LocaleToggleSimple />
      </div>
      
      {/* LEFT PANEL: SPLATTER/DROPS DESIGN WITH ANIMATED GRADIENT */}
      <aside 
        className="hidden lg:flex relative flex-col justify-between w-1/2 p-16 select-none shadow-[20px_0_50px_rgba(0,0,0,0.3)] z-20 overflow-hidden"
      >
        
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Base gradient - theme aware with dramatic tone differences */}
          <div 
            className="absolute inset-0 transition-all duration-700 animate-gradient-flow"
            style={{
              backgroundImage: resolvedTheme === 'dark' 
                ? 'linear-gradient(135deg, #020617, #0f172a, #1e1b4b, #312e81, #1e1b4b, #0f172a, #020617)'
                : 'linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd, #60a5fa, #93c5fd, #bfdbfe, #dbeafe)',
              backgroundSize: '600% 600%',
            }}
          />
          
          {/* Theme-aware lava shapes */}
          <div 
            className="absolute -top-20 -left-20 w-[500px] h-[500px] transition-all duration-700"
            style={{
              background: resolvedTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(147, 197, 253, 0.5)',
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
              filter: 'blur(80px)',
              animation: 'lava-morph-1 12s ease-in-out infinite',
            }}
          />
          
          <div 
            className="absolute top-1/4 -right-20 w-[400px] h-[400px] transition-all duration-700"
            style={{
              background: resolvedTheme === 'dark' ? 'rgba(79, 70, 229, 0.25)' : 'rgba(191, 219, 254, 0.45)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              filter: 'blur(70px)',
              animation: 'lava-morph-2 14s ease-in-out infinite',
            }}
          />
          
          <div 
            className="absolute bottom-0 left-1/4 w-[450px] h-[450px] transition-all duration-700"
            style={{
              background: resolvedTheme === 'dark' ? 'rgba(67, 56, 202, 0.3)' : 'rgba(96, 165, 250, 0.5)',
              borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%',
              filter: 'blur(90px)',
              animation: 'lava-morph-3 16s ease-in-out infinite',
            }}
          />
          
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] transition-all duration-700"
            style={{
              background: resolvedTheme === 'dark' ? 'rgba(55, 48, 163, 0.2)' : 'rgba(59, 130, 246, 0.4)',
              borderRadius: '50% 60% 40% 50% / 40% 50% 60% 50%',
              filter: 'blur(100px)',
              animation: 'lava-morph-4 18s ease-in-out infinite',
            }}
          />
          
          <div 
            className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] transition-all duration-700"
            style={{
              background: resolvedTheme === 'dark' ? 'rgba(30, 27, 75, 0.35)' : 'rgba(37, 99, 235, 0.45)',
              borderRadius: '40% 50% 60% 40% / 50% 40% 50% 60%',
              filter: 'blur(60px)',
              animation: 'lava-morph-5 13s ease-in-out infinite',
            }}
          />
          
          <div 
            className="absolute top-1/3 right-1/3 w-[250px] h-[250px] transition-all duration-700"
            style={{
              background: resolvedTheme === 'dark' ? 'rgba(49, 46, 129, 0.3)' : 'rgba(29, 78, 216, 0.4)',
              borderRadius: '60% 30% 40% 60% / 30% 60% 50% 40%',
              filter: 'blur(50px)',
              animation: 'lava-morph-6 11s ease-in-out infinite',
            }}
          />
          
          <div 
            className="absolute bottom-1/3 left-10 w-[280px] h-[280px] transition-all duration-700"
            style={{
              background: resolvedTheme === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(147, 197, 253, 0.6)',
              borderRadius: '30% 60% 70% 40% / 60% 40% 30% 60%',
              filter: 'blur(65px)',
              animation: 'lava-morph-7 17s ease-in-out infinite',
            }}
          />
          
          {/* Overlay */}
          <div 
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: resolvedTheme === 'dark' ? 'rgba(2,6,23,0.1)' : 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(1px)',
            }} 
          />
        </div>

        {/* Top Section - Logo Only */}
        <div className="relative z-30">
          <Logo variant={logoVariant} className="text-3xl" />
        </div>

        {/* Center Section - Ultra Premium Design */}
        <div className="relative z-30 flex flex-col items-start justify-center flex-1">
          {/* Decorative line */}
          <div className="w-20 h-0.5 bg-gradient-to-r from-white/60 to-transparent mb-8" />
          
          {/* Main tagline */}
          <div className="space-y-2">
            <p className={`text-sm font-medium tracking-[0.3em] uppercase ${resolvedTheme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
              {t("auth.welcomeTo")}
            </p>
            <h2 className={`text-4xl xl:text-5xl font-black leading-tight tracking-tight ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t("auth.parking")}
              <span className={`block ${resolvedTheme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                {t("auth.reimagined")}
              </span>
            </h2>
          </div>
          
          {/* Description */}
          <p className={`mt-6 text-base font-light max-w-xs leading-relaxed ${resolvedTheme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
            {t("auth.premiumDescription")}
          </p>
          
          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            <span className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide ${resolvedTheme === 'dark' ? 'bg-white/10 text-white/80 border border-white/20' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
              {t("auth.smartParking")}
            </span>
            <span className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide ${resolvedTheme === 'dark' ? 'bg-white/10 text-white/80 border border-white/20' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
              {t("auth.realTime")}
            </span>
          </div>
        </div>
        
        {/* Bottom stats - Ultra minimal */}
        <div className="relative z-30 mt-auto">
          <div className="flex items-center gap-8">
            <div>
              <p className={`text-3xl font-black ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>10K+</p>
              <p className={`text-xs uppercase tracking-wider ${resolvedTheme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>{t("auth.users")}</p>
            </div>
            <div className={`w-px h-10 ${resolvedTheme === 'dark' ? 'bg-white/20' : 'bg-slate-300'}`} />
            <div>
              <p className={`text-3xl font-black ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>50+</p>
              <p className={`text-xs uppercase tracking-wider ${resolvedTheme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>{t("auth.cities")}</p>
            </div>
          </div>
        </div>

      </aside>

      {/* RIGHT PANEL: CLEAN FORM */}
      <main className="flex-1 flex flex-col items-center justify-center bg-page px-8 py-12 relative z-10">
        <div className="w-full max-w-[420px]">
          <div className="flex flex-col items-center mb-10">
            <div className="lg:hidden mb-8 text-center">
              <Logo variant={logoVariant} className="text-4xl inline-block" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">{t("auth.completeProfile")}</h1>
            <p className="mt-4 text-sm text-text-muted text-center">
              {t("auth.completeProfileDescription")}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-sm text-red-600 dark:text-red-400 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary transition-colors"
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Password Requirements */}
              {password && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
                  <p className="text-xs font-medium text-text-secondary mb-2">
                    {t("auth.passwordRequirements")}
                  </p>
                  <div className="space-y-1.5">
                    <PasswordRequirement 
                      label={t("auth.passwordReqMinLength")} 
                      met={req.minLength} 
                    />
                    <PasswordRequirement 
                      label={t("auth.passwordReqUppercase")} 
                      met={req.hasUppercase} 
                    />
                    <PasswordRequirement 
                      label={t("auth.passwordReqLowercase")} 
                      met={req.hasLowercase} 
                    />
                    <PasswordRequirement 
                      label={t("auth.passwordReqNumber")} 
                      met={req.hasNumber} 
                    />
                    <PasswordRequirement 
                      label={t("auth.passwordReqSpecial")} 
                      met={req.hasSpecialChar} 
                    />
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
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-company-primary py-3 text-sm font-medium text-white hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" variant="white" />
              ) : (
                <>
                  {t("auth.completeRegistration")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 text-center">
            <p className="text-sm text-text-muted">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link href="/login" className="font-medium text-company-primary hover:text-company-primary hover:underline transition-colors">
                {t("auth.signIn")}
              </Link>
            </p>
          </div>
        </div>

        <footer className="absolute bottom-0 left-0 right-0 py-4 text-center">
          <p className="text-xs text-text-muted">
            {t("auth.supportHint")}{" "}
            <a
              href="mailto:soporte@parkit.app"
              className="font-medium text-company-primary hover:text-company-primary underline-offset-2 hover:underline transition-colors"
            >
              {t("auth.supportLinkLabel")}
            </a>
          </p>
        </footer>
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