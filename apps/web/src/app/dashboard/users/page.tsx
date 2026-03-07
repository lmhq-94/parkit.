"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Crown, Plus, Shield, User, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ICellRendererParams } from "ag-grid-community";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { RowDetailModal, DetailField, DetailSeparator, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

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

type UserRow = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  systemRole?: string;
  isActive?: boolean;
  phone?: string | null;
  timezone?: string | null;
  lastLogin?: string | null;
  companyId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function UserDetailModal({
  user,
  onClose,
  t,
  tEnum,
}: {
  user: UserRow;
  onClose: () => void;
  t: (key: string) => string;
  tEnum: (ns: string, val?: string | null) => string;
}) {
  const title = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "—";
  const isActive = user.isActive !== false;
  return (
    <RowDetailModal
      title={title}
      statusLabel={user.isActive ? t("tables.employees.active") : t("tables.employees.inactive")}
      statusActive={isActive}
      editHref={user.id ? `/dashboard/users/${user.id}/edit` : undefined}
      canEdit
      onClose={onClose}
      t={t}
    >
      <dl className="grid grid-cols-3 gap-x-8 gap-y-6">
        <DetailSectionLabel text={t("users.sectionMain")} />
        <DetailField label={t("tables.employees.firstName")} value={user.firstName} />
        <DetailField label={t("tables.employees.lastName")} value={user.lastName} />
        <DetailField label={t("tables.employees.email")} value={user.email} />
        <DetailField label={t("tables.employees.role")} value={tEnum("systemRole", user.systemRole)} />
        <DetailField label={t("tables.employees.status")} value={user.isActive ? t("tables.employees.active") : t("tables.employees.inactive")} />
        <DetailSeparator />
        <DetailSectionLabel text={t("users.sectionContact")} />
        <DetailField label={t("tables.employees.phone")} value={user.phone} />
        <DetailField label={t("tables.employees.timezone")} value={user.timezone} />
        <DetailField label={t("tables.employees.lastLogin")} value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : undefined} />
      </dl>
    </RowDetailModal>
  );
}

export default function UsersPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const router = useRouter();
  const [viewUser, setViewUser] = useState<UserRow | null>(null);

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
        header: t("tables.employees.phone"),
        render: (user: { phone?: string | null }) => user.phone || "—",
        linkType: "phone",
      },
      {
        header: t("tables.employees.status"),
        render: (user: { isActive?: boolean }) => (user.isActive ? t("tables.employees.active") : t("tables.employees.inactive")),
        statusBadge: "user",
        statusField: "isActive",
      },
    ],
    [t, tEnum]
  );
  return (
    <>
      <DashboardDataTablePage<UserRow>
        title={t("tables.employees.title")}
        description={tWithCompany("tables.employees.description", selectedCompanyName)}
        endpoint="/users?excludeValets=true"
        emptyMessage={t("tables.employees.empty")}
        columns={columns}
        onView={(row) => {
          document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          setTimeout(() => setViewUser(row), 50);
        }}
        onEdit={(row) => router.push(`/dashboard/users/${row.id}/edit`)}
        onUpdate={onUpdate}
        onDelete={onDelete}
        getConfirmDeleteMessage={() => t("tables.employees.confirmDelete")}
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
      {viewUser && (
        <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} t={t} tEnum={tEnum} />
      )}
    </>
  );
}
