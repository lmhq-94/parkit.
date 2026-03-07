"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { formatPhoneWithCountryCode } from "@/lib/inputMasks";

interface Company {
  id: string;
  legalName?: string;
  commercialName?: string;
  legalAddress?: string;
  taxId?: string;
  countryCode?: string;
  currency?: string;
  timezone?: string;
  email?: string;
  contactPhone?: string;
  status?: string;
  name?: string;
}

export default function CompaniesPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const bumpCompanies = useDashboardStore((s) => s.bumpCompanies);
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
          c.name ?? c.commercialName ?? c.legalName ?? "—",
        field: "commercialName" as const,
        editable: true,
      },
      {
        header: t("tables.companies.email"),
        render: (c: Company) => c.email ?? "—",
        field: "email" as const,
        editable: true,
        linkType: "email",
      },
      {
        header: t("tables.companies.status"),
        render: (c: Company) => tEnum("companyStatus", c.status),
        statusBadge: "company",
        statusField: "status",
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
        email?: string;
        contactPhone?: string;
        legalAddress?: string;
      } = {};
      if (row.legalName !== undefined) payload.legalName = String(row.legalName).trim();
      if (row.commercialName !== undefined) payload.commercialName = String(row.commercialName).trim();
      if (row.email !== undefined) payload.email = String(row.email).trim() || undefined;
      if (row.contactPhone !== undefined) payload.contactPhone = String(row.contactPhone).trim();
      if (row.legalAddress !== undefined) payload.legalAddress = String(row.legalAddress).trim();
      if (Object.keys(payload).length === 0) return;
      if (superAdmin) {
        await apiClient.patch(`/companies/${row.id}`, payload);
      } else {
        await apiClient.patch("/companies/me", payload);
      }
      bumpCompanies();
    },
    [superAdmin, bumpCompanies]
  );

  const onDelete = useCallback(async (row: Company) => {
    if (!row.id) return;
    await apiClient.delete(`/companies/${row.id}`);
    bumpCompanies();
  }, [bumpCompanies]);

  return (
    <>
      <DashboardDataTablePage<Company>
        title={title}
        description={description}
        endpoint="/companies"
        fetchData={fetchData}
        columns={columns}
        emptyMessage={t("tables.companies.empty")}
        hasRowDetail={(company) =>
          (company.legalName != null && company.legalName !== "") ||
          (company.taxId != null && company.taxId !== "") ||
          (company.legalAddress != null && company.legalAddress !== "") ||
          (company.contactPhone != null && company.contactPhone !== "") ||
          (company.countryCode != null && company.countryCode !== "") ||
          (company.currency != null && company.currency !== "") ||
          (company.timezone != null && company.timezone !== "")
        }
        renderRowDetail={(company) => (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
            <DetailSectionLabel text={t("common.additionalInfo")} />
            <DetailField label={t("companies.legalName")} value={company.legalName} />
            <DetailField label={t("companies.taxId")} value={company.taxId} />
            <DetailField label={t("companies.legalAddress")} value={company.legalAddress} />
            <DetailField label={t("companies.contactPhone")} value={company.contactPhone ? formatPhoneWithCountryCode(company.contactPhone, company.countryCode ?? "CR") : undefined} linkType="phone" />
            <DetailField label={t("companies.countryCode")} value={company.countryCode} />
            <DetailField label={t("companies.currency")} value={company.currency} />
            <DetailField label={t("companies.timezone")} value={company.timezone} />
          </dl>
        )}
        onEdit={superAdmin ? (row) => router.push(`/dashboard/companies/${row.id}/edit`) : undefined}
        onUpdate={onUpdate}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? (row) => t("tables.companies.confirmDeleteItem").replace(/\{\{item\}\}/g, row.name ?? row.commercialName ?? row.legalName ?? "—") : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/companies/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" strokeWidth={2.25} />
              {t("common.add")}
            </Link>
          ) : undefined
        }
      />
    </>
  );
}
