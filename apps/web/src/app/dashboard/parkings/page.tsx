"use client";

import { useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";

export default function ParkingsPage() {
  const { t, tEnum } = useTranslation();
  const columns = useMemo(
    () => [
      { header: t("tables.parkings.name"), render: (p: { name?: string }) => p.name || "N/A" },
      { header: t("tables.parkings.address"), render: (p: { address?: string }) => p.address || "N/A" },
      { header: t("tables.parkings.type"), render: (p: { type?: string }) => tEnum("parkingType", p.type) },
      { header: t("tables.parkings.totalSlots"), render: (p: { totalSlots?: number }) => (p.totalSlots != null ? String(p.totalSlots) : "N/A") },
      { header: t("tables.parkings.requiresBooking"), render: (p: { requiresBooking?: boolean }) => (p.requiresBooking ? t("common.yes") : t("common.no")) },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage
      title={t("tables.parkings.title")}
      description={t("tables.parkings.description")}
      endpoint="/parkings"
      emptyMessage={t("tables.parkings.empty")}
      columns={columns}
    />
  );
}
