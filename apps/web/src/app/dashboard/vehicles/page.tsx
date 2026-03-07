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

type VehicleRow = { id?: string; plate?: string; brand?: string; model?: string; year?: number; countryCode?: string };

function VehicleDetailModal({
  vehicle,
  onClose,
  canEdit,
  t,
}: {
  vehicle: VehicleRow;
  onClose: () => void;
  canEdit: boolean;
  t: (key: string) => string;
}) {
  const title = vehicle.plate || [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "—";
  return (
    <RowDetailModal
      title={title}
      editHref={vehicle.id ? `/dashboard/vehicles/${vehicle.id}/edit` : undefined}
      canEdit={canEdit}
      onClose={onClose}
      t={t}
    >
      <dl className="grid grid-cols-3 gap-x-8 gap-y-6">
        <DetailSectionLabel text={t("tables.vehicles.title")} />
        <DetailField label={t("tables.vehicles.plate")} value={vehicle.plate} />
        <DetailField label={t("tables.vehicles.brand")} value={vehicle.brand} />
        <DetailField label={t("tables.vehicles.model")} value={vehicle.model} />
        <DetailField label={t("tables.vehicles.year")} value={vehicle.year} />
      </dl>
    </RowDetailModal>
  );
}

export default function VehiclesPage() {
  const { t, tWithCompany } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const router = useRouter();
  const [viewVehicle, setViewVehicle] = useState<VehicleRow | null>(null);

  const onUpdate = useCallback(async (row: VehicleRow) => {
    if (!row.id) return;
    const payload: { plate?: string; brand?: string; model?: string; year?: number } = {};
    if (row.plate !== undefined) payload.plate = row.plate;
    if (row.brand !== undefined) payload.brand = row.brand;
    if (row.model !== undefined) payload.model = row.model;
    if (row.year !== undefined) payload.year = Number(row.year);
    await apiClient.patch(`/vehicles/${row.id}`, payload);
  }, []);
  const onDelete = useCallback(async (row: VehicleRow) => {
    if (!row.id) return;
    await apiClient.delete(`/vehicles/${row.id}`);
  }, []);
  const columns = useMemo(
    () => [
      { header: t("tables.vehicles.plate"), render: (v: VehicleRow) => v.plate || "—", field: "plate" as const, editable: superAdmin },
      { header: t("tables.vehicles.brand"), render: (v: VehicleRow) => v.brand || "—", field: "brand" as const, editable: superAdmin },
      { header: t("tables.vehicles.model"), render: (v: VehicleRow) => v.model || "—", field: "model" as const, editable: superAdmin },
      { header: t("tables.vehicles.year"), render: (v: VehicleRow) => (v.year != null ? String(v.year) : "—"), field: "year" as const, editable: superAdmin },
    ],
    [t, superAdmin]
  );
  return (
    <>
      <DashboardDataTablePage<VehicleRow>
        title={t("tables.vehicles.title")}
        description={tWithCompany("tables.vehicles.description", selectedCompanyName)}
        endpoint="/vehicles"
        emptyMessage={t("tables.vehicles.empty")}
        columns={columns}
        onView={(row) => {
          document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          setTimeout(() => setViewVehicle(row), 50);
        }}
        onEdit={superAdmin ? (row) => router.push(`/dashboard/vehicles/${row.id}/edit`) : undefined}
        onUpdate={superAdmin ? onUpdate : undefined}
        onDelete={superAdmin ? onDelete : undefined}
        getConfirmDeleteMessage={superAdmin ? () => t("tables.vehicles.confirmDelete") : undefined}
        headerAction={
          superAdmin ? (
            <Link
              href="/dashboard/vehicles/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" strokeWidth={2.25} />
              {t("common.add")}
            </Link>
          ) : undefined
        }
      />
      {viewVehicle && (
        <VehicleDetailModal vehicle={viewVehicle} onClose={() => setViewVehicle(null)} canEdit={superAdmin} t={t} />
      )}
    </>
  );
}
