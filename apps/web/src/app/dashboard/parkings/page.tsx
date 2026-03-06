"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

export default function ParkingsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const router = useRouter();
  type ParkingRow = { id?: string; name?: string; address?: string; type?: string; totalSlots?: number; requiresBooking?: boolean };
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
      onEdit={(row: { id?: string }) => router.push(`/dashboard/parkings/${row.id}/edit`)}
      onUpdate={onUpdate}
      onDelete={onDelete}
      getConfirmDeleteMessage={() => t("tables.parkings.confirmDelete")}
      headerAction={
        <Link
          href="/dashboard/parkings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
        >
          {t("common.add")}
        </Link>
      }
    />
  );
}
