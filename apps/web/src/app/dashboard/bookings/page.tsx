"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
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
  qrCodeReference?: string | null;
  createdAt?: string | null;
};

export default function BookingsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);

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
        hasRowDetail={(booking) =>
          (booking.qrCodeReference != null && booking.qrCodeReference !== "") || booking.createdAt != null
        }
        renderRowDetail={(booking) => (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
            <DetailSectionLabel text={t("common.additionalInfo")} />
            {booking.qrCodeReference != null && booking.qrCodeReference !== "" && (
              <DetailField label={t("bookings.qrCodeReference")} value={booking.qrCodeReference} />
            )}
            {booking.createdAt != null && (
              <DetailField label={t("tables.notifications.createdAt")} value={new Date(booking.createdAt).toLocaleString()} />
            )}
          </dl>
        )}
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
    </>
  );
}
