"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus } from "@/lib/premiumIcons";
import { useRouter } from "next/navigation";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
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
  freeBenefitMinutes?: number;
  pricePerExtraHour?: number | string | null;
  company?: { currency?: string | null };
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadius?: number;
};

export default function ParkingsPage() {
  const { t, tWithCompany, tEnum, locale } = useTranslation();
  const selectedCompanyName = useDashboardStore((s: any) => s.selectedCompanyName);
  const bumpParkings = useDashboardStore((s: any) => s.bumpParkings);
  const router = useRouter();

  const onUpdate = useCallback(async (row: ParkingRow) => {
    if (!row.id) return;
    const name = (row.name ?? "").toString().trim();
    const type = (row.type ?? "").toString().trim();
    const totalSlots =
      row.totalSlots == null || row.totalSlots === ("" as unknown as number)
        ? undefined
        : Number(row.totalSlots);
    const freeBenefitMinutes =
      row.freeBenefitMinutes == null || row.freeBenefitMinutes === ("" as unknown as number)
        ? undefined
        : Number(row.freeBenefitMinutes);
    const pricePerExtraHour =
      row.pricePerExtraHour == null || row.pricePerExtraHour === ""
        ? undefined
        : Number(row.pricePerExtraHour);

    const payload: Record<string, unknown> = {};
    if (name) payload.name = name;
    if (type) payload.type = type;
    if (totalSlots !== undefined && !Number.isNaN(totalSlots)) payload.totalSlots = totalSlots;
    if (freeBenefitMinutes !== undefined && !Number.isNaN(freeBenefitMinutes)) payload.freeBenefitMinutes = freeBenefitMinutes;
    if (pricePerExtraHour !== undefined && !Number.isNaN(pricePerExtraHour)) payload.pricePerExtraHour = pricePerExtraHour;

    if (Object.keys(payload).length === 0) return;

    await apiClient.patch(`/parkings/${row.id}`, payload);
    bumpParkings();
  }, [bumpParkings]);

  const formatPrice = useCallback((p: ParkingRow) => {
    const price = p.pricePerExtraHour;
    const curr = p.company?.currency;
    if (price == null || price === "") return "—";
    const n = typeof price === "number" ? price : Number(price);
    if (Number.isNaN(n)) return "—";
    if (!curr) return String(n);
    try {
      return new Intl.NumberFormat(
        locale === "es" ? "es-CR" : "en-US",
        { style: "currency", currency: curr, currencyDisplay: "symbol", minimumFractionDigits: 2, maximumFractionDigits: 2 }
      ).format(n);
    } catch {
      return `${Number(n).toFixed(2)} ${curr}`;
    }
  }, [locale]);

  const formatLatLng = useCallback((value: number | null | undefined) => {
    if (value == null || Number.isNaN(value)) return undefined;
    return new Intl.NumberFormat(
      locale === "es" ? "es-CR" : "en-US",
      { minimumFractionDigits: 0, maximumFractionDigits: 6 }
    ).format(value);
  }, [locale]);

  const formatBenefitTime = useCallback((value: number | null | undefined) => {
    if (value == null || Number.isNaN(value)) return undefined;
    const totalMinutes = Math.max(0, Math.floor(value));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0 && minutes === 0) return locale === "es" ? "0 min" : "0 min";
    if (hours === 0) return locale === "es" ? `${minutes} min` : `${minutes} min`;
    if (minutes === 0) return locale === "es" ? `${hours} h` : `${hours} h`;
    return locale === "es"
      ? `${hours} h ${minutes} min`
      : `${hours} h ${minutes} min`;
  }, [locale]);

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
      {
        header: t("tables.parkings.totalSlots"),
        render: (p: ParkingRow) => (p.totalSlots != null ? String(p.totalSlots) : "—"),
        field: "totalSlots" as const,
        editable: true,
        validator: (val: any) => {
          const n = Number(val);
          if (val != null && val !== "" && (Number.isNaN(n) || n < 0)) {
            return t("validation.invalidNumber");
          }
          return null;
        }
      },
    ],
    [t, tEnum]
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
          parking.freeBenefitMinutes != null ||
          (parking.pricePerExtraHour != null && parking.pricePerExtraHour !== "")
        }
        renderRowDetail={(parking) => (
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
            <DetailSectionLabel text={t("common.additionalInfo")} />
            <DetailField label={t("parkings.address")} value={parking.address} wide multiline />
            <DetailField label={t("parkings.latitude")} value={formatLatLng(parking.latitude)} />
            <DetailField label={t("parkings.longitude")} value={formatLatLng(parking.longitude)} />
            <DetailField label={t("parkings.geofenceRadius")} value={parking.geofenceRadius != null ? String(parking.geofenceRadius) : undefined} />
            {parking.freeBenefitMinutes != null && Number(parking.freeBenefitMinutes) !== 0 && (
              <DetailField label={t("parkings.freeBenefitTime")} value={formatBenefitTime(parking.freeBenefitMinutes)} />
            )}
            {parking.pricePerExtraHour != null && parking.pricePerExtraHour !== "" && (
              <DetailField label={t("parkings.pricePerExtraHour")} value={formatPrice(parking)} />
            )}
          </dl>
        )}
        onEdit={(row) => router.push(`/dashboard/parkings/${row.id}/edit`)}
        onUpdate={onUpdate}
        headerAction={
          <Link
            href="/dashboard/parkings/new"
            className="group inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" strokeWidth={2.25} />
            {t("common.add")}
          </Link>
        }
      />
    </>
  );
}
