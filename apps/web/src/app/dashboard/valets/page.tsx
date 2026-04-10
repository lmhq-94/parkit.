"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MailOpen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ICellRendererParams } from "ag-grid-community";
import { PageLoader } from "@/components/PageLoader";

const DashboardDataTablePage = dynamic(
  () => import("@/components/DashboardDataTablePage").then((m) => ({ default: m.DashboardDataTablePage })),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center p-8"><PageLoader /></div> }
);
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { formatDateTimeDisplay } from "@/lib/dateFormat";
import { formatPhoneInternational } from "@/lib/inputMasks";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { StatusFilterToolbar } from "@/components/StatusFilterToolbar";

type ValetLastActivity = {
  companyId?: string | null;
  companyName?: string | null;
  parkingId?: string | null;
  parkingName?: string | null;
  assignedAt?: string | null;
};

type ValetRow = {
  id?: string;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
    pendingInvitation?: boolean;
    isActive?: boolean;
    lastLogin?: string | null;
  };
  currentStatus?: string;
  staffRole?: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  ratingAvg?: number | null;
  lastActivity?: ValetLastActivity | null;
};

const VALET_STATUS_OPTIONS = [
  { value: "AVAILABLE", key: "AVAILABLE" },
  { value: "BUSY", key: "BUSY" },
  { value: "AWAY", key: "AWAY" },
] as const;

/** Activo / inactivo (cuenta de usuario), mismo criterio que empleados. */
function ValetAccountStatusCell(
  params: ICellRendererParams<ValetRow> & { t: (key: string) => string }
) {
  const { data, t } = params;
  if (!data?.user) return null;
  const u = data.user;
  if (u.pendingInvitation) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
        {t("tables.employees.pendingInvitation")}
      </span>
    );
  }
  const active = u.isActive !== false;
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm ${active ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-emerald-500" : "bg-red-500"}`} />
      {active ? t("tables.employees.active") : t("tables.employees.inactive")}
    </span>
  );
}

export default function ValetsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [refreshToken, setRefreshToken] = useState(0);
  /** Filtro de cuenta de usuario: activo / inactivo (antes que disponibilidad). */
  const [accountFilters, setAccountFilters] = useState<string[]>([]);
  /** Filtro de disponibilidad del valet (AVAILABLE / BUSY / AWAY). */
  const [availabilityFilters, setAvailabilityFilters] = useState<string[]>([]);

  const fetchData = useCallback(
    async (_userId: string) => {
      const qs: string[] = [];
      for (const a of accountFilters) {
        qs.push(`accountStatus=${encodeURIComponent(a)}`);
      }
      for (const s of availabilityFilters) {
        qs.push(`status=${encodeURIComponent(s)}`);
      }
      const url = qs.length > 0 ? `/valets?${qs.join("&")}` : "/valets";
      return apiClient.get<ValetRow[]>(url);
    },
    [accountFilters, availabilityFilters]
  );

  const onUpdate = useCallback(async (row: ValetRow) => {
    if (!row.id) return;
    const userId = row.user?.id;
    const userPayload: Record<string, unknown> = {};
    if (row.user) {
      if (row.user.firstName !== undefined) userPayload.firstName = String(row.user.firstName).trim();
      if (row.user.lastName !== undefined) userPayload.lastName = String(row.user.lastName).trim();
      if (row.user.email !== undefined) userPayload.email = String(row.user.email).trim();
      if (row.user.isActive !== undefined) {
        userPayload.isActive = row.user.isActive === true;
      }
    }
    if (userId && Object.keys(userPayload).length > 0) {
      await apiClient.patch(`/users/${userId}`, userPayload);
    }
    const valetPayload: Record<string, unknown> = {};
    if (typeof row.licenseNumber === "string") {
      valetPayload.licenseNumber = row.licenseNumber.trim();
    }
    if (typeof row.licenseExpiry === "string" && row.licenseExpiry.trim() !== "") {
      valetPayload.licenseExpiry = row.licenseExpiry;
    }
    if (Object.keys(valetPayload).length > 0) {
      await apiClient.patch(`/valets/${row.id}`, valetPayload);
    }
    setRefreshToken((prev) => prev + 1);
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
        field: "userFirstName",
        editable: superAdmin,
        valueGetter: (valet: ValetRow) => valet.user?.firstName,
        valueSetter: (valet: ValetRow, v: unknown) => {
          if (valet.user) valet.user.firstName = String(v ?? "");
        },
      },
      {
        header: t("tables.employees.lastName"),
        render: (valet: { user?: { lastName?: string } }) => valet.user?.lastName ?? "—",
        field: "userLastName",
        editable: superAdmin,
        valueGetter: (valet: ValetRow) => valet.user?.lastName,
        valueSetter: (valet: ValetRow, v: unknown) => {
          if (valet.user) valet.user.lastName = String(v ?? "");
        },
      },
      {
        header: t("tables.valets.email"),
        render: (valet: { user?: { email?: string } }) => valet.user?.email ?? "—",
        field: "userEmail",
        editable: superAdmin,
        linkType: "email",
        valueGetter: (valet: ValetRow) => valet.user?.email,
        valueSetter: (valet: ValetRow, v: unknown) => {
          if (valet.user) valet.user.email = String(v ?? "");
        },
      },
      {
        header: t("tables.valets.staffRole"),
        render: (valet: ValetRow) =>
          valet.staffRole ? tEnum("valetStaffRole", valet.staffRole) : "—",
        field: "staffRole",
        editable: false,
      },
      {
        header: t("tables.valets.status"),
        render: (valet: ValetRow) => {
          if (valet.user?.pendingInvitation) return t("tables.employees.pendingInvitation");
          return valet.user?.isActive !== false ? t("tables.employees.active") : t("tables.employees.inactive");
        },
        field: "valetAccountActive",
        editable: (valet: ValetRow) => Boolean(superAdmin && !valet.user?.pendingInvitation),
        cellEditorValues: [t("tables.employees.active"), t("tables.employees.inactive")],
        valueGetter: (valet: ValetRow) => {
          if (valet.user?.pendingInvitation) return t("tables.employees.pendingInvitation");
          return valet.user?.isActive !== false ? t("tables.employees.active") : t("tables.employees.inactive");
        },
        valueSetter: (valet: ValetRow, v: unknown) => {
          if (valet.user) {
            valet.user.isActive = v === t("tables.employees.active");
          }
        },
        cellRenderer: ValetAccountStatusCell,
        cellRendererParams: { t },
        getStatusStyle: (value: string) =>
          value === t("tables.employees.active")
            ? { text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" }
            : value === t("tables.employees.inactive")
              ? { text: "text-red-600 dark:text-red-400", dot: "bg-red-500" }
              : { text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
      },
    ],
    [t, tEnum, superAdmin]
  );
  return (
    <>
      <DashboardDataTablePage<ValetRow>
        title={t("tables.valets.title")}
        description={superAdmin ? t("tables.valets.descriptionAll") : tWithCompany("tables.valets.description", selectedCompanyName)}
        endpoint=""
        fetchData={fetchData}
        emptyMessage={t("tables.valets.empty")}
        columns={columns}
        refreshToken={refreshToken}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <StatusFilterToolbar
              tableKey="valets-account"
              allLabel={t("tables.valets.filterAll")}
              placeholder={t("tables.valets.filterAccountPlaceholder")}
              clearSelectionLabel={t("grid.clearSelection")}
              options={[
                { value: "active", label: t("tables.employees.active") },
                { value: "inactive", label: t("tables.employees.inactive") },
              ]}
              selected={accountFilters}
              onChange={setAccountFilters}
            />
            <StatusFilterToolbar
              tableKey="valets-availability"
              allLabel={t("tables.valets.filterAll")}
              placeholder={t("tables.valets.filterAvailabilityPlaceholder")}
              clearSelectionLabel={t("grid.clearSelection")}
              options={VALET_STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: tEnum("valetStatus", o.key),
              }))}
              selected={availabilityFilters}
              onChange={setAvailabilityFilters}
            />
          </div>
        }
        hasRowDetail={superAdmin ? () => true : undefined}
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
                          <MailOpen className="w-4 h-4" />
                          {t("tables.employees.resendInvitation")}
                        </button>
                      </div>
                    </>
                  )}
                  <DetailSectionLabel text={t("common.additionalInfo")} />
                  <DetailField
                    label={t("tables.valets.lastActivity")}
                    value={
                      valet.lastActivity?.companyName || valet.lastActivity?.parkingName
                        ? [valet.lastActivity?.companyName, valet.lastActivity?.parkingName].filter(Boolean).join(" · ")
                        : undefined
                    }
                  />
                  <DetailField
                    label={t("tables.valets.activityAt")}
                    value={
                      valet.lastActivity?.assignedAt
                        ? formatDateTimeDisplay(new Date(valet.lastActivity.assignedAt), t)
                        : undefined
                    }
                  />
                  <DetailField
                    label={t("tables.valets.availabilityStatus")}
                    value={
                      valet.user?.pendingInvitation
                        ? t("tables.employees.pendingInvitation")
                        : tEnum("valetStatus", valet.currentStatus)
                    }
                  />
                  <DetailField
                    label={t("tables.valets.staffRole")}
                    value={valet.staffRole ? tEnum("valetStaffRole", valet.staffRole) : undefined}
                  />
                  <DetailField label={t("tables.employees.phone")} value={valet.user?.phone ? formatPhoneInternational(valet.user.phone) : undefined} linkType="phone" />
                  <DetailField label={t("tables.valets.license")} value={valet.licenseNumber} />
                  <DetailField label={t("valets.licenseExpiry")} value={valet.licenseExpiry ? new Date(valet.licenseExpiry).toLocaleDateString() : undefined} />
                  {valet.ratingAvg != null && (
                    <DetailField label={t("valets.ratingAvg")} value={String(valet.ratingAvg)} />
                  )}
                  <DetailField
                    label={t("tables.employees.lastLogin")}
                    value={
                      valet.user?.lastLogin
                        ? formatDateTimeDisplay(new Date(valet.user.lastLogin), t)
                        : undefined
                    }
                  />
                </dl>
              )
            : undefined
        }
        onEdit={superAdmin ? (row) => router.push(`/dashboard/valets/${row.id}/edit`) : undefined}
        onUpdate={superAdmin ? onUpdate : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/valets/new"
              className="group inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" strokeWidth={2.25} />
              {t("common.add")}
            </Link>
          ) : undefined
        }
      />
    </>
  );
}
