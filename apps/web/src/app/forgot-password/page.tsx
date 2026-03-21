"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">

      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center mb-10">
          <Logo variant={logoVariant} className="text-4xl" />
          <p className="mt-4 text-sm text-text-muted">
            {submitted
              ? t("auth.resetSubmittedMessage").replace("{{email}}", email)
              : t("auth.resetPasswordDescription")}
          </p>
        </div>

        {submitted ? (
          <div className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-company-primary hover:text-company-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("auth.backToSignIn")}
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div
                className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
                  {t("auth.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-company-primary py-3 text-sm font-medium text-white hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? <LoadingSpinner size="sm" variant="white" /> : t("auth.sendResetLink")}
              </button>
            </form>
            <Link
              href="/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("auth.backToSignIn")}
            </Link>
          </>
        )}
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
