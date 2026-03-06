"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

type VehicleRow = { id?: string; plate?: string; brand?: string; model?: string; year?: number; countryCode?: string };

export default function VehiclesPage() {
  const { t, tWithCompany } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const onUpdate = useCallback(async (row: VehicleRow) => {
    if (!row.id) return;
    const payload: { plate?: string; brand?: string; model?: string; year?: number } = {};
    if (row.plate !== undefined) payload.plate = row.plate;
    if (row.brand !== undefined) payload.brand = row.brand;
    if (row.model !== undefined) payload.model = row.model;
    if (row.year !== undefined) payload.year = Number(row.year);
    await apiClient.patch(`/vehicles/${row.id}`, payload);
  }, []);
  const onDelete = useCallback(async (row: VehicleRow) => {
    if (!row.id) return;
    await apiClient.delete(`/vehicles/${row.id}`);
  }, []);
  const columns = useMemo(
    () => [
      { header: t("tables.vehicles.plate"), render: (v: VehicleRow) => v.plate || "N/A", field: "plate" as const, editable: superAdmin },
      { header: t("tables.vehicles.brand"), render: (v: VehicleRow) => v.brand || "N/A", field: "brand" as const, editable: superAdmin },
      { header: t("tables.vehicles.model"), render: (v: VehicleRow) => v.model || "N/A", field: "model" as const, editable: superAdmin },
      { header: t("tables.vehicles.year"), render: (v: VehicleRow) => (v.year != null ? String(v.year) : "N/A"), field: "year" as const, editable: superAdmin },
      { header: t("tables.vehicles.country"), render: (v: VehicleRow) => v.countryCode || "N/A" },
    ],
    [t, superAdmin]
  );
  return (
    <DashboardDataTablePage<VehicleRow>
      title={t("tables.vehicles.title")}
      description={tWithCompany("tables.vehicles.description", selectedCompanyName)}
      endpoint="/vehicles"
      emptyMessage={t("tables.vehicles.empty")}
      columns={columns}
      onEdit={superAdmin ? (row) => router.push(`/dashboard/vehicles/${row.id}/edit`) : undefined}
      onUpdate={superAdmin ? onUpdate : undefined}
      onDelete={superAdmin ? onDelete : undefined}
      getConfirmDeleteMessage={superAdmin ? () => t("tables.vehicles.confirmDelete") : undefined}
      headerAction={
        superAdmin ? (
          <Link
            href="/dashboard/vehicles/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
          >
            {t("common.add")}
          </Link>
        ) : undefined
      }
    />
  );
}
