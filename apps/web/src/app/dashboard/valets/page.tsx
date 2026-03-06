"use client";

import { useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";

export default function ValetsPage() {
  const { t, tEnum } = useTranslation();
  const columns = useMemo(
    () => [
      {
        header: t("tables.valets.name"),
        render: (valet: { user?: { firstName?: string; lastName?: string; email?: string } }) => {
          const u = valet.user;
          if (!u) return "N/A";
          return `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "N/A";
        },
      },
      {
        header: t("tables.valets.email"),
        render: (valet: { user?: { email?: string } }) => valet.user?.email ?? "N/A",
      },
      {
        header: t("tables.valets.status"),
        render: (valet: { currentStatus?: string }) => tEnum("valetStatus", valet.currentStatus),
      },
      {
        header: t("tables.valets.license"),
        render: (valet: { licenseNumber?: string }) => valet.licenseNumber ?? "—",
      },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage
      title={t("tables.valets.title")}
      description={t("tables.valets.description")}
      endpoint="/valets"
      emptyMessage={t("tables.valets.empty")}
      columns={columns}
    />
  );
}
