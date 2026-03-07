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

type TicketRow = {
  id?: string;
  status?: string;
  vehicleId?: string;
  vehicle?: { brand?: string; model?: string; plate?: string };
  parkingId?: string;
  parking?: { name?: string };
  entryTime?: string;
  exitTime?: string;
};

function TicketDetailModal({
  ticket,
  onClose,
  canEdit,
  t,
  tEnum,
}: {
  ticket: TicketRow;
  onClose: () => void;
  canEdit: boolean;
  t: (key: string) => string;
  tEnum: (ns: string, val?: string | null) => string;
}) {
  const v = ticket.vehicle;
  const vehicleLabel = v && (v.brand || v.model || v.plate)
    ? [v.brand, v.model].filter(Boolean).join(" ").trim() + (v.plate ? ` (${v.plate})` : "")
    : ticket.vehicleId;
  const title = ticket.id ? `Tiquete ${ticket.id.slice(0, 8)}` : "—";
  const isActive = ticket.status !== "CANCELLED" && ticket.status !== "COMPLETED";
  return (
    <RowDetailModal
      title={title}
      statusLabel={ticket.status ? tEnum("ticketStatus", ticket.status) : undefined}
      statusActive={isActive}
      editHref={ticket.id ? `/dashboard/tickets/${ticket.id}/edit` : undefined}
      canEdit={canEdit}
      onClose={onClose}
      t={t}
    >
      <dl className="grid grid-cols-3 gap-x-8 gap-y-6">
        <DetailSectionLabel text={t("tables.tickets.title")} />
        <DetailField label={t("tables.tickets.status")} value={ticket.status ? tEnum("ticketStatus", ticket.status) : undefined} />
        <DetailField label={t("tables.tickets.vehicleId")} value={vehicleLabel} />
        <DetailField label={t("tables.tickets.parkingId")} value={ticket.parking?.name ?? ticket.parkingId} />
        <DetailField label={t("tables.tickets.entry")} value={ticket.entryTime ? new Date(ticket.entryTime).toLocaleString() : undefined} />
        <DetailField label={t("tables.tickets.exit")} value={ticket.exitTime ? new Date(ticket.exitTime).toLocaleString() : undefined} />
      </dl>
    </RowDetailModal>
  );
}

export default function TicketsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);
  const [viewTicket, setViewTicket] = useState<TicketRow | null>(null);

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
            return brandModel ? `${brandModel} (${v.plate ?? ""})` : (v.plate ?? "—");
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
        onView={(row) => {
          document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          setTimeout(() => setViewTicket(row as TicketRow), 50);
        }}
        onEdit={superAdmin ? (row: { id?: string }) => router.push(`/dashboard/tickets/${row.id}/edit`) : undefined}
        onUpdate={superAdmin ? onUpdate : undefined}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? () => t("tables.tickets.confirmCancel") : undefined}
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
      {viewTicket && (
        <TicketDetailModal
          ticket={viewTicket}
          onClose={() => setViewTicket(null)}
          canEdit={superAdmin}
          t={t}
          tEnum={tEnum}
        />
      )}
    </>
  );
}
