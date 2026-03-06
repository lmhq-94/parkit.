"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { apiClient } from "@/lib/api";

interface Company {
  id: string;
  legalName?: string;
  commercialName?: string;
  legalAddress?: string;
  taxId?: string;
  countryCode?: string;
  currency?: string;
  timezone?: string;
  billingEmail?: string;
  contactPhone?: string;
  status?: string;
  name?: string;
  email?: string;
}

export default function CompaniesPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();

  const fetchData = useMemo(
    () => async (_userId: string): Promise<Company[]> => {
      const u = useAuthStore.getState().user;
      if (isSuperAdmin(u)) {
        const data = await apiClient.get<Company[]>("/companies");
        return Array.isArray(data) ? data : [];
      }
      const data = await apiClient.get<Company>("/companies/me");
      return data ? [data] : [];
    },
    []
  );

  const columns = useMemo(
    () => [
      {
        header: t("tables.companies.name"),
        render: (c: Company) =>
          c.name ?? c.commercialName ?? c.legalName ?? "N/A",
        field: "commercialName" as const,
        editable: true,
      },
      {
        header: t("tables.companies.email"),
        render: (c: Company) => c.email ?? c.billingEmail ?? "N/A",
        field: "billingEmail" as const,
        editable: true,
      },
      {
        header: t("tables.companies.status"),
        render: (c: Company) => tEnum("companyStatus", c.status),
      },
    ],
    [t, tEnum]
  );

  const title = superAdmin
    ? t("tables.companies.title")
    : t("tables.companies.titleMyCompany");
  const description = superAdmin
    ? t("tables.companies.description")
    : tWithCompany("tables.companies.descriptionMyCompany", selectedCompanyName);

  const onUpdate = useCallback(
    async (row: Company) => {
      if (!row.id) return;
      const payload: {
        legalName?: string;
        commercialName?: string;
        billingEmail?: string;
        contactPhone?: string;
        legalAddress?: string;
      } = {};
      if (row.legalName !== undefined) payload.legalName = String(row.legalName).trim();
      if (row.commercialName !== undefined) payload.commercialName = String(row.commercialName).trim();
      if (row.billingEmail !== undefined) payload.billingEmail = String(row.billingEmail).trim() || undefined;
      if (row.contactPhone !== undefined) payload.contactPhone = String(row.contactPhone).trim();
      if (row.legalAddress !== undefined) payload.legalAddress = String(row.legalAddress).trim();
      if (Object.keys(payload).length === 0) return;
      if (superAdmin) {
        await apiClient.patch(`/companies/${row.id}`, payload);
      } else {
        await apiClient.patch("/companies/me", payload);
      }
    },
    [superAdmin]
  );

  const onDelete = useCallback(async (row: Company) => {
    if (!row.id) return;
    await apiClient.delete(`/companies/${row.id}`);
  }, []);

  return (
    <>
      <DashboardDataTablePage<Company>
        title={title}
        description={description}
        endpoint="/companies"
        fetchData={fetchData}
      columns={columns}
      emptyMessage={t("tables.companies.empty")}
      onEdit={superAdmin ? (row) => router.push(`/dashboard/companies/${row.id}/edit`) : undefined}
      onUpdate={onUpdate}
      onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? () => t("tables.companies.confirmDelete") : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/companies/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
            >
              {t("common.add")}
            </Link>
          ) : undefined
        }
      />
    </>
  );
}
