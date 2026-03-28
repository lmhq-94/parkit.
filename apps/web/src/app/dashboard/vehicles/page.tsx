"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/PageLoader";

const DashboardDataTablePage = dynamic(
  () => import("@/components/DashboardDataTablePage").then((m) => ({ default: m.DashboardDataTablePage })),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center p-8"><PageLoader /></div> }
);
import { DetailField, DetailSectionLabel } from "@/components/RowDetailModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";
import { formatPlate, toTitleCase } from "@/lib/inputMasks";
import { formatVehicleColorLabel } from "@parkit/shared/vehicleColors";

type OwnerRef = {
  client?: { id: string; user?: { firstName?: string; lastName?: string; email?: string } };
};
type VehicleRow = {
  id?: string;
  plate?: string;
  brand?: string;
  model?: string;
  color?: string | null;
  year?: number;
  countryCode?: string;
  dimensions?: { lengthCm?: number; widthCm?: number; heightCm?: number; weightKg?: number };
  owners?: OwnerRef[];
};

function getOwnerDisplay(owners: OwnerRef[] | undefined): string {
  const first = Array.isArray(owners) && owners.length > 0 ? owners[0]?.client : undefined;
  if (!first?.user) return "—";
  const { firstName, lastName, email } = first.user;
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name || email || "—";
}

export default function VehiclesPage() {
  const { t, tWithCompany, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const superAdmin = isSuperAdmin(user);
  const canManage = superAdmin || user?.systemRole === "ADMIN";
  const router = useRouter();

  // Show create vehicle button only if company has at least one ADMIN or CUSTOMER employee.
  const [hasEligibleEmployees, setHasEligibleEmployees] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!canManage) {
      setHasEligibleEmployees(false);
      return;
    }
    (async () => {
      try {
        const params = new URLSearchParams();
        params.set("excludeValets", "true");
        // Customers only (CUSTOMER); vehicles are associated with these beneficiaries.
        params.append("systemRole", "CUSTOMER");
        params.set("includeInactives", "true");
        const users = await apiClient.get<Array<{ id?: string }>>(`/users?${params.toString()}`);
        if (!cancelled) {
          setHasEligibleEmployees(Array.isArray(users) && users.length > 0);
        }
      } catch {
        if (!cancelled) setHasEligibleEmployees(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canManage]);

  const onUpdate = useCallback(async (row: VehicleRow) => {
    if (!row.id) return;
    const payload: { plate?: string; brand?: string; model?: string; year?: number } = {};
    if (row.plate !== undefined) payload.plate = row.plate;
    if (row.brand !== undefined) payload.brand = row.brand;
    if (row.model !== undefined) payload.model = row.model;
    if (row.year !== undefined) payload.year = Number(row.year);
    await apiClient.patch(`/vehicles/${row.id}`, payload);
  }, []);
  const columns = useMemo(
    () => [
      {
        header: t("tables.vehicles.clientOwner"),
        render: (v: VehicleRow) => getOwnerDisplay(v.owners),
      },
      {
        header: t("tables.vehicles.plate"),
        render: (v: VehicleRow) => (v.plate ? formatPlate(v.plate) : "—"),
        field: "plate" as const,
        editable: canManage,
        cellEditorInputFormat: formatPlate,
      },
      {
        header: t("tables.vehicles.brand"),
        render: (v: VehicleRow) => (v.brand ? toTitleCase(v.brand) : "—"),
        field: "brand" as const,
        editable: canManage,
        cellEditorCatalogType: "make",
        valueSetter: (row, value) => {
          (row as VehicleRow).brand = value as string;
          (row as VehicleRow).model = "";
        },
      },
      {
        header: t("tables.vehicles.model"),
        render: (v: VehicleRow) => (v.model ? toTitleCase(v.model) : "—"),
        field: "model" as const,
        editable: canManage,
        cellEditorCatalogType: "model",
      },
      { header: t("tables.vehicles.year"), render: (v: VehicleRow) => (v.year != null ? String(v.year) : "—"), field: "year" as const, editable: canManage },
    ],
    [t, canManage]
  );
  return (
    <>
      <DashboardDataTablePage<VehicleRow>
        title={t("tables.vehicles.title")}
        description={tWithCompany("tables.vehicles.description", selectedCompanyName)}
        endpoint="/vehicles"
        emptyMessage={t("tables.vehicles.empty")}
        columns={columns}
        hasRowDetail={(vehicle) =>
          (vehicle.color != null && String(vehicle.color).trim() !== "") ||
          (vehicle.countryCode != null && vehicle.countryCode !== "") ||
          (vehicle.dimensions != null && typeof vehicle.dimensions === "object" && Object.keys(vehicle.dimensions as object).length > 0)
        }
        renderRowDetail={(vehicle) => {
          const dims = vehicle.dimensions as { lengthCm?: number; widthCm?: number; heightCm?: number; weightKg?: number } | null | undefined;
          const hasDims = dims && (dims.lengthCm != null || dims.widthCm != null || dims.heightCm != null || dims.weightKg != null);
          const lengthM = dims?.lengthCm != null ? Number((dims.lengthCm / 100).toFixed(2)) : null;
          const widthM = dims?.widthCm != null ? Number((dims.widthCm / 100).toFixed(2)) : null;
          const heightM = dims?.heightCm != null ? Number((dims.heightCm / 100).toFixed(2)) : null;
          return (
            <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
              <DetailSectionLabel text={t("common.additionalInfo")} />
              <DetailField label={t("vehicles.color")} value={formatVehicleColorLabel(vehicle.color, locale)} />
              {lengthM != null && <DetailField label={t("vehicles.lengthM")} value={`${lengthM} m`} />}
              {widthM != null && <DetailField label={t("vehicles.widthM")} value={`${widthM} m`} />}
              {heightM != null && <DetailField label={t("vehicles.heightM")} value={`${heightM} m`} />}
              {hasDims && dims?.weightKg != null && <DetailField label={t("vehicles.weightKg")} value={`${dims.weightKg} kg`} />}
              <DetailField label={t("tables.vehicles.country")} value={vehicle.countryCode} />
            </dl>
          );
        }}
        onEdit={canManage ? (row) => router.push(`/dashboard/vehicles/${row.id}/edit`) : undefined}
        onUpdate={canManage ? onUpdate : undefined}
        headerAction={
          canManage && hasEligibleEmployees
            ? (
              <Link
                href="/dashboard/vehicles/new"
                className="inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" strokeWidth={2.25} />
                {t("common.add")}
              </Link>
            )
            : undefined
        }
      />
    </>
  );
}
