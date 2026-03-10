"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageLoader } from "@/components/PageLoader";

const DashboardDataTablePage = dynamic(
  () => import("@/components/DashboardDataTablePage").then((m) => ({ default: m.DashboardDataTablePage })),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center p-8"><PageLoader /></div> }
);
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { formatPhoneWithCountryCode } from "@/lib/inputMasks";
import { StatusFilterToolbar } from "@/components/StatusFilterToolbar";

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

const COMPANY_STATUS_OPTIONS = [
  { value: "PENDING", key: "PENDING" },
  { value: "ACTIVE", key: "ACTIVE" },
  { value: "SUSPENDED", key: "SUSPENDED" },
  { value: "INACTIVE", key: "INACTIVE" },
] as const;

export default function CompaniesPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyId = useDashboardStore((s) => s.selectedCompanyId);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const bumpCompanies = useDashboardStore((s) => s.bumpCompanies);
  const setSelectedCompany = useDashboardStore((s) => s.setSelectedCompany);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const fetchData = useCallback(
    async (_userId: string): Promise<Company[]> => {
      const u = useAuthStore.getState().user;
      if (isSuperAdmin(u)) {
        const params =
          statusFilters.length > 0
            ? statusFilters.map((s) => `status=${encodeURIComponent(s)}`).join("&")
            : "";
        const url = params ? `/companies?${params}` : "/companies";
        const data = await apiClient.get<Company[]>(url);
        return Array.isArray(data) ? data : [];
      }
      const data = await apiClient.get<Company>("/companies/me");
      return data ? [data] : [];
    },
    [statusFilters]
  );

  const columns = useMemo(
    () => [
      {
        header: t("tables.companies.name"),
        render: (c: Company) =>
          c.name ?? c.commercialName ?? c.legalName ?? "—",
        field: "commercialName" as const,
        editable: true,
        valueGetter: (c: Company) =>
          c.name ?? c.commercialName ?? c.legalName ?? "",
        valueSetter: (c: Company, v: unknown) => {
          c.commercialName = String(v ?? "").trim() || undefined;
        },
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
        field: "status" as const,
        editable: superAdmin,
        statusBadge: "company",
        statusField: "status",
        cellEditorValues: ["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"],
        cellEditorLabels: [
          tEnum("companyStatus", "PENDING"),
          tEnum("companyStatus", "ACTIVE"),
          tEnum("companyStatus", "SUSPENDED"),
          tEnum("companyStatus", "INACTIVE"),
        ],
      },
    ],
    [t, tEnum, superAdmin]
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
        status?: string;
      } = {};
      if (row.legalName !== undefined) payload.legalName = String(row.legalName).trim();
      if (row.commercialName !== undefined) payload.commercialName = String(row.commercialName).trim();
      if (row.email !== undefined) payload.email = String(row.email).trim() || undefined;
      if (row.contactPhone !== undefined) payload.contactPhone = String(row.contactPhone).trim();
      if (row.legalAddress !== undefined) payload.legalAddress = String(row.legalAddress).trim();
      if (row.status !== undefined && superAdmin) payload.status = row.status;
      if (Object.keys(payload).length === 0) return;
      if (superAdmin) {
        await apiClient.patch(`/companies/${row.id}`, payload);
        // Si el super admin está editando la empresa seleccionada, actualizar el nombre en el selector.
        if (row.id === selectedCompanyId) {
          const newName =
            (payload.commercialName as string | undefined)?.trim() ||
            (payload.legalName as string | undefined)?.trim() ||
            row.commercialName?.trim() ||
            row.legalName?.trim() ||
            row.name?.trim() ||
            row.id;
          setSelectedCompany(row.id, newName);
        }
      } else {
        const { status: _s, ...mePayload } = payload;
        if (Object.keys(mePayload).length > 0) {
          await apiClient.patch("/companies/me", mePayload);
        }
      }
      bumpCompanies();
      setRefreshToken((x) => x + 1);
    },
    [superAdmin, bumpCompanies, selectedCompanyId, setSelectedCompany]
  );

  return (
    <>
      <DashboardDataTablePage<Company>
        title={title}
        description={description}
        endpoint="/companies"
        fetchData={fetchData}
        columns={columns}
        refreshToken={refreshToken}
        emptyMessage={t("tables.companies.empty")}
        toolbar={
          superAdmin ? (
            <StatusFilterToolbar
              tableKey="companies"
              allLabel={t("tables.companies.filterAll")}
              placeholder={t("tables.companies.filterStatusPlaceholder")}
              clearSelectionLabel={t("grid.clearSelection")}
              options={COMPANY_STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: tEnum("companyStatus", o.key),
              }))}
              selected={statusFilters}
              onChange={setStatusFilters}
            />
          ) : undefined
        }
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
            <DetailField label={t("companies.legalAddress")} value={company.legalAddress} wide multiline />
            <DetailField label={t("companies.contactPhone")} value={company.contactPhone ? formatPhoneWithCountryCode(company.contactPhone, company.countryCode ?? "CR") : undefined} linkType="phone" />
            <DetailField label={t("companies.countryCode")} value={company.countryCode} />
            <DetailField label={t("companies.currency")} value={company.currency} />
            <DetailField label={t("companies.timezone")} value={company.timezone} />
          </dl>
        )}
        onEdit={superAdmin ? (row) => router.push(`/dashboard/companies/${row.id}/edit`) : undefined}
        onUpdate={onUpdate}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/companies/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors shadow-sm"
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
