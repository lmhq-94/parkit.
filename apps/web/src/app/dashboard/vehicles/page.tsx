"use client";

import { useCallback, useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

type VehicleRow = { id?: string; plate?: string; brand?: string; model?: string; year?: number; countryCode?: string };

export default function VehiclesPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const superAdmin = isSuperAdmin(user);
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
  const onCreate = useCallback(async (draft: Partial<VehicleRow>) => {
    const plate = (draft.plate ?? "").toString().trim();
    if (!plate) {
      alert("La placa es requerida.");
      return;
    }
    const payload: { plate: string; countryCode?: string; brand?: string; model?: string; year?: number } = {
      plate,
      countryCode: (draft.countryCode ?? "CR").toString(),
    };
    if (draft.brand) payload.brand = String(draft.brand);
    if (draft.model) payload.model = String(draft.model);
    if (draft.year != null && String(draft.year).trim() !== "") payload.year = Number(draft.year);
    await apiClient.post("/vehicles", payload);
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
      description={t("tables.vehicles.description")}
      endpoint="/vehicles"
      emptyMessage={t("tables.vehicles.empty")}
      columns={columns}
      onUpdate={superAdmin ? onUpdate : undefined}
      onCreate={superAdmin ? onCreate : undefined}
      onDelete={superAdmin ? onDelete : undefined}
      getConfirmDeleteMessage={superAdmin ? () => t("tables.vehicles.confirmDelete") : undefined}
    />
  );
}
