"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Crown, Mail, Plus, Shield, User, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ICellRendererParams } from "ag-grid-community";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { formatPhoneWithCountryCode } from "@/lib/inputMasks";

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  SUPER_ADMIN: Crown,
  ADMIN: Shield,
  STAFF: UserCog,
  CUSTOMER: User,
};

function RoleIconCellRenderer(
  params: ICellRendererParams<{ systemRole?: string }> & {
    tEnum: (ns: string, val?: string | null) => string;
    t: (key: string) => string;
  }
) {
  const { data, tEnum, t } = params;
  const role = data?.systemRole;
  if (!role) return <span className="text-slate-400">—</span>;
  const Icon = ROLE_ICONS[role] ?? User;
  const label = tEnum("systemRole", role);
  const tooltipDesc = t(`enums.systemRoleTooltip.${role}`);
  const title = tooltipDesc ? `${label} — ${tooltipDesc}` : label;
  return (
    <span className="inline-flex items-center justify-center" title={title}>
      <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" aria-hidden />
    </span>
  );
}

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
    <span className={`inline-flex items-center gap-2 text-sm ${active ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-emerald-500" : "bg-red-500"}`} />
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

export default function UsersPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const router = useRouter();

  const onDelete = useCallback(async (row: UserRow) => {
    if (row.id) await apiClient.delete(`/users/${row.id}`);
  }, []);
  const onUpdate = useCallback(async (row: UserRow) => {
    if (!row.id) return;
    const payload: Record<string, unknown> = {};
    if (row.firstName !== undefined) payload.firstName = String(row.firstName).trim();
    if (row.lastName !== undefined) payload.lastName = String(row.lastName).trim();
    if (Object.keys(payload).length === 0) return;
    await apiClient.patch(`/users/${row.id}`, payload);
  }, []);
  const columns = useMemo(
    () => [
      {
        header: t("tables.employees.role"),
        render: (user: { systemRole?: string }) => tEnum("systemRole", user.systemRole),
        cellRenderer: RoleIconCellRenderer,
        cellRendererParams: { tEnum, t },
        maxWidth: 80,
        minWidth: 64,
      },
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
        linkType: "email",
      },
      {
        header: t("tables.employees.status"),
        render: (user: { isActive?: boolean; pendingInvitation?: boolean }) =>
          user.pendingInvitation ? t("tables.employees.pendingInvitation") : (user.isActive ? t("tables.employees.active") : t("tables.employees.inactive")),
        cellRenderer: UserStatusCellRenderer,
        cellRendererParams: { t },
      },
    ],
    [t, tEnum]
  );

  const [refreshToken, setRefreshToken] = useState(0);

  const handleResendInvitation = useCallback(async (row: UserRow) => {
    if (!row.id) return;
    await apiClient.post(`/users/${row.id}/resend-invitation`, {});
    setRefreshToken((prev) => prev + 1);
  }, []);

  return (
    <>
      <DashboardDataTablePage<UserRow>
        title={t("tables.employees.title")}
        description={tWithCompany("tables.employees.description", selectedCompanyName)}
        endpoint="/users?excludeValets=true"
        emptyMessage={t("tables.employees.empty")}
        columns={columns}
        refreshToken={refreshToken}
        hasRowDetail={(user) =>
          user.pendingInvitation === true ||
          (user.timezone != null && user.timezone !== "") ||
          user.lastLogin != null ||
          (user.phone != null && user.phone !== "")
        }
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
            <DetailField label={t("tables.employees.phone")} value={user.phone ? formatPhoneWithCountryCode(user.phone, "CR") : undefined} linkType="phone" />
            <DetailField label={t("tables.employees.timezone")} value={user.timezone} />
            <DetailField label={t("tables.employees.lastLogin")} value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : undefined} />
          </dl>
        )}
        onEdit={(row) => router.push(`/dashboard/users/${row.id}/edit`)}
        onUpdate={onUpdate}
        onDelete={onDelete}
        getConfirmDeleteMessage={(row) => t("tables.employees.confirmDeleteItem").replace(/\{\{item\}\}/g, [row.firstName, row.lastName].filter(Boolean).join(" ") || row.email || "—")}
        headerAction={
          <Link
            href="/dashboard/users/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" strokeWidth={2.25} />
            {t("common.add")}
          </Link>
        }
      />
    </>
  );
}
