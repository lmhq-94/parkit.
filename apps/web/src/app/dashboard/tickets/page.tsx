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

type VehicleOption = { id: string; plate?: string; brand?: string; model?: string };
type ParkingOption = { id: string; name?: string };

const TICKET_STATUS_OPTIONS = [
  { value: "PARKED", key: "PARKED" },
  { value: "REQUESTED", key: "REQUESTED" },
  { value: "DELIVERED", key: "DELIVERED" },
  { value: "CANCELLED", key: "CANCELLED" },
] as const;

export default function TicketsPage() {
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
      const url = params ? `/tickets?${params}` : "/tickets";
      return apiClient.get<TicketRow[]>(url);
    },
    [statusFilters]
  );

  const onUpdate = useCallback(async (row: TicketRow) => {
    if (!row.id) return;
    const payload: Record<string, unknown> = {};
    if (row.status != null) payload.status = row.status;
    if (row.parkingId) payload.parkingId = row.parkingId;
    if (row.vehicleId) payload.vehicleId = row.vehicleId;
    if (row.entryTime) payload.entryTime = new Date(row.entryTime).toISOString();
    if (row.exitTime) payload.exitTime = new Date(row.exitTime).toISOString();
    await apiClient.patch(`/tickets/${row.id}`, payload);
    setRefreshToken((x) => x + 1);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: t("tables.tickets.parkingId"),
        render: (ticket: TicketRow) => {
          if (ticket.parking?.name) return ticket.parking.name;
          const opt = parkings.find((p) => p.id === ticket.parkingId);
          if (opt) return opt.name ?? opt.id ?? "—";
          return ticket.parkingId ?? "—";
        },
        field: "parkingId" as const,
        editable: canManage,
        cellEditorValues: parkings.map((p) => p.id),
        cellEditorLabels: parkings.map((p) => p.name ?? p.id),
      },
      {
        colId: "ticket-vehicle",
        header: t("tables.tickets.vehicleId"),
        render: (ticket: TicketRow) => {
          const v = ticket.vehicle;
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
          if (ticket.vehicleId) {
            const opt = vehicles.find((x) => x.id === ticket.vehicleId);
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
            return ticket.vehicleId;
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
        header: t("tables.tickets.status"),
        render: (ticket: { status?: string }) => tEnum("ticketStatus", ticket.status),
        field: "status" as const,
        editable: canManage,
        statusBadge: "ticket" as const,
        statusField: "status" as const,
        cellEditorValues: ["PARKED", "REQUESTED", "DELIVERED", "CANCELLED"],
        cellEditorLabels: ["PARKED", "REQUESTED", "DELIVERED", "CANCELLED"].map((v) => tEnum("ticketStatus", v)),
      },
      {
        header: t("tables.tickets.entry"),
        render: (ticket: { entryTime?: string }) =>
          ticket.entryTime ? formatDateTimeDisplay(new Date(ticket.entryTime), t) : "—",
        field: "entryTime" as const,
        editable: canManage,
        cellEditorDateTime: true,
      },
      {
        header: t("tables.tickets.exit"),
        render: (ticket: { exitTime?: string }) =>
          ticket.exitTime ? formatDateTimeDisplay(new Date(ticket.exitTime), t) : "—",
        field: "exitTime" as const,
        editable: canManage,
        cellEditorDateTime: true,
      },
    ],
    [t, tEnum, canManage, vehicles, parkings]
  );
  return (
    <>
      <DashboardDataTablePage<TicketRow>
        title={t("tables.tickets.title")}
        description={tWithCompany("tables.tickets.description", selectedCompanyName)}
        endpoint=""
        fetchData={fetchData}
        emptyMessage={t("tables.tickets.empty")}
        columns={columns}
        refreshToken={refreshToken}
        toolbar={
          <StatusFilterToolbar
            tableKey="tickets"
            allLabel={t("tables.tickets.filterAll")}
            placeholder={t("tables.tickets.filterStatusPlaceholder")}
            clearSelectionLabel={t("grid.clearSelection")}
            options={TICKET_STATUS_OPTIONS.map((o) => ({
              value: o.value,
              label: tEnum("ticketStatus", o.key),
            }))}
            selected={statusFilters}
            onChange={setStatusFilters}
          />
        }
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
