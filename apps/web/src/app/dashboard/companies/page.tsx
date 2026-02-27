"use client";

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { Building2 } from "lucide-react";

interface Company {
  id: string;
  legalName?: string;
  commercialName?: string;
  billingEmail?: string;
  contactPhone?: string;
  status?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        try {
          const list = await apiClient.get<Company[]>("/companies");
          setCompanies(Array.isArray(list) ? list : []);
        } catch (err) {
          const axiosErr = err as AxiosError;
          if (axiosErr.response?.status === 403) {
            const me = await apiClient.get<Company>("/companies/me");
            setCompanies(me ? [me] : []);
          } else {
            throw err;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch companies");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container-narrow py-12">
            <div className="flex items-center space-x-3 mb-8">
              <h1 className="text-3xl font-bold">Companies</h1>
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
                      <th className="text-left px-6 py-3 font-semibold text-sm">Commercial Name</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Legal Name</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Billing Email</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Phone</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {companies.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No companies found
                        </td>
                      </tr>
                    ) : (
                      companies.map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{company.commercialName || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{company.legalName || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{company.billingEmail || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{company.contactPhone || "N/A"}</td>
                          <td className="px-6 py-4">
                            <span className="badge-success">
                              {company.status || "ACTIVE"}
                            </span>
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
