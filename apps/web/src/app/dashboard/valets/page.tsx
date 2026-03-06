"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

type ValetRow = { id?: string; user?: { firstName?: string; lastName?: string; email?: string }; currentStatus?: string; licenseNumber?: string };

export default function ValetsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const [open, setOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; firstName?: string; lastName?: string; email?: string }>>([]);
  const [form, setForm] = useState({
    userId: "",
    licenseNumber: "",
    licenseExpiry: "",
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const data = await apiClient.get<Array<{ id: string; firstName?: string; lastName?: string; email?: string }>>(
          "/users?excludeValets=true"
        );
        setUsers(Array.isArray(data) ? data : []);
      } catch {
        setUsers([]);
      }
    })();
  }, [open]);

  const createValet = useCallback(async () => {
    setSubmitting(true);
    try {
      await apiClient.post("/valets", {
        userId: form.userId,
        licenseNumber: form.licenseNumber.trim(),
        licenseExpiry: new Date(form.licenseExpiry).toISOString(),
      });
      setOpen(false);
      setForm({ userId: "", licenseNumber: "", licenseExpiry: "" });
      setRefreshToken((x) => x + 1);
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const onDelete = useCallback(async (row: ValetRow) => {
    if (row.id) await apiClient.delete(`/valets/${row.id}`);
  }, []);
  const onUpdate = useCallback(async (row: ValetRow) => {
    if (!row.id) return;
    const payload: Record<string, unknown> = {};
    if (row.licenseNumber !== undefined) payload.licenseNumber = String(row.licenseNumber).trim();
    if (row.licenseExpiry !== undefined) payload.licenseExpiry = row.licenseExpiry;
    if (Object.keys(payload).length === 0) return;
    await apiClient.patch(`/valets/${row.id}`, payload);
  }, []);
  const columns = useMemo(
    () => [
      {
        header: t("tables.valets.name"),
        render: (valet: { user?: { firstName?: string; lastName?: string; email?: string } }) => {
          const u = valet.user;
          if (!u) return "N/A";
          return `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "N/A";
        },
      },
      {
        header: t("tables.valets.email"),
        render: (valet: { user?: { email?: string } }) => valet.user?.email ?? "N/A",
      },
      {
        header: t("tables.valets.status"),
        render: (valet: { currentStatus?: string }) => tEnum("valetStatus", valet.currentStatus),
      },
      {
        header: t("tables.valets.license"),
        render: (valet: { licenseNumber?: string }) => valet.licenseNumber ?? "—",
        field: "licenseNumber" as const,
        editable: superAdmin,
      },
    ],
    [t, tEnum, superAdmin]
  );
  return (
    <DashboardDataTablePage<ValetRow>
      title={t("tables.valets.title")}
      description={tWithCompany("tables.valets.description", selectedCompanyName)}
      endpoint="/valets"
      emptyMessage={t("tables.valets.empty")}
      columns={columns}
      onUpdate={superAdmin ? onUpdate : undefined}
      onDelete={superAdmin ? onDelete : undefined}
      getConfirmDeleteMessage={superAdmin ? () => t("tables.valets.confirmDelete") : undefined}
      refreshToken={refreshToken}
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
            description={t("tables.valets.title")}
            onClose={() => (submitting ? null : setOpen(false))}
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Usuario</label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                >
                  <option value="">Seleccionar…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || u.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Licencia</label>
                <input
                  value={form.licenseNumber}
                  onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Vence</label>
                <input
                  type="datetime-local"
                  value={form.licenseExpiry}
                  onChange={(e) => setForm((p) => ({ ...p, licenseExpiry: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                />
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
                  onClick={createValet}
                  disabled={submitting || !form.userId || !form.licenseNumber || !form.licenseExpiry}
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
