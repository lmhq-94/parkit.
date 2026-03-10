"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/PageLoader";

const DashboardDataTablePage = dynamic(
  () => import("@/components/DashboardDataTablePage").then((m) => ({ default: m.DashboardDataTablePage })),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center p-8"><PageLoader /></div> }
);
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { formatDateTimeDisplay } from "@/lib/dateFormat";
import { formatPlate } from "@/lib/inputMasks";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { StatusFilterToolbar } from "@/components/StatusFilterToolbar";

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

type VehicleOption = { id: string; plate?: string; brand?: string; model?: string };
type ParkingOption = { id: string; name?: string };

const BOOKING_STATUS_OPTIONS = [
  { value: "PENDING", key: "PENDING" },
  { value: "CONFIRMED", key: "CONFIRMED" },
  { value: "CHECKED_IN", key: "CHECKED_IN" },
  { value: "CANCELLED", key: "CANCELLED" },
  { value: "NO_SHOW", key: "NO_SHOW" },
] as const;

export default function BookingsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const canManage = superAdmin || user?.systemRole === "ADMIN";
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [parkings, setParkings] = useState<ParkingOption[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [v, p] = await Promise.all([
          apiClient.get<VehicleOption[]>("/vehicles"),
          apiClient.get<ParkingOption[]>("/parkings"),
        ]);
        setVehicles(Array.isArray(v) ? v : []);
        setParkings(Array.isArray(p) ? p : []);
      } catch {
        setVehicles([]);
        setParkings([]);
      }
    })();
  }, []);

  const fetchData = useCallback(
    async (_userId: string) => {
      const params =
        statusFilters.length > 0
          ? statusFilters.map((s) => `status=${encodeURIComponent(s)}`).join("&")
          : "";
      const url = params ? `/bookings?${params}` : "/bookings";
      return apiClient.get<BookingRow[]>(url);
    },
    [statusFilters]
  );

  const onUpdate = useCallback(async (row: BookingRow) => {
    if (!row.id) return;
    const payload: Record<string, unknown> = {};
    if (row.status != null) payload.status = row.status;
    if (row.parkingId) payload.parkingId = row.parkingId;
    if (row.vehicleId) payload.vehicleId = row.vehicleId;
    if (row.scheduledEntryTime) {
      payload.scheduledEntryTime = new Date(row.scheduledEntryTime).toISOString();
    }
    if (row.scheduledExitTime) {
      payload.scheduledExitTime = new Date(row.scheduledExitTime).toISOString();
    }
    await apiClient.patch(`/bookings/${row.id}`, payload);
    setRefreshToken((x) => x + 1);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: t("tables.bookings.parkingId"),
        render: (b: BookingRow) => {
          if (b.parking?.name) return b.parking.name;
          const opt = parkings.find((p) => p.id === b.parkingId);
          if (opt) return opt.name ?? opt.id ?? "—";
          return b.parkingId ?? "—";
        },
        field: "parkingId" as const,
        editable: canManage,
        cellEditorValues: parkings.map((p) => p.id),
        cellEditorLabels: parkings.map((p) => p.name ?? p.id),
      },
      {
        colId: "booking-vehicle",
        header: t("tables.bookings.vehicleId"),
        render: (b: BookingRow) => {
          const v = b.vehicle;
          if (v && (v.plate || v.brand || v.model)) {
            const label = [
              v.plate ? formatPlate(v.plate) : null,
              [v.brand, v.model].filter(Boolean).join(" "),
            ]
              .filter(Boolean)
              .join(" — ")
              .trim();
            if (label) return label;
          }
          if (b.vehicleId) {
            const opt = vehicles.find((x) => x.id === b.vehicleId);
            if (opt) {
              const label = [
                opt.plate ? formatPlate(opt.plate) : null,
                [opt.brand, opt.model].filter(Boolean).join(" "),
              ]
                .filter(Boolean)
                .join(" — ")
                .trim();
              if (label) return label;
              return opt.id;
            }
            return b.vehicleId;
          }
          return "—";
        },
        field: "vehicleId" as const,
        editable: canManage,
        cellEditorValues: vehicles.map((v) => v.id),
        cellEditorLabels: vehicles.map((v) => {
          const label = [
            v.plate ? formatPlate(v.plate) : null,
            [v.brand, v.model].filter(Boolean).join(" "),
          ]
            .filter(Boolean)
            .join(" — ")
            .trim();
          return label || v.id;
        }),
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
        field: "scheduledEntryTime" as const,
        editable: canManage,
        cellEditorDateTime: true,
      },
      {
        header: t("tables.bookings.exit"),
        render: (b: { scheduledExitTime?: string }) =>
          b.scheduledExitTime ? formatDateTimeDisplay(new Date(b.scheduledExitTime), t) : "—",
        field: "scheduledExitTime" as const,
        editable: canManage,
        cellEditorDateTime: true,
      },
    ],
    [t, tEnum, canManage, vehicles, parkings]
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
        endpoint=""
        fetchData={fetchData}
        emptyMessage={t("tables.bookings.empty")}
        columns={columns}
        refreshToken={refreshToken}
        toolbar={
          <StatusFilterToolbar
            tableKey="bookings"
            allLabel={t("tables.bookings.filterAll")}
            placeholder={t("tables.bookings.filterStatusPlaceholder")}
            clearSelectionLabel={t("grid.clearSelection")}
            options={BOOKING_STATUS_OPTIONS.map((o) => ({
              value: o.value,
              label: tEnum("bookingStatus", o.key),
            }))}
            selected={statusFilters}
            onChange={setStatusFilters}
          />
        }
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
