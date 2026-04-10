"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { checkPasswordRequirements, isPasswordSecure } from "@parkit/shared";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, Check, Circle } from "@/lib/premiumIcons";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";
import { ThemeToggleSimple } from "@/components/ThemeToggleSimple";
import { LocaleToggleSimple } from "@/components/LocaleToggleSimple";

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
      setRedirectSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [success, router]);

  useEffect(() => {
    if (!success) return;
    if (redirectSeconds <= 0) {
      router.push("/login");
    }
  }, [success, redirectSeconds, router]);

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

  // Prevent hydration mismatch
  const isDark = mounted && resolvedTheme === 'dark';

  // Background JSX element to reuse
  const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)' }} />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px]" style={{ background: isDark ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(60px)', opacity: isDark ? 0.6 : 0.7, animation: 'lava-morph-1 20s ease-in-out infinite' }} />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px]" style={{ background: isDark ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)' : 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(50px)', opacity: isDark ? 0.5 : 0.65, animation: 'lava-morph-2 25s ease-in-out infinite' }} />
      <div className="absolute bottom-20 left-1/4 w-[450px] h-[450px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' : 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', filter: 'blur(70px)', opacity: isDark ? 0.55 : 0.75, animation: 'lava-morph-3 22s ease-in-out infinite' }} />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px]" style={{ background: isDark ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' : 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(55px)', opacity: isDark ? 0.45 : 0.6, animation: 'lava-morph-4 18s ease-in-out infinite' }} />
      <div className="absolute bottom-1/3 left-10 w-[350px] h-[350px]" style={{ background: isDark ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%', filter: 'blur(45px)', opacity: isDark ? 0.4 : 0.6, animation: 'lava-morph-5 24s ease-in-out infinite' }} />
      <div className="absolute top-1/4 right-1/5 w-[300px] h-[300px]" style={{ background: isDark ? 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #312e81 100%)' : 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)', borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%', filter: 'blur(40px)', opacity: isDark ? 0.35 : 0.65, animation: 'lava-morph-6 28s ease-in-out infinite' }} />
      <div className="absolute bottom-1/4 left-1/3 w-[280px] h-[280px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e3a8a 0%, #3730a3 100%)' : 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)', borderRadius: '40% 60% 50% 50% / 50% 40% 50% 60%', filter: 'blur(35px)', opacity: isDark ? 0.3 : 0.55, animation: 'lava-morph-7 30s ease-in-out infinite' }} />
      <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)' : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)' }} />
    </div>
  );

  const TopRightToggles = () => (
    <div className="absolute top-4 right-4 z-30 hidden md:flex items-center gap-3">
      <ThemeToggleSimple />
      <LocaleToggleSimple />
    </div>
  );

  const BottomSection = () => (
    <div className="fixed bottom-0 left-0 right-0 py-4 px-4 text-center z-20">
      <div className="max-w-[480px] mx-auto space-y-2">
        <p className="text-xs text-slate-600 dark:text-slate-400">{t("auth.supportHint")}{" "}<a href="mailto:soporte@parkitcr.com" className="font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline-offset-2 hover:underline transition-colors">{t("auth.supportLinkLabel")}</a></p>
        <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
          <span>© {new Date().getFullYear()} Parkit. {t("footer.allRightsReserved")}</span>
          <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
          <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">{t("footer.terms")}</Link>
          <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
          <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">{t("footer.privacyPolicy")}</Link>
        </div>
      </div>
    </div>
  );

  if (!token?.trim()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
        <AnimatedBackground />
        <TopRightToggles />
        <main className="w-full max-w-[480px] relative z-10">
          <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-lg border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-10 text-center">
            <Logo variant={logoVariant} className="text-5xl mx-auto mb-6" />
            <p className="text-slate-600 dark:text-slate-300 mb-6">{t("auth.inviteExpiredOrInvalid")}</p>
            <Link href="/login" className="group inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium">
              {t("auth.backToSignIn")}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <BottomSection />
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
        <AnimatedBackground />
        <TopRightToggles />
        <main className="w-full max-w-[480px] relative z-10">
          <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-lg border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-10 text-center">
            <Logo variant={logoVariant} className="text-5xl mx-auto mb-6" />
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle className="w-8 h-8" />
            </span>
            <h1 className="text-[1.35rem] premium-title mb-2">{t("auth.passwordSetSuccess")}</h1>
            <p className="premium-subtitle text-sm mb-6">{t("auth.redirectingToLogin", { seconds: redirectSeconds })}</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              {t("auth.backToSignIn")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <BottomSection />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <AnimatedBackground />
      <TopRightToggles />
      
      <main className="w-full max-w-[480px] relative z-10">
        <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-lg border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-10">
          <div className="flex flex-col items-center mb-10">
            <Logo variant={logoVariant} className="text-5xl mb-5" />
            <h1 className="text-[1.75rem] leading-tight premium-title premium-title-glow mb-2">{t("auth.acceptInviteTitle")}</h1>
            <p className="premium-subtitle text-sm text-center">{t("auth.acceptInviteDescription")}</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t("auth.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">{t("auth.passwordRequirements")}</p>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">{req.minLength ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />}{t("auth.passwordReqMinLength")}</li>
                <li className="flex items-center gap-2">{req.hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />}{t("auth.passwordReqUppercase")}</li>
                <li className="flex items-center gap-2">{req.hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />}{t("auth.passwordReqLowercase")}</li>
                <li className="flex items-center gap-2">{req.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />}{t("auth.passwordReqNumber")}</li>
              </ul>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t("auth.confirmPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="group w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-all">
              {isSubmitting ? <LoadingSpinner size="sm" variant="white" /> : <>{t("auth.setPassword")}<ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" /></>}
            </button>

            <p className="text-center">
              <Link href="/login" className="group text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1">
                {t("auth.backToSignIn")}
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </p>
          </form>
        </div>
        <BottomSection />
      </main>
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
