"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const logoVariant = mounted && resolvedTheme === "dark" ? "onDark" : "default";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <LocaleToggle />
      </div>

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
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-company-primary py-3 text-sm font-medium text-white hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page"
              >
                {t("auth.sendResetLink")}
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
    </div>
  );
}
