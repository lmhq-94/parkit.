"use client";

import { useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";

export default function TicketsPage() {
  const { t, tEnum } = useTranslation();
  const columns = useMemo(
    () => [
      { header: t("tables.tickets.status"), render: (ticket: { status?: string }) => tEnum("ticketStatus", ticket.status) },
      {
        header: t("tables.tickets.vehicleId"),
        render: (ticket: {
          vehicleId?: string;
          vehicle?: { brand?: string; model?: string; plate?: string };
        }) => {
          const v = ticket.vehicle;
          if (v && (v.brand || v.model || v.plate)) {
            const brandModel = [v.brand, v.model].filter(Boolean).join(" ").trim();
            return brandModel ? `${brandModel} (${v.plate ?? ""})` : (v.plate ?? "N/A");
          }
          return ticket.vehicleId ?? "N/A";
        },
      },
      {
        header: t("tables.tickets.parkingId"),
        render: (ticket: { parkingId?: string; parking?: { name?: string } }) =>
          ticket.parking?.name ?? ticket.parkingId ?? "N/A",
      },
      {
        header: t("tables.tickets.entry"),
        render: (ticket: { entryTime?: string }) =>
          ticket.entryTime ? new Date(ticket.entryTime).toLocaleString() : "N/A",
      },
      {
        header: t("tables.tickets.exit"),
        render: (ticket: { exitTime?: string }) =>
          ticket.exitTime ? new Date(ticket.exitTime).toLocaleString() : "N/A",
      },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage
      title={t("tables.tickets.title")}
      description={t("tables.tickets.description")}
      endpoint="/tickets"
      emptyMessage={t("tables.tickets.empty")}
      columns={columns}
    />
  );
}
