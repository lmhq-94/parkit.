"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { formatDateTimeDisplay } from "@/lib/dateFormat";
import { formatPlate } from "@/lib/inputMasks";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

type BookingRow = {
  id?: string;
  status?: string;
  clientId?: string;
  client?: { user?: { firstName?: string; lastName?: string } };
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
  const canManage = superAdmin || user?.systemRole === "ADMIN";
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
        colId: "booking-vehicle",
        header: t("tables.bookings.vehicleId"),
        render: (b: {
          vehicleId?: string;
          vehicle?: { brand?: string; model?: string };
        }) => {
          const v = b.vehicle;
          if (v && (v.brand || v.model)) {
            return [v.brand, v.model].filter(Boolean).join(" ").trim() || "—";
          }
          return b.vehicleId ?? "—";
        },
      },
      {
        colId: "booking-plate",
        header: t("tables.vehicles.plate"),
        render: (b: { vehicle?: { plate?: string } }) =>
          b.vehicle?.plate ? formatPlate(b.vehicle.plate) : "—",
      },
      {
        header: t("tables.bookings.status"),
        render: (b: { status?: string }) => tEnum("bookingStatus", b.status),
        field: "status" as const,
        editable: canManage,
        statusBadge: "booking" as const,
        statusField: "status" as const,
        cellEditorValues: ["PENDING", "CONFIRMED", "CHECKED_IN", "CANCELLED", "NO_SHOW"],
        cellEditorLabels: ["PENDING", "CONFIRMED", "CHECKED_IN", "CANCELLED", "NO_SHOW"].map((v) => tEnum("bookingStatus", v)),
      },
      {
        header: t("tables.bookings.entry"),
        render: (b: { scheduledEntryTime?: string }) =>
          b.scheduledEntryTime ? formatDateTimeDisplay(new Date(b.scheduledEntryTime), t) : "—",
      },
      {
        header: t("tables.bookings.exit"),
        render: (b: { scheduledExitTime?: string }) =>
          b.scheduledExitTime ? formatDateTimeDisplay(new Date(b.scheduledExitTime), t) : "—",
      },
    ],
    [t, tEnum, canManage]
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
        renderRowDetail={(booking) => {
          const ownerName = booking.client?.user
            ? [booking.client.user.firstName, booking.client.user.lastName].filter(Boolean).join(" ").trim()
            : null;
          return (
            <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
              <DetailSectionLabel text={t("common.additionalInfo")} />
              {ownerName != null && ownerName !== "" && (
                <DetailField label={t("bookings.client")} value={ownerName} />
              )}
              {booking.qrCodeReference != null && booking.qrCodeReference !== "" && (
                <DetailField label={t("bookings.qrCodeReference")} value={booking.qrCodeReference} />
              )}
              {booking.createdAt != null && (
                <DetailField label={t("tables.notifications.createdAt")} value={formatDateTimeDisplay(new Date(booking.createdAt), t)} />
              )}
            </dl>
          );
        }}
        onEdit={canManage ? (row: { id?: string }) => router.push(`/dashboard/bookings/${row.id}/edit`) : undefined}
        onUpdate={canManage ? onUpdate : undefined}
        onDelete={canManage ? onDelete : undefined}
        getConfirmDeleteMessage={canManage ? (row) => {
          const vehicleLabel = row.vehicle ? [row.vehicle.brand, row.vehicle.model].filter(Boolean).join(" ") || (row.vehicle.plate ? formatPlate(row.vehicle.plate) : "") : "";
          const parkingName = row.parking?.name ?? row.parkingId ?? "";
          const dateStr = row.scheduledEntryTime ? formatDateTimeDisplay(new Date(row.scheduledEntryTime), t) : "";
          const item = [vehicleLabel || row.vehicleId, parkingName, dateStr].filter(Boolean).join(" · ") || "—";
          return t("tables.bookings.confirmCancelItem").replace(/\{\{item\}\}/g, item);
        } : undefined}
        headerAction={
          canManage ? (
            <Link
              href="/dashboard/bookings/new"
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
