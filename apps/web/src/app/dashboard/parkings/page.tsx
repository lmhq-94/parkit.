"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, DoorOpen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ICellRendererParams } from "ag-grid-community";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { RowDetailModal, DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

type ParkingRow = { id?: string; name?: string; address?: string; type?: string; totalSlots?: number; requiresBooking?: boolean };

function RequiresBookingIconCellRenderer(
  params: ICellRendererParams<{ requiresBooking?: boolean }> & { t: (key: string) => string }
) {
  const { data, t } = params;
  const requires = data?.requiresBooking;
  const Icon = requires ? CalendarCheck : DoorOpen;
  const title = requires ? t("parkings.requiresBookingOn") : t("parkings.requiresBookingOff");
  return (
    <span className="inline-flex items-center justify-center" title={title}>
      <Icon
        className={`w-4 h-4 ${requires ? "text-emerald-600 dark:text-emerald-400" : "text-sky-600 dark:text-sky-400"}`}
        aria-hidden
      />
    </span>
  );
}

function ParkingDetailModal({
  parking,
  onClose,
  t,
  tEnum,
}: {
  parking: ParkingRow;
  onClose: () => void;
  t: (key: string) => string;
  tEnum: (ns: string, val?: string | null) => string;
}) {
  const title = parking.name || "—";
  return (
    <RowDetailModal
      title={title}
      editHref={parking.id ? `/dashboard/parkings/${parking.id}/edit` : undefined}
      canEdit
      onClose={onClose}
      t={t}
    >
      <dl className="grid grid-cols-3 gap-x-8 gap-y-6">
        <DetailSectionLabel text={t("tables.parkings.title")} />
        <DetailField label={t("tables.parkings.name")} value={parking.name} />
        <DetailField label={t("tables.parkings.address")} value={parking.address} />
        <DetailField label={t("tables.parkings.type")} value={parking.type ? tEnum("parkingType", parking.type) : undefined} />
        <DetailField label={t("tables.parkings.totalSlots")} value={parking.totalSlots} />
        <DetailField label={t("tables.parkings.requiresBooking")} value={parking.requiresBooking != null ? (parking.requiresBooking ? t("common.yes") : t("common.no")) : undefined} />
      </dl>
    </RowDetailModal>
  );
}

export default function ParkingsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const router = useRouter();
  const [viewParking, setViewParking] = useState<ParkingRow | null>(null);

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
      { header: t("tables.parkings.name"), render: (p: ParkingRow) => p.name ?? "—", field: "name" as const, editable: true },
      { header: t("tables.parkings.address"), render: (p: ParkingRow) => p.address || "—", field: "address" as const, editable: true },
      { header: t("tables.parkings.type"), render: (p: ParkingRow) => tEnum("parkingType", p.type), field: "type" as const, editable: true },
      { header: t("tables.parkings.totalSlots"), render: (p: ParkingRow) => (p.totalSlots != null ? String(p.totalSlots) : "—"), field: "totalSlots" as const, editable: true },
      {
        header: t("tables.parkings.requiresBooking"),
        render: (p: ParkingRow) => (p.requiresBooking ? t("common.yes") : t("common.no")),
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
        onView={(row) => {
          document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          setTimeout(() => setViewParking(row), 50);
        }}
        onEdit={(row) => router.push(`/dashboard/parkings/${row.id}/edit`)}
        onUpdate={onUpdate}
        onDelete={onDelete}
        getConfirmDeleteMessage={() => t("tables.parkings.confirmDelete")}
        headerAction={
          <Link
            href="/dashboard/parkings/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" strokeWidth={2.25} />
            {t("common.add")}
          </Link>
        }
      />
      {viewParking && (
        <ParkingDetailModal parking={viewParking} onClose={() => setViewParking(null)} t={t} tEnum={tEnum} />
      )}
    </>
  );
}
