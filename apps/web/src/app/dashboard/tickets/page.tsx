"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

export default function TicketsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);

  const onDelete = useCallback(async (row: { id?: string }) => {
    if (!row.id) return;
    await apiClient.patch(`/tickets/${row.id}`, { status: "CANCELLED" });
    setRefreshToken((x) => x + 1);
  }, []);

  const onUpdate = useCallback(async (row: { id?: string; status?: string }) => {
    if (!row.id) return;
    if (row.status != null) await apiClient.patch(`/tickets/${row.id}`, { status: row.status });
    setRefreshToken((x) => x + 1);
  }, []);

  const columns = useMemo(
    () => [
      { header: t("tables.tickets.status"), render: (ticket: { status?: string }) => tEnum("ticketStatus", ticket.status), field: "status" as const, editable: superAdmin },
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
    [t, tEnum, superAdmin]
  );
  return (
    <DashboardDataTablePage
      title={t("tables.tickets.title")}
      description={tWithCompany("tables.tickets.description", selectedCompanyName)}
      endpoint="/tickets"
      emptyMessage={t("tables.tickets.empty")}
      columns={columns}
      refreshToken={refreshToken}
      onEdit={superAdmin ? (row: { id?: string }) => router.push(`/dashboard/tickets/${row.id}/edit`) : undefined}
      onUpdate={superAdmin ? onUpdate : undefined}
      onDelete={superAdmin ? onDelete : undefined}
      getConfirmDeleteMessage={superAdmin ? () => t("tables.tickets.confirmCancel") : undefined}
      headerAction={
        superAdmin ? (
          <Link
            href="/dashboard/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
          >
            {t("common.add")}
          </Link>
        ) : undefined
      }
    />
  );
}
