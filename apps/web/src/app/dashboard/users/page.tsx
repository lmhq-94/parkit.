"use client";

import { useCallback, useMemo, useState } from "react";
import { MailOpen, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ICellRendererParams } from "ag-grid-community";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { StatusFilterToolbar } from "@/components/StatusFilterToolbar";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { formatPhoneInternational } from "@/lib/inputMasks";
import { formatDateTimeDisplay } from "@/lib/dateFormat";
import { makeTzLabel } from "@/lib/companyOptions";
import { InviteUserModal } from "@/components/InviteUserModal";
import type { Invitation } from "@parkit/shared";

const EMPLOYEE_STATUS_OPTIONS = [
  { value: "ACTIVE", labelKey: "tables.employees.active" },
  { value: "INACTIVE", labelKey: "tables.employees.inactive" },
  { value: "PENDING", labelKey: "tables.employees.pendingInvitation" },
] as const;

function UserStatusCellRenderer(
  params: ICellRendererParams<UserRow> & { t: (key: string) => string }
) {
  const { data, t } = params;
  if (!data) return null;
  if (data.pendingInvitation) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
        {t("tables.employees.pendingInvitation")}
      </span>
    );
  }
  const active = data.isActive;
  return (
    <span className={`inline-flex items-center gap-2 text-sm ${active ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-emerald-500" : "bg-red-500"}`} />
      {active ? t("tables.employees.active") : t("tables.employees.inactive")}
    </span>
  );
}

type UserRow = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  systemRole?: string;
  isActive?: boolean;
  pendingInvitation?: boolean;
  phone?: string | null;
  timezone?: string | null;
  lastLogin?: string | null;
  companyId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function UsersPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const router = useRouter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  const onUpdate = useCallback(async (row: UserRow) => {
    if (!row.id || row.pendingInvitation) return;
    const payload: Record<string, unknown> = {};
    if (row.firstName !== undefined) payload.firstName = String(row.firstName).trim();
    if (row.lastName !== undefined) payload.lastName = String(row.lastName).trim();
    if (row.email !== undefined) payload.email = String(row.email).trim();
    if (row.isActive !== undefined) payload.isActive = Boolean(row.isActive);
    if (Object.keys(payload).length === 0) return;
    await apiClient.patch(`/users/${row.id}`, payload);
    setRefreshToken((prev) => prev + 1);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: t("tables.employees.firstName"),
        render: (user: UserRow) => user.firstName || "—",
        field: "firstName" as const,
        editable: (user: UserRow) => !user.pendingInvitation,
      },
      {
        header: t("tables.employees.lastName"),
        render: (user: UserRow) => user.lastName || "—",
        field: "lastName" as const,
        editable: (user: UserRow) => !user.pendingInvitation,
      },
      {
        header: t("tables.employees.email"),
        render: (user: UserRow) => user.email || "—",
        field: "email" as const,
        editable: (user: UserRow) => !user.pendingInvitation,
        linkType: "email",
      },
      {
        header: t("tables.employees.status"),
        render: (user: UserRow) =>
          user.pendingInvitation ? t("tables.employees.pendingInvitation") : (user.isActive ? t("tables.employees.active") : t("tables.employees.inactive")),
        field: "isActive" as const,
        editable: (user: UserRow) => !user.pendingInvitation,
        cellEditorValues: [t("tables.employees.active"), t("tables.employees.inactive")],
        valueGetter: (user: UserRow) => (user.isActive ? t("tables.employees.active") : t("tables.employees.inactive")),
        valueSetter: (user: UserRow, v: unknown) => {
          (user as Record<string, unknown>).isActive = v === t("tables.employees.active");
        },
        cellRenderer: UserStatusCellRenderer,
        cellRendererParams: { t },
        getStatusStyle: (value: string) =>
          value === t("tables.employees.active")
            ? { text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" }
            : { text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
      },
    ],
    [t]
  );

  const getStatusForRow = useCallback((row: UserRow) => {
    if (row.pendingInvitation) return "PENDING";
    return row.isActive ? "ACTIVE" : "INACTIVE";
  }, []);

  const fetchData = useCallback(
    async () => {
      const params = new URLSearchParams();
      params.set("excludeValets", "true");
      params.set("includeInactives", "true");
      params.set("systemRole", "ADMIN");
      params.append("systemRole", "STAFF");

      const [users, invitations] = await Promise.all([
        apiClient.get<UserRow[]>(`/users?${params.toString()}`),
        apiClient.get<Invitation[]>("/users/invitations?role=ADMIN"),
      ]);

      const registeredList = Array.isArray(users) ? users : [];
      const pendingList = (Array.isArray(invitations) ? invitations : []).map((inv) => ({
        id: inv.id,
        firstName: "—",
        lastName: "—",
        email: inv.email,
        systemRole: inv.role,
        pendingInvitation: true,
        isActive: false,
        createdAt: inv.createdAt as string,
      }));

      const list = [...registeredList, ...pendingList];
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      if (statusFilters.length === 0) return list;
      return list.filter((row) => statusFilters.includes(getStatusForRow(row)));
    },
    [statusFilters, getStatusForRow]
  );

  const handleResendInvitation = useCallback(async (row: UserRow) => {
    if (!row.email) return;
    await apiClient.post("/users/invite", { email: row.email, role: row.systemRole });
    setRefreshToken((prev) => prev + 1);
  }, []);

  return (
    <>
      <DashboardDataTablePage<UserRow>
        title={t("tables.employees.title")}
        description={tWithCompany("tables.employees.description", selectedCompanyName)}
        endpoint=""
        fetchData={fetchData}
        emptyMessage={t("tables.employees.empty")}
        columns={columns}
        refreshToken={refreshToken}
        toolbar={
          <StatusFilterToolbar
            tableKey="employees"
            allLabel={t("tables.employees.filterAll")}
            placeholder={t("tables.employees.filterByStatusPlaceholder")}
            clearSelectionLabel={t("grid.clearSelection")}
            options={EMPLOYEE_STATUS_OPTIONS.map((o) => ({
              value: o.value,
              label: t(o.labelKey),
            }))}
            selected={statusFilters}
            onChange={setStatusFilters}
          />
        }
        hasRowDetail={() => true}
        renderRowDetail={(user) => (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
            {user.pendingInvitation && (
              <>
                <DetailSectionLabel text={t("tables.employees.pendingInvitation")} />
                <div className="col-span-3">
                  <button
                    type="button"
                    onClick={() => handleResendInvitation(user)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                  >
                    <MailOpen className="w-4 h-4" />
                    {t("tables.employees.resendInvitation")}
                  </button>
                </div>
              </>
            )}
            <DetailSectionLabel text={t("common.additionalInfo")} />
            <DetailField label={t("tables.employees.role")} value={tEnum("systemRole", user.systemRole)} />
            <DetailField label={t("tables.employees.phone")} value={user.phone ? formatPhoneInternational(user.phone) : undefined} linkType="phone" />
            <DetailField label={t("tables.employees.timezone")} value={user.timezone ? makeTzLabel(user.timezone) : undefined} />
            <DetailField label={t("tables.employees.lastLogin")} value={user.lastLogin ? formatDateTimeDisplay(new Date(user.lastLogin), t) : undefined} />
          </dl>
        )}
        onEdit={(row: UserRow) => !row.pendingInvitation && router.push(`/dashboard/users/${row.id}/edit`)}
        onUpdate={onUpdate}
        headerAction={
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="group inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.25} />
            {t("users.inviteUser")}
          </button>
        }
      />

      <InviteUserModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => setRefreshToken((prev) => prev + 1)}
        defaultRole="ADMIN"
      />
    </>
  );
}
