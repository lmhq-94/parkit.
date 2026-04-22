"use client";

import { useCallback, useMemo } from "react";
import React from "react";
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
  company?: { currency?: string | null };
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadius?: number;
  dailyPricingConfig?: {
    monday?: { pricePerHour?: number; freeBenefitMinutes?: number };
    tuesday?: { pricePerHour?: number; freeBenefitMinutes?: number };
    wednesday?: { pricePerHour?: number; freeBenefitMinutes?: number };
    thursday?: { pricePerHour?: number; freeBenefitMinutes?: number };
    friday?: { pricePerHour?: number; freeBenefitMinutes?: number };
    saturday?: { pricePerHour?: number; freeBenefitMinutes?: number };
    sunday?: { pricePerHour?: number; freeBenefitMinutes?: number };
  } | null;
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

    const payload: Record<string, unknown> = {};
    if (name) payload.name = name;
    if (type) payload.type = type;
    if (totalSlots !== undefined && !Number.isNaN(totalSlots)) payload.totalSlots = totalSlots;

    if (Object.keys(payload).length === 0) return;

    await apiClient.patch(`/parkings/${row.id}`, payload);
    bumpParkings();
  }, [bumpParkings]);

  const formatPrice = useCallback((price: number | null, currency: string | null | undefined) => {
    if (price == null) return "—";
    const n = typeof price === "number" ? price : Number(price);
    if (Number.isNaN(n)) return "—";
    if (!currency) return String(n);
    try {
      return new Intl.NumberFormat(
        locale === "es" ? "es-CR" : "en-US",
        { style: "currency", currency, currencyDisplay: "symbol", minimumFractionDigits: 2, maximumFractionDigits: 2 }
      ).format(n);
    } catch {
      return `${Number(n).toFixed(2)} ${currency}`;
    }
  }, [locale]);

  const formatLatLng = useCallback((value: number | null | undefined) => {
    if (value == null || Number.isNaN(value)) return undefined;
    return new Intl.NumberFormat(
      locale === "es" ? "es-CR" : "en-US",
      { minimumFractionDigits: 0, maximumFractionDigits: 6 }
    ).format(value);
  }, [locale]);

  const formatTime = useCallback((minutes: number | null | undefined): string => {
    if (minutes == null || Number.isNaN(minutes)) return "0:00 h";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const unit = hours >= 1 ? "h" : "min";
    return `${hours}:${mins.toString().padStart(2, "0")} ${unit}`;
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
          parking.dailyPricingConfig != null
        }
        renderRowDetail={(parking) => {
          const config = parking.dailyPricingConfig;
          
          // Agrupar días por valores iguales
          const dayGroups: Array<{ label: string; days: string[]; data: { pricePerHour?: number; freeBenefitMinutes?: number } }> = [];
          
          if (config) {
            const days = [
              { key: 'monday', label: 'L', tLabel: t("parkings.monday") },
              { key: 'tuesday', label: 'M', tLabel: t("parkings.tuesday") },
              { key: 'wednesday', label: 'X', tLabel: t("parkings.wednesday") },
              { key: 'thursday', label: 'J', tLabel: t("parkings.thursday") },
              { key: 'friday', label: 'V', tLabel: t("parkings.friday") },
              { key: 'saturday', label: 'S', tLabel: t("parkings.saturday") },
              { key: 'sunday', label: 'D', tLabel: t("parkings.sunday") },
            ];
            
            const processedDays = new Set<string>();
            
            for (const day of days) {
              if (processedDays.has(day.key) || !config[day.key as keyof typeof config]) continue;
              
              const dayData = config[day.key as keyof typeof config] as { pricePerHour?: number; freeBenefitMinutes?: number };
              if (!dayData) continue;
              
              const sameValueDays = [day.key];
              processedDays.add(day.key);
              
              // Buscar días con el mismo valor
              for (const otherDay of days) {
                if (otherDay.key === day.key || processedDays.has(otherDay.key)) continue;
                
                const otherData = config[otherDay.key as keyof typeof config] as { pricePerHour?: number; freeBenefitMinutes?: number };
                if (!otherData) continue;
                
                if (dayData.pricePerHour === otherData.pricePerHour && dayData.freeBenefitMinutes === otherData.freeBenefitMinutes) {
                  sameValueDays.push(otherDay.key);
                  processedDays.add(otherDay.key);
                }
              }
              
              // Crear rango inteligente
              const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              const sortedDays = sameValueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
              
              // Determinar si es un rango continuo
              const indices = sortedDays.map(d => dayOrder.indexOf(d));
              const isContinuous = indices.every((idx, i) => {
                if (i === 0) return true;
                const prevIdx = indices[i - 1];
                return prevIdx !== undefined && idx === prevIdx + 1;
              });
              
              let rangeLabel = '';
              if (isContinuous && sortedDays.length > 1) {
                const firstDay = days.find(d => d.key === sortedDays[0]);
                const lastDay = days.find(d => d.key === sortedDays[sortedDays.length - 1]);
                rangeLabel = `${firstDay?.label}-${lastDay?.label}`;
              } else if (sortedDays.length === 1) {
                rangeLabel = days.find(d => d.key === sortedDays[0])?.label || '';
              } else {
                rangeLabel = sortedDays.map(d => days.find(day => day.key === d)?.label).join(', ');
              }
              
              dayGroups.push({
                label: rangeLabel,
                days: sortedDays,
                data: dayData,
              });
            }
          }
          
          return (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
              <DetailSectionLabel text={t("common.additionalInfo")} />
              <DetailField label={t("parkings.address")} value={parking.address} wide multiline />
              <DetailField label={t("parkings.latitude")} value={formatLatLng(parking.latitude)} />
              <DetailField label={t("parkings.longitude")} value={formatLatLng(parking.longitude)} />
              <DetailField label={t("parkings.geofenceRadius")} value={parking.geofenceRadius != null ? String(parking.geofenceRadius) : undefined} />
              {dayGroups.map((group, idx) => {
                const isHours = group.data.freeBenefitMinutes != null && group.data.freeBenefitMinutes >= 60;
                const timeLabel = isHours ? t("parkings.freeBenefitHours") : t("parkings.freeBenefitMinutes");
                return (
                  <React.Fragment key={idx}>
                    <DetailField label={`${group.label} - ${t("parkings.pricePerHour")}`} value={group.data.pricePerHour != null ? formatPrice(group.data.pricePerHour, parking.company?.currency) : undefined} />
                    {group.data.freeBenefitMinutes != null && group.data.freeBenefitMinutes !== 0 && (
                      <DetailField label={`${group.label} - ${timeLabel}`} value={formatTime(group.data.freeBenefitMinutes)} />
                    )}
                  </React.Fragment>
                );
              })}
            </dl>
          );
        }}
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
