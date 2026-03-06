"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

type ValetRow = { id?: string; user?: { firstName?: string; lastName?: string; email?: string }; currentStatus?: string; licenseNumber?: string };

export default function ValetsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();

  const onDelete = useCallback(async (row: ValetRow) => {
    if (row.id) await apiClient.delete(`/valets/${row.id}`);
  }, []);
  const onUpdate = useCallback(async (row: ValetRow) => {
    if (!row.id) return;
    const payload: Record<string, unknown> = {};
    if (row.licenseNumber !== undefined) payload.licenseNumber = String(row.licenseNumber).trim();
    if (row.licenseExpiry !== undefined) payload.licenseExpiry = row.licenseExpiry;
    if (Object.keys(payload).length === 0) return;
    await apiClient.patch(`/valets/${row.id}`, payload);
  }, []);
  const columns = useMemo(
    () => [
      {
        header: t("tables.valets.name"),
        render: (valet: { user?: { firstName?: string; lastName?: string; email?: string } }) => {
          const u = valet.user;
          if (!u) return "N/A";
          return `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "N/A";
        },
      },
      {
        header: t("tables.valets.email"),
        render: (valet: { user?: { email?: string } }) => valet.user?.email ?? "N/A",
      },
      {
        header: t("tables.valets.status"),
        render: (valet: { currentStatus?: string }) => tEnum("valetStatus", valet.currentStatus),
      },
      {
        header: t("tables.valets.license"),
        render: (valet: { licenseNumber?: string }) => valet.licenseNumber ?? "—",
        field: "licenseNumber" as const,
        editable: superAdmin,
      },
    ],
    [t, tEnum, superAdmin]
  );
  return (
    <DashboardDataTablePage<ValetRow>
      title={t("tables.valets.title")}
      description={tWithCompany("tables.valets.description", selectedCompanyName)}
      endpoint="/valets"
      emptyMessage={t("tables.valets.empty")}
      columns={columns}
      onEdit={superAdmin ? (row) => router.push(`/dashboard/valets/${row.id}/edit`) : undefined}
      onUpdate={superAdmin ? onUpdate : undefined}
      onDelete={superAdmin ? onDelete : undefined}
      getConfirmDeleteMessage={superAdmin ? () => t("tables.valets.confirmDelete") : undefined}
      headerAction={
        superAdmin ? (
          <Link
            href="/dashboard/valets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
          >
            {t("common.add")}
          </Link>
        ) : undefined
      }
    />
  );
}
