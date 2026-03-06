"use client";

import { useCallback, useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

export default function ParkingsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  type ParkingRow = { id?: string; name?: string; address?: string; type?: string; totalSlots?: number; requiresBooking?: boolean };
  const onCreate = useCallback(async (draft: Partial<ParkingRow>) => {
    const name = (draft.name ?? "").toString().trim();
    const address = (draft.address ?? "").toString().trim();
    const type = (draft.type ?? "").toString().trim();
    const totalSlots = Number(draft.totalSlots);
    if (!name || !address || !type || !Number.isFinite(totalSlots) || totalSlots <= 0) {
      alert("Completa nombre, dirección, tipo y espacios totales.");
      return;
    }
    await apiClient.post("/parkings", {
      name,
      address,
      type,
      totalSlots,
      requiresBooking: Boolean(draft.requiresBooking),
    });
  }, []);
  const onUpdate = useCallback(async (row: ParkingRow) => {
    if (!row.id) return;
    const name = (row.name ?? "").toString().trim();
    const address = (row.address ?? "").toString().trim();
    const type = (row.type ?? "").toString().trim();
    const totalSlots =
      row.totalSlots == null || row.totalSlots === ("" as unknown as number)
        ? undefined
        : Number(row.totalSlots);

    const payload: Record<string, unknown> = {};
    if (name) payload.name = name;
    if (address) payload.address = address;
    if (type) payload.type = type;
    if (totalSlots !== undefined) payload.totalSlots = totalSlots;

    await apiClient.patch(`/parkings/${row.id}`, payload);
  }, []);
  const onDelete = useCallback(async (row: ParkingRow) => {
    if (!row.id) return;
    await apiClient.delete(`/parkings/${row.id}`);
  }, []);
  const columns = useMemo(
    () => [
      { header: t("tables.parkings.name"), render: (p: ParkingRow) => p.name || "N/A", field: "name" as const, editable: true },
      { header: t("tables.parkings.address"), render: (p: ParkingRow) => p.address || "N/A", field: "address" as const, editable: true },
      { header: t("tables.parkings.type"), render: (p: ParkingRow) => tEnum("parkingType", p.type), field: "type" as const, editable: true },
      { header: t("tables.parkings.totalSlots"), render: (p: ParkingRow) => (p.totalSlots != null ? String(p.totalSlots) : "N/A"), field: "totalSlots" as const, editable: true },
      { header: t("tables.parkings.requiresBooking"), render: (p: ParkingRow) => (p.requiresBooking ? t("common.yes") : t("common.no")) },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage
      title={t("tables.parkings.title")}
      description={tWithCompany("tables.parkings.description", selectedCompanyName)}
      endpoint="/parkings"
      emptyMessage={t("tables.parkings.empty")}
      columns={columns}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      getConfirmDeleteMessage={() => t("tables.parkings.confirmDelete")}
    />
  );
}
