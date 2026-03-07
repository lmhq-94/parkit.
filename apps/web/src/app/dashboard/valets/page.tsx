"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

type ValetRow = { id?: string; user?: { firstName?: string; lastName?: string; email?: string; phone?: string | null }; currentStatus?: string; licenseNumber?: string; licenseExpiry?: string; ratingAvg?: number };

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
        header: t("tables.employees.firstName"),
        render: (valet: { user?: { firstName?: string } }) => valet.user?.firstName ?? "—",
      },
      {
        header: t("tables.employees.lastName"),
        render: (valet: { user?: { lastName?: string } }) => valet.user?.lastName ?? "—",
      },
      {
        header: t("tables.valets.email"),
        render: (valet: { user?: { email?: string } }) => valet.user?.email ?? "—",
        linkType: "email",
      },
      {
        header: t("tables.valets.status"),
        render: (valet: { currentStatus?: string }) => tEnum("valetStatus", valet.currentStatus),
        statusBadge: "valet",
        statusField: "currentStatus",
      },
    ],
    [t, tEnum]
  );
  return (
    <>
      <DashboardDataTablePage<ValetRow>
        title={t("tables.valets.title")}
        description={tWithCompany("tables.valets.description", selectedCompanyName)}
        endpoint="/valets"
        emptyMessage={t("tables.valets.empty")}
        columns={columns}
        hasRowDetail={(valet) =>
          (valet.user?.phone != null && valet.user.phone !== "") ||
          (valet.licenseNumber != null && valet.licenseNumber !== "") ||
          valet.licenseExpiry != null ||
          valet.ratingAvg != null
        }
        renderRowDetail={(valet) => (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
            <DetailSectionLabel text={t("common.additionalInfo")} />
            <DetailField label={t("tables.employees.phone")} value={valet.user?.phone} linkType="phone" />
            <DetailField label={t("tables.valets.license")} value={valet.licenseNumber} />
            <DetailField label={t("valets.licenseExpiry")} value={valet.licenseExpiry ? new Date(valet.licenseExpiry).toLocaleDateString() : undefined} />
            {valet.ratingAvg != null && (
              <DetailField label={t("valets.ratingAvg")} value={String(valet.ratingAvg)} />
            )}
          </dl>
        )}
        onEdit={superAdmin ? (row) => router.push(`/dashboard/valets/${row.id}/edit`) : undefined}
        onUpdate={superAdmin ? onUpdate : undefined}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? () => t("tables.valets.confirmDelete") : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/valets/new"
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
