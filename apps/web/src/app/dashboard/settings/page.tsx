"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
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
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-10">
              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                Company Settings
              </h1>
              <p className="text-slate-400 text-sm">
                Manage your account configuration and billing details.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden backdrop-blur-sm p-8 relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />

                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    <Building2 className="w-8 h-8 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {company?.commercialName || "Your Company"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400/90">
                        {company?.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Legal Name
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-medium">
                      {company?.legalName || "Not configured"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Commercial Name
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-medium">
                      {company?.commercialName || "Not configured"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Billing Email
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-medium flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {company?.billingEmail || "Not configured"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Contact Phone
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-medium flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {company?.contactPhone || "Not configured"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
