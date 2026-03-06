"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

export default function TicketsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const [open, setOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; user?: { firstName?: string; lastName?: string; email?: string } }>>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: string; plate?: string; brand?: string; model?: string }>>([]);
  const [parkings, setParkings] = useState<Array<{ id: string; name?: string }>>([]);
  const [form, setForm] = useState({
    clientId: "",
    vehicleId: "",
    parkingId: "",
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [c, v, p] = await Promise.all([
          apiClient.get<Array<{ id: string; user?: { firstName?: string; lastName?: string; email?: string } }>>("/clients"),
          apiClient.get<Array<{ id: string; plate?: string; brand?: string; model?: string }>>("/vehicles"),
          apiClient.get<Array<{ id: string; name?: string }>>("/parkings"),
        ]);
        setClients(Array.isArray(c) ? c : []);
        setVehicles(Array.isArray(v) ? v : []);
        setParkings(Array.isArray(p) ? p : []);
      } catch {
        setClients([]);
        setVehicles([]);
        setParkings([]);
      }
    })();
  }, [open]);

  const createTicket = useCallback(async () => {
    setSubmitting(true);
    try {
      await apiClient.post("/tickets", {
        clientId: form.clientId,
        vehicleId: form.vehicleId,
        parkingId: form.parkingId,
      });
      setOpen(false);
      setForm({ clientId: "", vehicleId: "", parkingId: "" });
      setRefreshToken((x) => x + 1);
    } finally {
      setSubmitting(false);
    }
  }, [form]);

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
      onUpdate={superAdmin ? onUpdate : undefined}
      onDelete={superAdmin ? onDelete : undefined}
      getConfirmDeleteMessage={superAdmin ? () => t("tables.tickets.confirmCancel") : undefined}
      headerAction={
        superAdmin ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
          >
            {t("common.add")}
          </button>
          <Modal
            open={open}
            title={t("common.add")}
            description={t("tables.tickets.title")}
            onClose={() => (submitting ? null : setOpen(false))}
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Cliente</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                >
                  <option value="">Seleccionar…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {`${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.trim() || c.user?.email || c.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Vehículo</label>
                <select
                  value={form.vehicleId}
                  onChange={(e) => setForm((p) => ({ ...p, vehicleId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                >
                  <option value="">Seleccionar…</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate ? `${v.plate} ${[v.brand, v.model].filter(Boolean).join(" ")}`.trim() : v.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Parking</label>
                <select
                  value={form.parkingId}
                  onChange={(e) => setForm((p) => ({ ...p, parkingId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                >
                  <option value="">Seleccionar…</option>
                  {parkings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name ?? p.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-input-border text-sm font-semibold text-text-secondary hover:bg-input-bg disabled:opacity-60"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={createTicket}
                  disabled={submitting || !form.clientId || !form.vehicleId || !form.parkingId}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 disabled:opacity-60"
                >
                  {submitting ? t("common.loading") : t("common.save")}
                </button>
              </div>
            </div>
          </Modal>
        </>
        ) : undefined
      }
    />
  );
}
