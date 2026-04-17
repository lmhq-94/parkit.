"use client";

import { useState, useEffect, Suspense } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowRight, CheckCircle, Mail, Building2, User } from "@/lib/premiumIcons";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageLoader } from "@/components/PageLoader";
import { ThemeToggleSimple } from "@/components/ThemeToggleSimple";
import { LocaleToggle } from "@/components/LocaleToggle";

function RequestAccessForm() {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  const logoVariant = mounted && resolvedTheme === "dark" ? "onDark" : "default";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      setError(t("auth.requiredFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Send request access email to support
      await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSuccess(true);
    } catch (err) {
      setError(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = mounted && resolvedTheme === "dark";

  if (success) {
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
          <LocaleToggle />
        </div>

        <main className="w-full max-w-[480px] relative z-10">
          <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-lg border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-10 text-center">
            <Logo variant={logoVariant} className="text-5xl mx-auto mb-6" />
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle className="w-8 h-8" />
            </span>
            <h1 className="text-[1.35rem] premium-title mb-2">{t("auth.requestAccessSuccess")}</h1>
            <p className="premium-subtitle text-sm mb-6">{t("auth.requestAccessSuccessDescription")}</p>
            <a href="mailto:soporte@parkitcr.com" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              <Mail className="w-4 h-4" />
              {t("auth.contactSupport")}
            </a>
          </div>
        </main>
      </div>
    );
  }

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
        <Link href="/terms" className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
          {t("privacy.footerTerms")}
        </Link>
        <span className="text-slate-400 dark:text-slate-500">•</span>
        <Link href="/privacy" className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
          {t("privacy.footerPrivacy")}
        </Link>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
        <ThemeToggleSimple />
        <LocaleToggle />
      </div>

      <main className="w-full max-w-[480px] relative z-10">
        {/* Premium Glass Card Container */}
        <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-lg border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-10">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-10">
            <Logo variant={logoVariant} className="text-5xl mb-5" />
            <h1 className="text-[1.75rem] leading-tight premium-title premium-title-glow mb-2">{t("auth.requestAccessTitle")}</h1>
            <p className="premium-subtitle text-sm text-center">{t("auth.requestAccessDescription")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t("auth.name")}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm transition-all duration-200 ease-out focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:ring-inset placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder={t("auth.namePlaceholder")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm transition-all duration-200 ease-out focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:ring-inset placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder={t("auth.emailPlaceholder")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t("auth.company")}</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm transition-all duration-200 ease-out focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:ring-inset placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder={t("auth.companyPlaceholder")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t("auth.message")}</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm transition-all duration-200 ease-out focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:ring-inset placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                placeholder={t("auth.messagePlaceholder")}
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="group w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-all">
              {isSubmitting ? <LoadingSpinner size="sm" variant="white" /> : <>{t("auth.sendRequest")}<ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" /></>}
            </button>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </div>
            )}

            <p className="text-center">
              <a href="/login" className="group text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1">
                {t("auth.backToSignIn")}
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </p>
          </form>
        </div>

        {/* Minimal Footer */}
        <div className="mt-6 text-center">
          <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} Parkit. {t("footer.allRightsReserved")}</p>
        </div>
      </main>
    </div>
  );
}

export default function RequestAccessPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RequestAccessForm />
    </Suspense>
  );
}
