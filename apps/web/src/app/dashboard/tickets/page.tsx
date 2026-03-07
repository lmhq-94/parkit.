"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { formatPlate } from "@/lib/inputMasks";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

type TicketRow = {
  id?: string;
  status?: string;
  vehicleId?: string;
  vehicle?: { brand?: string; model?: string; plate?: string };
  parkingId?: string;
  parking?: { name?: string };
  entryTime?: string;
  exitTime?: string;
  createdAt?: string | null;
};

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
      {
        header: t("tables.tickets.parkingId"),
        render: (ticket: { parkingId?: string; parking?: { name?: string } }) =>
          ticket.parking?.name ?? ticket.parkingId ?? "—",
      },
      {
        header: t("tables.tickets.vehicleId"),
        render: (ticket: {
          vehicleId?: string;
          vehicle?: { brand?: string; model?: string; plate?: string };
        }) => {
          const v = ticket.vehicle;
          if (v && (v.brand || v.model || v.plate)) {
            const brandModel = [v.brand, v.model].filter(Boolean).join(" ").trim();
            const plateFormatted = v.plate ? formatPlate(v.plate) : "";
            return brandModel ? `${brandModel} (${plateFormatted})` : (plateFormatted || "—");
          }
          return ticket.vehicleId ?? "—";
        },
      },
      { header: t("tables.tickets.status"), render: (ticket: { status?: string }) => tEnum("ticketStatus", ticket.status), field: "status" as const, editable: superAdmin, statusBadge: "ticket", statusField: "status" },
      {
        header: t("tables.tickets.entry"),
        render: (ticket: { entryTime?: string }) =>
          ticket.entryTime ? new Date(ticket.entryTime).toLocaleString() : "—",
      },
      {
        header: t("tables.tickets.exit"),
        render: (ticket: { exitTime?: string }) =>
          ticket.exitTime ? new Date(ticket.exitTime).toLocaleString() : "—",
      },
    ],
    [t, tEnum, superAdmin]
  );
  return (
    <>
      <DashboardDataTablePage<TicketRow>
        title={t("tables.tickets.title")}
        description={tWithCompany("tables.tickets.description", selectedCompanyName)}
        endpoint="/tickets"
        emptyMessage={t("tables.tickets.empty")}
        columns={columns}
        refreshToken={refreshToken}
        hasRowDetail={(ticket) => ticket.createdAt != null}
        renderRowDetail={(ticket) => (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
            <DetailSectionLabel text={t("common.additionalInfo")} />
            {ticket.createdAt != null && (
              <DetailField label={t("tables.notifications.createdAt")} value={new Date(ticket.createdAt).toLocaleString()} />
            )}
          </dl>
        )}
        onEdit={superAdmin ? (row: { id?: string }) => router.push(`/dashboard/tickets/${row.id}/edit`) : undefined}
        onUpdate={superAdmin ? onUpdate : undefined}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? (row) => {
          const vehicleLabel = row.vehicle ? [row.vehicle.brand, row.vehicle.model].filter(Boolean).join(" ") || (row.vehicle.plate ? formatPlate(row.vehicle.plate) : "") : "";
          const parkingName = row.parking?.name ?? row.parkingId ?? "";
          const dateStr = row.entryTime ? new Date(row.entryTime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "";
          const item = [vehicleLabel || row.vehicleId, parkingName, dateStr].filter(Boolean).join(" · ") || "—";
          return t("tables.tickets.confirmCancelItem").replace(/\{\{item\}\}/g, item);
        } : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/tickets/new"
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
