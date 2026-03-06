"use client";

import { useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { apiClient } from "@/lib/api";

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
  const { t, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const superAdmin = isSuperAdmin(user);

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
          c.name || c.commercialName || c.legalName || "N/A",
      },
      {
        header: t("tables.companies.email"),
        render: (c: Company) => c.email || c.billingEmail || "N/A",
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
    : t("tables.companies.descriptionMyCompany");

  return (
    <DashboardDataTablePage<Company>
      title={title}
      description={description}
      endpoint="/companies"
      fetchData={fetchData}
      columns={columns}
      emptyMessage={t("tables.companies.empty")}
    />
  );
}
