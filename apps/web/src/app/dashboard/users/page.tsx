"use client";

import { useCallback, useMemo, useState } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { Modal } from "@/components/Modal";

type UserRow = { id?: string; firstName?: string; lastName?: string; email?: string; systemRole?: string; isActive?: boolean };

export default function UsersPage() {
  const { t, tEnum } = useTranslation();
  const [open, setOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    systemRole: "STAFF",
  });
  const [submitting, setSubmitting] = useState(false);

  const onCreate = useCallback(async () => {
    setSubmitting(true);
    try {
      await apiClient.post("/users", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        systemRole: form.systemRole,
      });
      setOpen(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", systemRole: "STAFF" });
      setRefreshToken((x) => x + 1);
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const onDelete = useCallback(async (row: UserRow) => {
    if (row.id) await apiClient.delete(`/users/${row.id}`);
  }, []);
  const onUpdate = useCallback(async (row: UserRow) => {
    if (!row.id) return;
    const payload: Record<string, unknown> = {};
    if (row.firstName !== undefined) payload.firstName = String(row.firstName).trim();
    if (row.lastName !== undefined) payload.lastName = String(row.lastName).trim();
    if (Object.keys(payload).length === 0) return;
    await apiClient.patch(`/users/${row.id}`, payload);
  }, []);
  const columns = useMemo(
    () => [
      {
        header: t("tables.employees.firstName"),
        render: (user: { firstName?: string }) => user.firstName || "N/A",
        field: "firstName" as const,
        editable: true,
      },
      {
        header: t("tables.employees.lastName"),
        render: (user: { lastName?: string }) => user.lastName || "N/A",
        field: "lastName" as const,
        editable: true,
      },
      {
        header: t("tables.employees.email"),
        render: (user: { email?: string }) => user.email || "N/A",
      },
      {
        header: t("tables.employees.role"),
        render: (user: { systemRole?: string }) => tEnum("systemRole", user.systemRole),
      },
      {
        header: t("tables.employees.status"),
        render: (user: { isActive?: boolean }) => (user.isActive ? t("tables.employees.active") : t("tables.employees.inactive")),
      },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage<UserRow>
      title={t("tables.employees.title")}
      description={t("tables.employees.description")}
      endpoint="/users?excludeValets=true"
      emptyMessage={t("tables.employees.empty")}
      columns={columns}
      onUpdate={onUpdate}
      onDelete={onDelete}
      getConfirmDeleteMessage={() => t("tables.employees.confirmDelete")}
      refreshToken={refreshToken}
      headerAction={
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
            description={t("tables.employees.title")}
            onClose={() => (submitting ? null : setOpen(false))}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider">First name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Last name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Role</label>
                <select
                  value={form.systemRole}
                  onChange={(e) => setForm((p) => ({ ...p, systemRole: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="CUSTOMER">CUSTOMER</option>
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
                  onClick={onCreate}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 disabled:opacity-60"
                >
                  {submitting ? t("common.loading") : t("common.save")}
                </button>
              </div>
            </div>
          </Modal>
        </>
      }
    />
  );
}
