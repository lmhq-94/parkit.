"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { Building2, Mail, Phone, ShieldCheck, Sun, Globe } from "lucide-react";

interface CompanyProfile {
  id: string;
  legalName?: string;
  commercialName?: string;
  billingEmail?: string;
  contactPhone?: string;
  status?: string;
}

export default function SettingsPage() {
  const { t, tEnum } = useTranslation();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiClient.get<CompanyProfile>("/companies/me");
        setCompany(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-page">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto">
            <div className="mb-10">
              <h1 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight mb-2">
                {t("settings.title")}
              </h1>
              <p className="text-text-secondary text-sm">
                {t("settings.description")}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Company info (first) */}
                <div className="relative rounded-2xl border border-card-border bg-card overflow-hidden backdrop-blur-sm mb-8">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
                  <div className="px-6 py-4 border-b border-card-border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-text-primary truncate">
                        {company?.commercialName || company?.legalName || "Your Company"}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400/90">
                          {tEnum("companyStatus", company?.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                          {t("settings.legalName")}
                        </label>
                        <div className="px-4 py-3 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary font-medium">
                          {company?.legalName || t("settings.notConfigured")}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                          {t("settings.commercialName")}
                        </label>
                        <div className="px-4 py-3 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary font-medium">
                          {company?.commercialName || t("settings.notConfigured")}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                          {t("settings.billingEmail")}
                        </label>
                        <div className="px-4 py-3 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-text-muted shrink-0" />
                          <span className="truncate">{company?.billingEmail || t("settings.notConfigured")}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                          {t("settings.contactPhone")}
                        </label>
                        <div className="px-4 py-3 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-text-muted shrink-0" />
                          <span className="truncate">{company?.contactPhone || t("settings.notConfigured")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* App preferences (after company info) - sin overflow-hidden para que el dropdown de idioma se vea */}
                <div className="relative rounded-2xl border border-card-border bg-card backdrop-blur-sm">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
                  <div className="px-6 py-4 border-b border-card-border">
                    <h2 className="text-base font-semibold text-text-primary">{t("settings.appPreferences")}</h2>
                    <p className="text-xs text-text-muted mt-0.5">{t("settings.appPreferencesDescription")}</p>
                  </div>
                  <div className="divide-y divide-card-border">
                    <div className="flex items-center justify-between gap-4 px-6 py-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 flex items-center justify-center shrink-0">
                          <Sun className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary">{t("settings.theme")}</p>
                          <p className="text-xs text-text-muted mt-0.5">{t("settings.themeDescription")}</p>
                        </div>
                      </div>
                      <ThemeToggle />
                    </div>
                    <div className="flex items-center justify-between gap-4 px-6 py-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary">{t("settings.language")}</p>
                          <p className="text-xs text-text-muted mt-0.5">{t("settings.languageDescription")}</p>
                        </div>
                      </div>
                      <LocaleToggle />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
