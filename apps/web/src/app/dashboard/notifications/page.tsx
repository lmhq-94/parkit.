"use client";

import { useMemo } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";

export default function NotificationsPage() {
  const { t, tEnum } = useTranslation();
  const columns = useMemo(
    () => [
      { header: t("tables.notifications.titleCol"), render: (n: { title?: string }) => n.title || "N/A" },
      { header: t("tables.notifications.type"), render: (n: { type?: string }) => tEnum("notificationType", n.type) },
      { header: t("tables.notifications.status"), render: (n: { status?: string }) => tEnum("notificationStatus", n.status) },
      {
        header: t("tables.notifications.createdAt"),
        render: (n: { createdAt?: string }) =>
          n.createdAt ? new Date(n.createdAt).toLocaleString() : "N/A",
      },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage
      title={t("tables.notifications.title")}
      description={t("tables.notifications.description")}
      endpoint={(userId: string) => `/notifications/user/${userId}`}
      emptyMessage={t("tables.notifications.empty")}
      columns={columns}
    />
  );
}
