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

type TicketRow = {
  id?: string;
  status?: string;
  clientId?: string;
  client?: { user?: { firstName?: string; lastName?: string } };
  vehicleId?: string;
  vehicle?: { brand?: string; model?: string; plate?: string };
  parkingId?: string;
  parking?: { name?: string };
  assignments?: Array<{
    valet?: { user?: { firstName?: string; lastName?: string } };
  }>;
  entryTime?: string;
  exitTime?: string;
  createdAt?: string | null;
};

export default function TicketsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const canManage = superAdmin || user?.systemRole === "ADMIN";
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
        colId: "ticket-vehicle",
        header: t("tables.tickets.vehicleId"),
        render: (ticket: {
          vehicleId?: string;
          vehicle?: { brand?: string; model?: string };
        }) => {
          const v = ticket.vehicle;
          if (v && (v.brand || v.model)) {
            return [v.brand, v.model].filter(Boolean).join(" ").trim() || "—";
          }
          return ticket.vehicleId ?? "—";
        },
      },
      {
        colId: "ticket-plate",
        header: t("tables.vehicles.plate"),
        render: (ticket: { vehicle?: { plate?: string } }) =>
          ticket.vehicle?.plate ? formatPlate(ticket.vehicle.plate) : "—",
      },
      { header: t("tables.tickets.status"), render: (ticket: { status?: string }) => tEnum("ticketStatus", ticket.status), field: "status" as const, editable: canManage, statusBadge: "ticket" as const, statusField: "status" as const },
      {
        header: t("tables.tickets.entry"),
        render: (ticket: { entryTime?: string }) =>
          ticket.entryTime ? formatDateTimeDisplay(new Date(ticket.entryTime), t) : "—",
      },
      {
        header: t("tables.tickets.exit"),
        render: (ticket: { exitTime?: string }) =>
          ticket.exitTime ? formatDateTimeDisplay(new Date(ticket.exitTime), t) : "—",
      },
    ],
    [t, tEnum, canManage]
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
        hasRowDetail={() => true}
        renderRowDetail={(ticket) => {
          const ownerName = ticket.client?.user
            ? [ticket.client.user.firstName, ticket.client.user.lastName].filter(Boolean).join(" ").trim()
            : null;
          const valetNames = (ticket.assignments ?? [])
            .map((a) => {
              const u = a.valet?.user;
              if (!u) return null;
              return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || null;
            })
            .filter((n): n is string => Boolean(n));
          const valetLabel = [...new Set(valetNames)].join(", ") || "—";
          return (
            <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
              <DetailSectionLabel text={t("common.additionalInfo")} />
              {ownerName != null && ownerName !== "" && (
                <DetailField label={t("tickets.client")} value={ownerName} />
              )}
              <DetailField label={t("tables.tickets.valet")} value={valetLabel} />
              {ticket.createdAt != null && (
                <DetailField label={t("tables.notifications.createdAt")} value={formatDateTimeDisplay(new Date(ticket.createdAt), t)} />
              )}
            </dl>
          );
        }}
        onEdit={canManage ? (row: { id?: string }) => router.push(`/dashboard/tickets/${row.id}/edit`) : undefined}
        onUpdate={canManage ? onUpdate : undefined}
        onDelete={canManage ? onDelete : undefined}
        getConfirmDeleteMessage={canManage ? (row) => {
          const vehicleLabel = row.vehicle ? [row.vehicle.brand, row.vehicle.model].filter(Boolean).join(" ") || (row.vehicle.plate ? formatPlate(row.vehicle.plate) : "") : "";
          const parkingName = row.parking?.name ?? row.parkingId ?? "";
          const dateStr = row.entryTime ? formatDateTimeDisplay(new Date(row.entryTime), t) : "";
          const item = [vehicleLabel || row.vehicleId, parkingName, dateStr].filter(Boolean).join(" · ") || "—";
          return t("tables.tickets.confirmCancelItem").replace(/\{\{item\}\}/g, item);
        } : undefined}
        headerAction={
          canManage ? (
            <Link
              href="/dashboard/tickets/new"
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
