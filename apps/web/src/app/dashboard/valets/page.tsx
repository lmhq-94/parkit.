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

type ValetRow = { id?: string; user?: { firstName?: string; lastName?: string; email?: string; phone?: string | null }; currentStatus?: string; licenseNumber?: string };

function ValetDetailModal({
  valet,
  onClose,
  canEdit,
  t,
  tEnum,
}: {
  valet: ValetRow;
  onClose: () => void;
  canEdit: boolean;
  t: (key: string) => string;
  tEnum: (ns: string, val?: string | null) => string;
}) {
  const u = valet.user;
  const title = u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "—" : "—";
  const isAvailable = valet.currentStatus === "AVAILABLE";
  return (
    <RowDetailModal
      title={title}
      subtitle={u?.email}
      statusLabel={valet.currentStatus ? tEnum("valetStatus", valet.currentStatus) : undefined}
      statusActive={isAvailable}
      editHref={valet.id ? `/dashboard/valets/${valet.id}/edit` : undefined}
      canEdit={canEdit}
      onClose={onClose}
      t={t}
    >
      <dl className="grid grid-cols-3 gap-x-8 gap-y-6">
        <DetailSectionLabel text={t("tables.valets.title")} />
        <DetailField label={t("tables.valets.name")} value={u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : undefined} />
        <DetailField label={t("tables.valets.email")} value={u?.email} />
        <DetailField label={t("tables.employees.phone")} value={u?.phone} />
        <DetailField label={t("tables.valets.status")} value={valet.currentStatus ? tEnum("valetStatus", valet.currentStatus) : undefined} />
      </dl>
    </RowDetailModal>
  );
}

export default function ValetsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [viewValet, setViewValet] = useState<ValetRow | null>(null);

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
        header: t("tables.employees.phone"),
        render: (valet: { user?: { phone?: string | null } }) => valet.user?.phone ?? "—",
        linkType: "phone",
      },
      {
        header: t("tables.valets.status"),
        render: (valet: { currentStatus?: string }) => tEnum("valetStatus", valet.currentStatus),
        statusBadge: "valet",
        statusField: "currentStatus",
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
        onView={(row) => {
          document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          setTimeout(() => setViewValet(row), 50);
        }}
        onEdit={superAdmin ? (row) => router.push(`/dashboard/valets/${row.id}/edit`) : undefined}
        onUpdate={superAdmin ? onUpdate : undefined}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? () => t("tables.valets.confirmDelete") : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/valets/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" strokeWidth={2.25} />
              {t("common.add")}
            </Link>
          ) : undefined
        }
      />
      {viewValet && (
        <ValetDetailModal valet={viewValet} onClose={() => setViewValet(null)} canEdit={superAdmin} t={t} tEnum={tEnum} />
      )}
    </>
  );
}
