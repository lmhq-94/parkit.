"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import Link from "next/link";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface Company {
  id: string;
  commercialName?: string;
  legalName?: string;
  name?: string;
  email?: string;
  billingEmail?: string;
  status?: string;
}

export default function CompaniesPage() {
  const { user } = useAuthStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const superAdmin = isSuperAdmin(user);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        if (superAdmin) {
          const data = await apiClient.get<Company[]>("/companies");
          setCompanies(Array.isArray(data) ? data : []);
        } else {
          const data = await apiClient.get<Company>("/companies/me");
          setCompanies(data ? [data] : []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch companies");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [user, superAdmin]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  {superAdmin ? "Companies" : "My company"}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {superAdmin ? "Manage all companies" : "Your company details"}
                </p>
              </div>
              {superAdmin && (
                <Link
                  href="/dashboard/companies/new"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
                >
                  <Plus className="w-4 h-4" />
                  New Company
                </Link>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden backdrop-blur-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {companies.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-slate-500 text-sm">
                          No companies found
                        </td>
                      </tr>
                    ) : (
                      companies.map((company) => (
                        <tr key={company.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-4 font-medium text-white">
                            {company.name || company.commercialName || company.legalName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {company.email || company.billingEmail || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              {company.status || "ACTIVE"}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex justify-end gap-1">
                            <button className="p-2 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-sky-400 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
