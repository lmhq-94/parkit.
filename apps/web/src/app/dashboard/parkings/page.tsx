"use client";

import { useCallback, useMemo } from "react";
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
import { useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

type ParkingRow = {
  id?: string;
  name?: string;
  address?: string;
  type?: string;
  totalSlots?: number;
  freeBenefitHours?: number;
  pricePerExtraHour?: number | string | null;
  company?: { currency?: string | null };
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadius?: number;
};

export default function ParkingsPage() {
  const { t, tWithCompany, tEnum } = useTranslation();
  const selectedCompanyName = useDashboardStore((s) => s.selectedCompanyName);
  const bumpParkings = useDashboardStore((s) => s.bumpParkings);
  const router = useRouter();

  const onUpdate = useCallback(async (row: ParkingRow) => {
    if (!row.id) return;
    const name = (row.name ?? "").toString().trim();
    const type = (row.type ?? "").toString().trim();
    const totalSlots =
      row.totalSlots == null || row.totalSlots === ("" as unknown as number)
        ? undefined
        : Number(row.totalSlots);
    const freeBenefitHours =
      row.freeBenefitHours == null || row.freeBenefitHours === ("" as unknown as number)
        ? undefined
        : Number(row.freeBenefitHours);
    const pricePerExtraHour =
      row.pricePerExtraHour == null || row.pricePerExtraHour === ""
        ? undefined
        : Number(row.pricePerExtraHour);

    const payload: Record<string, unknown> = {};
    if (name) payload.name = name;
    if (type) payload.type = type;
    if (totalSlots !== undefined) payload.totalSlots = totalSlots;
    if (freeBenefitHours !== undefined) payload.freeBenefitHours = freeBenefitHours;
    if (pricePerExtraHour !== undefined) payload.pricePerExtraHour = pricePerExtraHour;

    await apiClient.patch(`/parkings/${row.id}`, payload);
    bumpParkings();
  }, [bumpParkings]);

  const formatPrice = useCallback((p: ParkingRow) => {
    const price = p.pricePerExtraHour;
    const curr = p.company?.currency;
    if (price == null || price === "") return "—";
    const n = typeof price === "number" ? price : Number(price);
    if (Number.isNaN(n)) return "—";
    return curr ? `${Number(n).toFixed(2)} ${curr}` : String(n);
  }, []);

  const columns = useMemo(
    () => [
      { header: t("tables.parkings.name"), render: (p: ParkingRow) => p.name ?? "—", field: "name" as const, editable: true },
      {
        header: t("tables.parkings.type"),
        render: (p: ParkingRow) => tEnum("parkingType", p.type),
        field: "type" as const,
        editable: true,
        cellEditorValues: ["OPEN", "COVERED", "TOWER", "UNDERGROUND", "ELEVATOR"],
        cellEditorLabels: ["OPEN", "COVERED", "TOWER", "UNDERGROUND", "ELEVATOR"].map((v) => tEnum("parkingType", v)),
      },
      { header: t("tables.parkings.totalSlots"), render: (p: ParkingRow) => (p.totalSlots != null ? String(p.totalSlots) : "—"), field: "totalSlots" as const, editable: true },
      { header: t("tables.parkings.freeBenefitHours"), render: (p: ParkingRow) => (p.freeBenefitHours != null ? String(p.freeBenefitHours) : "—"), field: "freeBenefitHours" as const, editable: true },
      { header: t("tables.parkings.pricePerExtraHour"), render: formatPrice, field: "pricePerExtraHour" as const, editable: true },
    ],
    [t, tEnum, formatPrice]
  );
  return (
    <>
      <DashboardDataTablePage<ParkingRow>
        title={t("tables.parkings.title")}
        description={tWithCompany("tables.parkings.description", selectedCompanyName)}
        endpoint="/parkings"
        emptyMessage={t("tables.parkings.empty")}
        columns={columns}
        hasRowDetail={(parking) =>
          (parking.address != null && parking.address !== "") ||
          parking.latitude != null ||
          parking.longitude != null ||
          parking.geofenceRadius != null ||
          parking.freeBenefitHours != null ||
          (parking.pricePerExtraHour != null && parking.pricePerExtraHour !== "")
        }
        renderRowDetail={(parking) => (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
            <DetailSectionLabel text={t("common.additionalInfo")} />
            <DetailField label={t("parkings.address")} value={parking.address} wide multiline />
            <DetailField label={t("parkings.latitude")} value={parking.latitude != null ? String(parking.latitude) : undefined} />
            <DetailField label={t("parkings.longitude")} value={parking.longitude != null ? String(parking.longitude) : undefined} />
            <DetailField label={t("parkings.geofenceRadius")} value={parking.geofenceRadius != null ? String(parking.geofenceRadius) : undefined} />
            <DetailField label={t("parkings.freeBenefitHours")} value={parking.freeBenefitHours != null ? String(parking.freeBenefitHours) : undefined} />
            <DetailField label={t("parkings.pricePerExtraHour")} value={formatPrice(parking)} />
          </dl>
        )}
        onEdit={(row) => router.push(`/dashboard/parkings/${row.id}/edit`)}
        onUpdate={onUpdate}
        headerAction={
          <Link
            href="/dashboard/parkings/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.25} />
            {t("common.add")}
          </Link>
        }
      />
    </>
  );
}
