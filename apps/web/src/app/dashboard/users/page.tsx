"use client";

import { useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";

export default function UsersPage() {
  const { t, tEnum } = useTranslation();
  const columns = useMemo(
    () => [
      {
        header: t("tables.employees.name"),
        render: (user: { firstName?: string; lastName?: string }) =>
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
      },
      {
        header: t("tables.employees.email"),
        render: (user: { email?: string }) => user.email || "N/A",
      },
      {
        header: t("tables.employees.role"),
        render: (user: { systemRole?: string }) => tEnum("systemRole", user.systemRole),
      },
      {
        header: t("tables.employees.status"),
        render: (user: { isActive?: boolean }) => (user.isActive ? t("tables.employees.active") : t("tables.employees.inactive")),
      },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage
      title={t("tables.employees.title")}
      description={t("tables.employees.description")}
      endpoint="/users?excludeValets=true"
      emptyMessage={t("tables.employees.empty")}
      columns={columns}
    />
  );
}
