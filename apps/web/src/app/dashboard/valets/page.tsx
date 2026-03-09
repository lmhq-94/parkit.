"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ICellRendererParams } from "ag-grid-community";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { formatPhoneWithCountryCode } from "@/lib/inputMasks";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

type ValetRow = {
  id?: string;
  user?: { id?: string; firstName?: string; lastName?: string; email?: string; phone?: string | null; pendingInvitation?: boolean };
  currentStatus?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  ratingAvg?: number;
};

export default function ValetsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);

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

  const handleResendInvitation = useCallback(async (row: ValetRow) => {
    if (row.user?.id) {
      await apiClient.post(`/users/${row.user.id}/resend-invitation`, {});
      setRefreshToken((prev) => prev + 1);
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        header: t("tables.employees.firstName"),
        render: (valet: { user?: { firstName?: string } }) => valet.user?.firstName ?? "—",
      },
      {
        header: t("tables.employees.lastName"),
        render: (valet: { user?: { lastName?: string } }) => valet.user?.lastName ?? "—",
      },
      {
        header: t("tables.valets.email"),
        render: (valet: { user?: { email?: string } }) => valet.user?.email ?? "—",
        linkType: "email",
      },
      {
        header: t("tables.valets.status"),
        render: (valet: { user?: { pendingInvitation?: boolean }; currentStatus?: string }) =>
          valet.user?.pendingInvitation ? t("tables.employees.pendingInvitation") : tEnum("valetStatus", valet.currentStatus),
        cellRenderer: function ValetStatusCell(
          params: ICellRendererParams<ValetRow> & { t: (k: string) => string; tEnum: (ns: string, v?: string | null) => string }
        ) {
          const { data, t, tEnum } = params;
          if (!data) return null;
          if (data.user?.pendingInvitation) {
            return (
              <span className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
                {t("tables.employees.pendingInvitation")}
              </span>
            );
          }
          const status = data.currentStatus;
          const label = tEnum("valetStatus", status);
          const variant =
            status === "AVAILABLE" ? "text-emerald-600 dark:text-emerald-400" : status === "BUSY" ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400";
          const dot =
            status === "AVAILABLE" ? "bg-emerald-500" : status === "BUSY" ? "bg-amber-500" : "bg-slate-400";
          return (
            <span className={`inline-flex items-center gap-2 text-sm ${variant}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
              {label || "—"}
            </span>
          );
        },
        cellRendererParams: { t, tEnum },
      },
    ],
    [t, tEnum]
  );
  return (
    <>
      <DashboardDataTablePage<ValetRow>
        title={t("tables.valets.title")}
        description={tWithCompany("tables.valets.description", selectedCompanyName)}
        endpoint="/valets"
        emptyMessage={t("tables.valets.empty")}
        columns={columns}
        refreshToken={refreshToken}
        hasRowDetail={
          superAdmin
            ? (valet) =>
                valet.user?.pendingInvitation === true ||
                (valet.user?.phone != null && valet.user.phone !== "") ||
                (valet.licenseNumber != null && valet.licenseNumber !== "") ||
                valet.licenseExpiry != null ||
                valet.ratingAvg != null
            : undefined
        }
        renderRowDetail={
          superAdmin
            ? (valet) => (
                <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
                  {valet.user?.pendingInvitation && (
                    <>
                      <DetailSectionLabel text={t("tables.employees.pendingInvitation")} />
                      <div className="col-span-3">
                        <button
                          type="button"
                          onClick={() => handleResendInvitation(valet)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {t("tables.employees.resendInvitation")}
                        </button>
                      </div>
                    </>
                  )}
                  <DetailSectionLabel text={t("common.additionalInfo")} />
                  <DetailField label={t("tables.employees.phone")} value={valet.user?.phone ? formatPhoneWithCountryCode(valet.user.phone, "CR") : undefined} linkType="phone" />
                  <DetailField label={t("tables.valets.license")} value={valet.licenseNumber} />
                  <DetailField label={t("valets.licenseExpiry")} value={valet.licenseExpiry ? new Date(valet.licenseExpiry).toLocaleDateString() : undefined} />
                  {valet.ratingAvg != null && (
                    <DetailField label={t("valets.ratingAvg")} value={String(valet.ratingAvg)} />
                  )}
                </dl>
              )
            : undefined
        }
        onEdit={superAdmin ? (row) => router.push(`/dashboard/valets/${row.id}/edit`) : undefined}
        onUpdate={superAdmin ? onUpdate : undefined}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? (row) => t("tables.valets.confirmDeleteItem").replace(/\{\{item\}\}/g, [row.user?.firstName, row.user?.lastName].filter(Boolean).join(" ") || row.user?.email || "—") : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/valets/new"
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
