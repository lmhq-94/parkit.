"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import { Building2, Mail, Phone, ShieldCheck } from "lucide-react";

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
    <div className="pt-0 px-6 md:px-10 lg:px-12 pb-6 md:pb-10 lg:pb-12 max-w-[1600px] mx-auto">
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
              </>
            )}
    </div>
  );
}
