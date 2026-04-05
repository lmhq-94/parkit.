"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemeToggleSimple } from "@/components/ThemeToggleSimple";
import { LocaleToggleSimple } from "@/components/LocaleToggleSimple";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);
  const logoVariant = mounted && resolvedTheme === "dark" ? "onDark" : "default";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(getTranslatedApiErrorMessage(err, t) || t("apiErrors.requestFailed"));
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
        <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)' }} />

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

      {/* MAIN */}
      <main className="w-full max-w-[480px] relative z-10">
        {/* Premium Glass Card Container */}
        <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-10">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-10">
            <Logo variant={logoVariant} className="text-5xl mb-5" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("auth.resetPasswordTitle")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{submitted ? t("auth.resetSubmittedMessage").replace("{{email}}", email) : t("auth.resetPasswordDescription")}</p>
          </div>

          {submitted ? (
            <div className="flex justify-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {t("auth.backToSignIn")}
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t("auth.email")}</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-all">
                  {isSubmitting ? <LoadingSpinner size="sm" variant="white" /> : t("auth.sendResetLink")}
                </button>
              </form>
              <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {t("auth.backToSignIn")}
              </Link>
            </>
          )}
        </div>

        {/* Footer - Outside card, part of natural flow */}
        <div className="mt-8 mb-4 text-center">
          <div className="max-w-[480px] mx-auto space-y-3">
            <p className="text-xs text-black dark:text-slate-400">
              {t("auth.supportHint")}{" "}
              <a href="mailto:soporte@parkit.app" className="font-bold text-black dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline-offset-2 hover:underline transition-colors">
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
