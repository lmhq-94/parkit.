"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { RowDetailModal, DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

type BookingRow = {
  id?: string;
  status?: string;
  vehicleId?: string;
  vehicle?: { brand?: string; model?: string; plate?: string };
  parkingId?: string;
  parking?: { name?: string };
  scheduledEntryTime?: string;
  scheduledExitTime?: string;
};

function BookingDetailModal({
  booking,
  onClose,
  canEdit,
  t,
  tEnum,
}: {
  booking: BookingRow;
  onClose: () => void;
  canEdit: boolean;
  t: (key: string) => string;
  tEnum: (ns: string, val?: string | null) => string;
}) {
  const v = booking.vehicle;
  const vehicleLabel = v && (v.brand || v.model || v.plate)
    ? [v.brand, v.model].filter(Boolean).join(" ").trim() + (v.plate ? ` (${v.plate})` : "")
    : booking.vehicleId;
  const title = booking.id ? `Reserva ${booking.id.slice(0, 8)}` : "—";
  const isActive = booking.status !== "CANCELLED" && booking.status !== "COMPLETED";
  return (
    <RowDetailModal
      title={title}
      statusLabel={booking.status ? tEnum("bookingStatus", booking.status) : undefined}
      statusActive={isActive}
      editHref={booking.id ? `/dashboard/bookings/${booking.id}/edit` : undefined}
      canEdit={canEdit}
      onClose={onClose}
      t={t}
    >
      <dl className="grid grid-cols-3 gap-x-8 gap-y-6">
        <DetailSectionLabel text={t("tables.bookings.title")} />
        <DetailField label={t("tables.bookings.status")} value={booking.status ? tEnum("bookingStatus", booking.status) : undefined} />
        <DetailField label={t("tables.bookings.vehicleId")} value={vehicleLabel} />
        <DetailField label={t("tables.bookings.parkingId")} value={booking.parking?.name ?? booking.parkingId} />
        <DetailField label={t("tables.bookings.entry")} value={booking.scheduledEntryTime ? new Date(booking.scheduledEntryTime).toLocaleString() : undefined} />
        <DetailField label={t("tables.bookings.exit")} value={booking.scheduledExitTime ? new Date(booking.scheduledExitTime).toLocaleString() : undefined} />
      </dl>
    </RowDetailModal>
  );
}

export default function BookingsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);
  const [viewBooking, setViewBooking] = useState<BookingRow | null>(null);

  const onUpdate = useCallback(async (row: { id?: string; status?: string }) => {
    if (!row.id) return;
    if (row.status != null) await apiClient.patch(`/bookings/${row.id}`, { status: row.status });
    setRefreshToken((x) => x + 1);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: t("tables.bookings.parkingId"),
        render: (b: { parkingId?: string; parking?: { name?: string } }) =>
          b.parking?.name ?? b.parkingId ?? "—",
      },
      {
        header: t("tables.bookings.vehicleId"),
        render: (b: {
          vehicleId?: string;
          vehicle?: { brand?: string; model?: string; plate?: string };
        }) => {
          const v = b.vehicle;
          if (v && (v.brand || v.model || v.plate)) {
            const brandModel = [v.brand, v.model].filter(Boolean).join(" ").trim();
            return brandModel ? `${brandModel} (${v.plate ?? ""})` : (v.plate ?? "—");
          }
          return b.vehicleId ?? "—";
        },
      },
      { header: t("tables.bookings.status"), render: (b: { status?: string }) => tEnum("bookingStatus", b.status), field: "status" as const, editable: superAdmin, statusBadge: "booking", statusField: "status" },
      {
        header: t("tables.bookings.entry"),
        render: (b: { scheduledEntryTime?: string }) =>
          b.scheduledEntryTime ? new Date(b.scheduledEntryTime).toLocaleString() : "—",
      },
      {
        header: t("tables.bookings.exit"),
        render: (b: { scheduledExitTime?: string }) =>
          b.scheduledExitTime ? new Date(b.scheduledExitTime).toLocaleString() : "—",
      },
    ],
    [t, tEnum, superAdmin]
  );
  const onDelete = useCallback(async (row: { id?: string }) => {
    if (!row.id) return;
    await apiClient.patch(`/bookings/${row.id}/cancel`);
    setRefreshToken((x) => x + 1);
  }, []);

  return (
    <>
      <DashboardDataTablePage<BookingRow>
        title={t("tables.bookings.title")}
        description={tWithCompany("tables.bookings.description", selectedCompanyName)}
        endpoint="/bookings"
        emptyMessage={t("tables.bookings.empty")}
        columns={columns}
        refreshToken={refreshToken}
        onView={(row) => {
          document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          setTimeout(() => setViewBooking(row as BookingRow), 50);
        }}
        onEdit={superAdmin ? (row: { id?: string }) => router.push(`/dashboard/bookings/${row.id}/edit`) : undefined}
        onUpdate={superAdmin ? onUpdate : undefined}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? () => t("tables.bookings.confirmCancel") : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/bookings/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" strokeWidth={2.25} />
              {t("common.add")}
            </Link>
          ) : undefined
        }
      />
      {viewBooking && (
        <BookingDetailModal
          booking={viewBooking}
          onClose={() => setViewBooking(null)}
          canEdit={superAdmin}
          t={t}
          tEnum={tEnum}
        />
      )}
    </>
  );
}
