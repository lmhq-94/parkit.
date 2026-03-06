"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

export default function BookingsPage() {
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
    scheduledEntryTime: "",
    scheduledExitTime: "",
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

  const createBooking = useCallback(async () => {
    setSubmitting(true);
    try {
      await apiClient.post("/bookings", {
        clientId: form.clientId,
        vehicleId: form.vehicleId,
        parkingId: form.parkingId,
        scheduledEntryTime: new Date(form.scheduledEntryTime).toISOString(),
        ...(form.scheduledExitTime ? { scheduledExitTime: new Date(form.scheduledExitTime).toISOString() } : {}),
      });
      setOpen(false);
      setForm({ clientId: "", vehicleId: "", parkingId: "", scheduledEntryTime: "", scheduledExitTime: "" });
      setRefreshToken((x) => x + 1);
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const onUpdate = useCallback(async (row: { id?: string; status?: string }) => {
    if (!row.id) return;
    if (row.status != null) await apiClient.patch(`/bookings/${row.id}`, { status: row.status });
    setRefreshToken((x) => x + 1);
  }, []);

  const columns = useMemo(
    () => [
      { header: t("tables.bookings.status"), render: (b: { status?: string }) => tEnum("bookingStatus", b.status), field: "status" as const, editable: superAdmin },
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
    [t, tEnum, superAdmin]
  );
  const onDelete = useCallback(async (row: { id?: string }) => {
    if (!row.id) return;
    await apiClient.patch(`/bookings/${row.id}/cancel`);
    setRefreshToken((x) => x + 1);
  }, []);

  return (
    <DashboardDataTablePage
      title={t("tables.bookings.title")}
      description={tWithCompany("tables.bookings.description", selectedCompanyName)}
      endpoint="/bookings"
      emptyMessage={t("tables.bookings.empty")}
      columns={columns}
      refreshToken={refreshToken}
      onUpdate={superAdmin ? onUpdate : undefined}
      onDelete={superAdmin ? onDelete : undefined}
      getConfirmDeleteMessage={superAdmin ? () => t("tables.bookings.confirmCancel") : undefined}
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
            description={t("tables.bookings.title")}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Entrada</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledEntryTime}
                    onChange={(e) => setForm((p) => ({ ...p, scheduledEntryTime: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Salida (opcional)</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledExitTime}
                    onChange={(e) => setForm((p) => ({ ...p, scheduledExitTime: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                  />
                </div>
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
                  onClick={createBooking}
                  disabled={submitting || !form.clientId || !form.vehicleId || !form.parkingId || !form.scheduledEntryTime}
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
