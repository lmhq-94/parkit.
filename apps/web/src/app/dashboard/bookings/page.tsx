"use client";

import { useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";

export default function BookingsPage() {
  const { t, tEnum } = useTranslation();
  const columns = useMemo(
    () => [
      { header: t("tables.bookings.status"), render: (b: { status?: string }) => tEnum("bookingStatus", b.status) },
      {
        header: t("tables.bookings.vehicleId"),
        render: (b: {
          vehicleId?: string;
          vehicle?: { brand?: string; model?: string; plate?: string };
        }) => {
          const v = b.vehicle;
          if (v && (v.brand || v.model || v.plate)) {
            const brandModel = [v.brand, v.model].filter(Boolean).join(" ").trim();
            return brandModel ? `${brandModel} (${v.plate ?? ""})` : (v.plate ?? "N/A");
          }
          return b.vehicleId ?? "N/A";
        },
      },
      {
        header: t("tables.bookings.parkingId"),
        render: (b: { parkingId?: string; parking?: { name?: string } }) =>
          b.parking?.name ?? b.parkingId ?? "N/A",
      },
      {
        header: t("tables.bookings.entry"),
        render: (b: { scheduledEntryTime?: string }) =>
          b.scheduledEntryTime ? new Date(b.scheduledEntryTime).toLocaleString() : "N/A",
      },
      {
        header: t("tables.bookings.exit"),
        render: (b: { scheduledExitTime?: string }) =>
          b.scheduledExitTime ? new Date(b.scheduledExitTime).toLocaleString() : "N/A",
      },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage
      title={t("tables.bookings.title")}
      description={t("tables.bookings.description")}
      endpoint="/bookings"
      emptyMessage={t("tables.bookings.empty")}
      columns={columns}
    />
  );
}
