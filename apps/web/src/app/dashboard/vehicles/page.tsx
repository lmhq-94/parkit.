"use client";

import { useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";

export default function VehiclesPage() {
  const { t } = useTranslation();
  const columns = useMemo(
    () => [
      { header: t("tables.vehicles.plate"), render: (v: { plate?: string }) => v.plate || "N/A" },
      { header: t("tables.vehicles.brand"), render: (v: { brand?: string }) => v.brand || "N/A" },
      { header: t("tables.vehicles.model"), render: (v: { model?: string }) => v.model || "N/A" },
      { header: t("tables.vehicles.year"), render: (v: { year?: string | number }) => (v.year != null ? String(v.year) : "N/A") },
      { header: t("tables.vehicles.country"), render: (v: { countryCode?: string }) => v.countryCode || "N/A" },
    ],
    [t]
  );
  return (
    <DashboardDataTablePage
      title={t("tables.vehicles.title")}
      description={t("tables.vehicles.description")}
      endpoint="/vehicles"
      emptyMessage={t("tables.vehicles.empty")}
      columns={columns}
    />
  );
}
