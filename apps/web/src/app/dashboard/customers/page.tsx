"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Mail, Plus } from "lucide-react";
import type { ICellRendererParams } from "ag-grid-community";
import { PageLoader } from "@/components/PageLoader";
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { StatusFilterToolbar } from "@/components/StatusFilterToolbar";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { formatPhoneInternational } from "@/lib/inputMasks";
import { formatDateTimeDisplay } from "@/lib/dateFormat";
import { useRouter } from "next/navigation";

const DashboardDataTablePage = dynamic(
  () => import("@/components/DashboardDataTablePage").then((m) => ({ default: m.DashboardDataTablePage })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center p-8">
        <PageLoader />
      </div>
    ),
  }
);

const CUSTOMER_STATUS_OPTIONS = [
  { value: "ACTIVE", labelKey: "tables.employees.active" },
  { value: "INACTIVE", labelKey: "tables.employees.inactive" },
  { value: "PENDING", labelKey: "tables.employees.pendingInvitation" },
] as const;

function UserStatusCellRenderer(
  params: ICellRendererParams<{ isActive?: boolean; pendingInvitation?: boolean }> & { t: (key: string) => string }
) {
  const { data, t } = params;
  if (!data) return null;
  if (data.pendingInvitation) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
        {t("tables.employees.pendingInvitation")}
      </span>
    );
  }
  const active = data.isActive;
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm ${
        active ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
      {active ? t("tables.employees.active") : t("tables.employees.inactive")}
    </span>
  );
}

type UserRow = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  systemRole?: string;
  isActive?: boolean;
  pendingInvitation?: boolean;
  phone?: string | null;
  timezone?: string | null;
  lastLogin?: string | null;
  companyId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function CustomersPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const router = useRouter();

  const onUpdate = useCallback(async (row: UserRow) => {
    if (!row.id) return;
    const payload: Record<string, unknown> = {};
    if (row.firstName !== undefined) payload.firstName = String(row.firstName).trim();
    if (row.lastName !== undefined) payload.lastName = String(row.lastName).trim();
    if (row.email !== undefined) payload.email = String(row.email).trim();
    if (row.isActive !== undefined) payload.isActive = row.isActive === true || row.isActive === "true";
    if (Object.keys(payload).length === 0) return;
    await apiClient.patch(`/users/${row.id}`, payload);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: t("tables.employees.firstName"),
        render: (user: { firstName?: string }) => user.firstName || "—",
        field: "firstName" as const,
        editable: true,
      },
      {
        header: t("tables.employees.lastName"),
        render: (user: { lastName?: string }) => user.lastName || "—",
        field: "lastName" as const,
        editable: true,
      },
      {
        header: t("tables.employees.email"),
        render: (user: { email?: string }) => user.email || "—",
        field: "email" as const,
        editable: true,
        linkType: "email",
      },
      {
        header: t("tables.employees.status"),
        render: (user: { isActive?: boolean; pendingInvitation?: boolean }) =>
          user.pendingInvitation
            ? t("tables.employees.pendingInvitation")
            : user.isActive
              ? t("tables.employees.active")
              : t("tables.employees.inactive"),
        field: "isActive" as const,
        editable: (user) => !user.pendingInvitation,
        cellEditorValues: [t("tables.employees.active"), t("tables.employees.inactive")],
        valueGetter: (user) =>
          user.isActive ? t("tables.employees.active") : t("tables.employees.inactive"),
        valueSetter: (user, v) => {
          (user as Record<string, unknown>).isActive = v === t("tables.employees.active");
        },
        cellRenderer: UserStatusCellRenderer,
        cellRendererParams: { t },
        getStatusStyle: (value: string) =>
          value === t("tables.employees.active")
            ? { text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" }
            : { text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
      },
    ],
    [t]
  );

  const [refreshToken, setRefreshToken] = useState(0);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  const getStatusForRow = useCallback((row: UserRow) => {
    if (row.pendingInvitation) return "PENDING";
    return row.isActive ? "ACTIVE" : "INACTIVE";
  }, []);

  const fetchData = useCallback(
    async (_userId: string) => {
      const params = new URLSearchParams();
      params.set("excludeValets", "true");
      params.append("systemRole", "CUSTOMER");
      params.set("includeInactives", "true");
      const url = `/users?${params.toString()}`;
      const data = await apiClient.get<UserRow[]>(url);
      const list = Array.isArray(data) ? data : [];
      if (statusFilters.length === 0) return list;
      return list.filter((row) => statusFilters.includes(getStatusForRow(row)));
    },
    [statusFilters, getStatusForRow]
  );

  const handleResendInvitation = useCallback(
    async (row: UserRow) => {
      if (!row.id) return;
      await apiClient.post(`/users/${row.id}/resend-invitation`, {});
      setRefreshToken((prev) => prev + 1);
    },
    []
  );

  return (
    <>
      <DashboardDataTablePage<UserRow>
        title={t("tables.employees.filterCustomer")}
        description={tWithCompany("tables.employees.description", selectedCompanyName)}
        endpoint=""
        fetchData={fetchData}
        emptyMessage={t("tables.employees.empty")}
        columns={columns}
        refreshToken={refreshToken}
        toolbar={
          <StatusFilterToolbar
            tableKey="customers"
            allLabel={t("tables.employees.filterAll")}
            placeholder={t("tables.employees.filterByStatusPlaceholder")}
            clearSelectionLabel={t("grid.clearSelection")}
            options={CUSTOMER_STATUS_OPTIONS.map((o) => ({
              value: o.value,
              label: t(o.labelKey),
            }))}
            selected={statusFilters}
            onChange={setStatusFilters}
          />
        }
        hasRowDetail={() => true}
        renderRowDetail={(user) => (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
            {user.pendingInvitation && (
              <>
                <DetailSectionLabel text={t("tables.employees.pendingInvitation")} />
                <div className="col-span-3">
                  <button
                    type="button"
                    onClick={() => handleResendInvitation(user)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {t("tables.employees.resendInvitation")}
                  </button>
                </div>
              </>
            )}
            <DetailSectionLabel text={t("common.additionalInfo")} />
            <DetailField label={t("tables.employees.role")} value={tEnum("systemRole", user.systemRole)} />
            <DetailField
              label={t("tables.employees.phone")}
              value={user.phone ? formatPhoneInternational(user.phone) : undefined}
              linkType="phone"
            />
            <DetailField label={t("tables.employees.timezone")} value={user.timezone} />
            <DetailField
              label={t("tables.employees.lastLogin")}
              value={user.lastLogin ? formatDateTimeDisplay(new Date(user.lastLogin), t) : undefined}
            />
          </dl>
        )}
        onEdit={(row) => router.push(`/dashboard/users/${row.id}/edit`)}
        onUpdate={onUpdate}
        headerAction={
          <Link
            href="/dashboard/users/new?role=CUSTOMER"
            className="inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.25} />
            {t("common.add")}
          </Link>
        }
      />
    </>
  );
}

