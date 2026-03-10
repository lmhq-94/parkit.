"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Check, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ICellRendererParams } from "ag-grid-community";
import { PageLoader } from "@/components/PageLoader";

const DashboardDataTablePage = dynamic(
  () => import("@/components/DashboardDataTablePage").then((m) => ({ default: m.DashboardDataTablePage })),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center p-8"><PageLoader /></div> }
);
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

type ParkingRow = { id?: string; name?: string; address?: string; type?: string; totalSlots?: number; requiresBooking?: boolean; latitude?: number | null; longitude?: number | null; geofenceRadius?: number };

function RequiresBookingIconCellRenderer(
  params: ICellRendererParams<{ requiresBooking?: boolean }> & { t: (key: string) => string }
) {
  const { data, t } = params;
  const requires = data?.requiresBooking;
  const Icon = requires ? Check : X;
  const title = requires ? t("parkings.requiresBookingOn") : t("parkings.requiresBookingOff");
  return (
    <span className="inline-flex items-center justify-center" title={title}>
      <Icon
        className={`w-4 h-4 ${requires ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
        aria-hidden
      />
    </span>
  );
}

export default function ParkingsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const bumpParkings = useDashboardStore((s) => s.bumpParkings);
  const router = useRouter();

  const onUpdate = useCallback(async (row: ParkingRow) => {
    if (!row.id) return;
    const name = (row.name ?? "").toString().trim();
    const address = (row.address ?? "").toString().trim();
    const type = (row.type ?? "").toString().trim();
    const totalSlots =
      row.totalSlots == null || row.totalSlots === ("" as unknown as number)
        ? undefined
        : Number(row.totalSlots);
    const requiresBooking =
      row.requiresBooking === true || row.requiresBooking === "true";

    const payload: Record<string, unknown> = {};
    if (name) payload.name = name;
    if (address) payload.address = address;
    if (type) payload.type = type;
    if (totalSlots !== undefined) payload.totalSlots = totalSlots;
    payload.requiresBooking = requiresBooking;

    await apiClient.patch(`/parkings/${row.id}`, payload);
    bumpParkings();
  }, [bumpParkings]);
  const onDelete = useCallback(async (row: ParkingRow) => {
    if (!row.id) return;
    await apiClient.delete(`/parkings/${row.id}`);
    bumpParkings();
  }, [bumpParkings]);
  const columns = useMemo(
    () => [
      { header: t("tables.parkings.name"), render: (p: ParkingRow) => p.name ?? "—", field: "name" as const, editable: true },
      { header: t("tables.parkings.address"), render: (p: ParkingRow) => p.address || "—", field: "address" as const, editable: true, cellEditorAddress: true },
      {
        header: t("tables.parkings.type"),
        render: (p: ParkingRow) => tEnum("parkingType", p.type),
        field: "type" as const,
        editable: true,
        cellEditorValues: ["OPEN", "COVERED", "TOWER", "UNDERGROUND", "ELEVATOR"],
        cellEditorLabels: ["OPEN", "COVERED", "TOWER", "UNDERGROUND", "ELEVATOR"].map((v) => tEnum("parkingType", v)),
      },
      { header: t("tables.parkings.totalSlots"), render: (p: ParkingRow) => (p.totalSlots != null ? String(p.totalSlots) : "—"), field: "totalSlots" as const, editable: true },
      {
        header: t("tables.parkings.requiresBooking"),
        render: (p: ParkingRow) => (p.requiresBooking ? t("common.yes") : t("common.no")),
        field: "requiresBooking" as const,
        editable: true,
        cellEditorValues: ["true", "false"],
        cellEditorLabels: [t("common.yes"), t("common.no")],
        valueGetter: (p) => (p.requiresBooking === true ? "true" : "false"),
        valueSetter: (p, v) => {
          (p as Record<string, unknown>).requiresBooking = v === "true";
        },
        cellRenderer: RequiresBookingIconCellRenderer,
        cellRendererParams: { t },
        minWidth: 130,
        maxWidth: 180,
      },
    ],
    [t, tEnum]
  );
  return (
    <>
      <DashboardDataTablePage<ParkingRow>
        title={t("tables.parkings.title")}
        description={tWithCompany("tables.parkings.description", selectedCompanyName)}
        endpoint="/parkings"
        emptyMessage={t("tables.parkings.empty")}
        columns={columns}
        hasRowDetail={(parking) =>
          parking.latitude != null || parking.longitude != null || parking.geofenceRadius != null
        }
        renderRowDetail={(parking) => (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
            <DetailSectionLabel text={t("common.additionalInfo")} />
            <DetailField label={t("parkings.latitude")} value={parking.latitude != null ? String(parking.latitude) : undefined} />
            <DetailField label={t("parkings.longitude")} value={parking.longitude != null ? String(parking.longitude) : undefined} />
            <DetailField label={t("parkings.geofenceRadius")} value={parking.geofenceRadius != null ? String(parking.geofenceRadius) : undefined} />
          </dl>
        )}
        onEdit={(row) => router.push(`/dashboard/parkings/${row.id}/edit`)}
        onUpdate={onUpdate}
        onDelete={onDelete}
        getConfirmDeleteMessage={(row) => t("tables.parkings.confirmDeleteItem").replace(/\{\{item\}\}/g, row.name ?? "—")}
        headerAction={
          <Link
            href="/dashboard/parkings/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.25} />
            {t("common.add")}
          </Link>
        }
      />
    </>
  );
}
