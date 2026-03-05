"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
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
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container-narrow py-12">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                {superAdmin ? "Companies" : "My company"}
              </h1>
              {superAdmin && (
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Company</span>
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading companies...</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Name</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Email</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Status</th>
                      <th className="text-right px-6 py-3 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {companies.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">
                          No companies found
                        </td>
                      </tr>
                    ) : (
                      companies.map((company: any) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{company.name || company.commercialName || company.legalName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{company.email || company.billingEmail || "N/A"}</td>
                          <td className="px-6 py-4">
                            <span className="badge-success">
                              {company.status || "ACTIVE"}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex justify-end space-x-2">
                            <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                              <Trash2 className="w-4 h-4 text-red-600" />
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
