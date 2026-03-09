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
import { formatPlate } from "@/lib/inputMasks";

type VehicleRow = {
  id?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  countryCode?: string;
  dimensions?: { lengthCm?: number; widthCm?: number; heightCm?: number };
};

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
      { header: t("tables.vehicles.plate"), render: (v: VehicleRow) => (v.plate ? formatPlate(v.plate) : "—"), field: "plate" as const, editable: superAdmin },
      { header: t("tables.vehicles.brand"), render: (v: VehicleRow) => v.brand || "—", field: "brand" as const, editable: superAdmin },
      { header: t("tables.vehicles.model"), render: (v: VehicleRow) => v.model || "—", field: "model" as const, editable: superAdmin },
      { header: t("tables.vehicles.year"), render: (v: VehicleRow) => (v.year != null ? String(v.year) : "—"), field: "year" as const, editable: superAdmin },
    ],
    [t, superAdmin]
  );
  return (
    <>
      <DashboardDataTablePage<VehicleRow>
        title={t("tables.vehicles.title")}
        description={tWithCompany("tables.vehicles.description", selectedCompanyName)}
        endpoint="/vehicles"
        emptyMessage={t("tables.vehicles.empty")}
        columns={columns}
        hasRowDetail={(vehicle) =>
          (vehicle.countryCode != null && vehicle.countryCode !== "") ||
          (vehicle.dimensions != null && typeof vehicle.dimensions === "object" && Object.keys(vehicle.dimensions as object).length > 0)
        }
        renderRowDetail={(vehicle) => {
          const dims = vehicle.dimensions as { lengthCm?: number; widthCm?: number; heightCm?: number } | null | undefined;
          const hasDims = dims && (dims.lengthCm != null || dims.widthCm != null || dims.heightCm != null);
          return (
            <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
              <DetailSectionLabel text={t("common.additionalInfo")} />
              <DetailField label={t("tables.vehicles.country")} value={vehicle.countryCode} />
              {hasDims && dims?.lengthCm != null && <DetailField label={t("vehicles.lengthCm")} value={String(dims.lengthCm)} />}
              {hasDims && dims?.widthCm != null && <DetailField label={t("vehicles.widthCm")} value={String(dims.widthCm)} />}
              {hasDims && dims?.heightCm != null && <DetailField label={t("vehicles.heightCm")} value={String(dims.heightCm)} />}
            </dl>
          );
        }}
        onEdit={superAdmin ? (row) => router.push(`/dashboard/vehicles/${row.id}/edit`) : undefined}
        onUpdate={superAdmin ? onUpdate : undefined}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? (row) => t("tables.vehicles.confirmDeleteItem").replace(/\{\{item\}\}/g, row.plate ? formatPlate(row.plate) : [row.brand, row.model].filter(Boolean).join(" ") || "—") : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/vehicles/new"
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
