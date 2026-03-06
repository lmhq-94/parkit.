"use client";

import { useCallback, useMemo, useState } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { Modal } from "@/components/Modal";

interface Company {
  id: string;
  legalName?: string;
  commercialName?: string;
  legalAddress?: string;
  taxId?: string;
  countryCode?: string;
  currency?: string;
  timezone?: string;
  billingEmail?: string;
  contactPhone?: string;
  status?: string;
  name?: string;
  email?: string;
}

const defaultForm = {
  legalName: "",
  taxId: "",
  commercialName: "",
  countryCode: "CR",
  currency: "CRC",
  timezone: "UTC",
  billingEmail: "",
  contactPhone: "",
  legalAddress: "",
};

export default function CompaniesPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const [open, setOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useMemo(
    () => async (_userId: string): Promise<Company[]> => {
      const u = useAuthStore.getState().user;
      if (isSuperAdmin(u)) {
        const data = await apiClient.get<Company[]>("/companies");
        return Array.isArray(data) ? data : [];
      }
      const data = await apiClient.get<Company>("/companies/me");
      return data ? [data] : [];
    },
    []
  );

  const columns = useMemo(
    () => [
      {
        header: t("tables.companies.name"),
        render: (c: Company) =>
          c.name ?? c.commercialName ?? c.legalName ?? "N/A",
        field: "commercialName" as const,
        editable: true,
      },
      {
        header: t("tables.companies.email"),
        render: (c: Company) => c.email ?? c.billingEmail ?? "N/A",
        field: "billingEmail" as const,
        editable: true,
      },
      {
        header: t("tables.companies.status"),
        render: (c: Company) => tEnum("companyStatus", c.status),
      },
    ],
    [t, tEnum]
  );

  const title = superAdmin
    ? t("tables.companies.title")
    : t("tables.companies.titleMyCompany");
  const description = superAdmin
    ? t("tables.companies.description")
    : tWithCompany("tables.companies.descriptionMyCompany", selectedCompanyName);

  const onCreate = useCallback(async () => {
    setSubmitting(true);
    try {
      await apiClient.post("/companies", {
        legalName: form.legalName.trim(),
        taxId: form.taxId.trim(),
        commercialName: form.commercialName.trim() || undefined,
        countryCode: form.countryCode.trim() || undefined,
        currency: form.currency.trim() || undefined,
        timezone: form.timezone.trim() || undefined,
        billingEmail: form.billingEmail.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        legalAddress: form.legalAddress.trim() || undefined,
      });
      setOpen(false);
      setForm(defaultForm);
      setRefreshToken((x) => x + 1);
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const onUpdate = useCallback(
    async (row: Company) => {
      if (!row.id) return;
      const payload: {
        legalName?: string;
        commercialName?: string;
        billingEmail?: string;
        contactPhone?: string;
        legalAddress?: string;
      } = {};
      if (row.legalName !== undefined) payload.legalName = String(row.legalName).trim();
      if (row.commercialName !== undefined) payload.commercialName = String(row.commercialName).trim();
      if (row.billingEmail !== undefined) payload.billingEmail = String(row.billingEmail).trim() || undefined;
      if (row.contactPhone !== undefined) payload.contactPhone = String(row.contactPhone).trim();
      if (row.legalAddress !== undefined) payload.legalAddress = String(row.legalAddress).trim();
      if (Object.keys(payload).length === 0) return;
      if (superAdmin) {
        await apiClient.patch(`/companies/${row.id}`, payload);
      } else {
        await apiClient.patch("/companies/me", payload);
      }
    },
    [superAdmin]
  );

  const onDelete = useCallback(async (row: Company) => {
    if (!row.id) return;
    await apiClient.delete(`/companies/${row.id}`);
  }, []);

  return (
    <>
      <DashboardDataTablePage<Company>
        title={title}
        description={description}
        endpoint="/companies"
        fetchData={fetchData}
        columns={columns}
        emptyMessage={t("tables.companies.empty")}
        onUpdate={onUpdate}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? () => t("tables.companies.confirmDelete") : undefined}
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
                title={t("companies.newCompany")}
                description={t("companies.newCompanyDescription")}
                onClose={() => (submitting ? undefined : setOpen(false))}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {t("companies.legalName")} *
                      </label>
                      <input
                        value={form.legalName}
                        onChange={(e) => setForm((p) => ({ ...p, legalName: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {t("companies.taxId")} *
                      </label>
                      <input
                        value={form.taxId}
                        onChange={(e) => setForm((p) => ({ ...p, taxId: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {t("companies.commercialName")}
                      </label>
                      <input
                        value={form.commercialName}
                        onChange={(e) => setForm((p) => ({ ...p, commercialName: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {t("companies.billingEmail")}
                      </label>
                      <input
                        type="email"
                        value={form.billingEmail}
                        onChange={(e) => setForm((p) => ({ ...p, billingEmail: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {t("companies.countryCode")}
                      </label>
                      <input
                        value={form.countryCode}
                        onChange={(e) => setForm((p) => ({ ...p, countryCode: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {t("companies.currency")}
                      </label>
                      <input
                        value={form.currency}
                        onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {t("companies.contactPhone")}
                      </label>
                      <input
                        value={form.contactPhone}
                        onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {t("companies.legalAddress")}
                      </label>
                      <input
                        value={form.legalAddress}
                        onChange={(e) => setForm((p) => ({ ...p, legalAddress: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {t("companies.timezone")}
                      </label>
                      <input
                        value={form.timezone}
                        onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-input-bg border border-input-border text-sm text-text-primary"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => !submitting && setOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-input-border bg-input-bg text-sm font-medium text-text-secondary hover:bg-card"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={onCreate}
                      disabled={submitting || !form.legalName.trim() || !form.taxId.trim()}
                      className="px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {submitting ? t("companies.creating") : t("companies.createCompany")}
                    </button>
                  </div>
                </div>
              </Modal>
            </>
          ) : undefined
        }
      />
    </>
  );
}
