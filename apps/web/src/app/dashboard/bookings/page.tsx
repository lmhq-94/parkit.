"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Plus, QrCode } from "@/lib/premiumIcons";
import { useRouter } from "next/navigation";
import { BookingQRModal } from "@/components/BookingQRModal";
import { PageLoader } from "@/components/PageLoader";

const DashboardDataTablePage = dynamic(
  () => import("@/components/DashboardDataTablePage").then((m) => ({ default: m.DashboardDataTablePage })),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center p-8"><PageLoader /></div> }
);
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";

const QRCode = dynamic(
  () => import("react-qr-code"),
  { ssr: false }
);
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
  const selectedCompanyId = useDashboardStore((s: { selectedCompanyId: string | null }) => s.selectedCompanyId);
  const selectedCompanyName = useDashboardStore((s: { selectedCompanyName: string | null }) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const canManage = superAdmin || user?.systemRole === "ADMIN";
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [parkings, setParkings] = useState<ParkingOption[]>([]);
  const [hasCustomers, setHasCustomers] = useState(false);
  const [qrModalBooking, setQrModalBooking] = useState<BookingRow | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [v, p, customers] = await Promise.all([
          apiClient.get<VehicleOption[]>("/vehicles"),
          apiClient.get<ParkingOption[]>("/parkings"),
          apiClient.get<unknown[]>("/users?systemRole=CUSTOMER").catch(() => []),
        ]);
        setVehicles(Array.isArray(v) ? v : []);
        setParkings(Array.isArray(p) ? p : []);
        setHasCustomers(Array.isArray(customers) && customers.length > 0);
      } catch {
        setVehicles([]);
        setParkings([]);
        setHasCustomers(false);
      }
    })();
  }, [selectedCompanyId]);

  const fetchData = useCallback(
    async () => {
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
        cellEditorDateTimeMinNow: true,
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
          const qrRef = booking.qrCodeReference ?? booking.id ?? "";
          const showQr = qrRef !== "";
          return (
            <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
              <DetailSectionLabel text={t("common.additionalInfo")} />
              {ownerName != null && ownerName !== "" && (
                <DetailField label={t("bookings.client")} value={ownerName} />
              )}
              {showQr && (
                <div className="col-span-full flex flex-col gap-2">
                  <span className="text-sm font-medium text-text-secondary">{t("bookings.qrCodeReference")}</span>
                  <p className="text-xs text-text-muted">{t("bookings.qrScanHint")}</p>
                  <div className="inline-flex rounded-lg border border-input-border bg-white p-3 dark:bg-white">
                    <QRCode value={qrRef} size={128} level="M" />
                  </div>
                </div>
              )}
              {booking.createdAt != null && (
                <DetailField label={t("tables.notifications.createdAt")} value={formatDateTimeDisplay(new Date(booking.createdAt), t)} />
              )}
            </dl>
          );
        }}
        onEdit={canManage ? (row: { id?: string }) => router.push(`/dashboard/bookings/${row.id}/edit`) : undefined}
        onUpdate={canManage ? onUpdate : undefined}
        customActions={[
          {
            icon: <QrCode className="w-4 h-4" />,
            label: t("bookings.showQR"),
            onClick: (row) => setQrModalBooking(row),
          },
        ]}
        headerAction={
          canManage && vehicles.length > 0 && parkings.length > 0 && hasCustomers ? (
            <Link
              href="/dashboard/bookings/new"
              className="group inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" strokeWidth={2.25} />
              {t("common.add")}
            </Link>
          ) : undefined
        }
      />
      <BookingQRModal
        booking={qrModalBooking}
        open={qrModalBooking != null}
        onClose={() => setQrModalBooking(null)}
      />
    </>
  );
}
