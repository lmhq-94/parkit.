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
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 bg-slate-50 dark:bg-[#060813] min-h-screen transition-colors duration-300">
          <div className="p-6 md:p-10 lg:p-12 max-w-4xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Company Settings
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Manage your account configuration and billing details.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5 relative z-10 p-8">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                
                <div className="flex items-center space-x-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                    <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {company?.commercialName || "Your Company"}
                    </h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {company?.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Legal Name
                    </label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                      {company?.legalName || "Not configured"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Commercial Name
                    </label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                      {company?.commercialName || "Not configured"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Billing Email
                    </label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{company?.billingEmail || "Not configured"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Contact Phone
                    </label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{company?.contactPhone || "Not configured"}</span>
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
