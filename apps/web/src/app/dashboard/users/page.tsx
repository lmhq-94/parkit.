"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

type UserRow = { id?: string; firstName?: string; lastName?: string; email?: string; systemRole?: string; isActive?: boolean };

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
        header: t("tables.employees.firstName"),
        render: (user: { firstName?: string }) => user.firstName || "N/A",
        field: "firstName" as const,
        editable: true,
      },
      {
        header: t("tables.employees.lastName"),
        render: (user: { lastName?: string }) => user.lastName || "N/A",
        field: "lastName" as const,
        editable: true,
      },
      {
        header: t("tables.employees.email"),
        render: (user: { email?: string }) => user.email || "N/A",
      },
      {
        header: t("tables.employees.role"),
        render: (user: { systemRole?: string }) => tEnum("systemRole", user.systemRole),
      },
      {
        header: t("tables.employees.status"),
        render: (user: { isActive?: boolean }) => (user.isActive ? t("tables.employees.active") : t("tables.employees.inactive")),
      },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage<UserRow>
      title={t("tables.employees.title")}
      description={tWithCompany("tables.employees.description", selectedCompanyName)}
      endpoint="/users?excludeValets=true"
      emptyMessage={t("tables.employees.empty")}
      columns={columns}
      onEdit={(row) => router.push(`/dashboard/users/${row.id}/edit`)}
      onUpdate={onUpdate}
      onDelete={onDelete}
      getConfirmDeleteMessage={() => t("tables.employees.confirmDelete")}
      headerAction={
        <Link
          href="/dashboard/users/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
        >
          {t("common.add")}
        </Link>
      }
    />
  );
}
