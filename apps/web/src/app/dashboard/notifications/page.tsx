"use client";

import { useCallback, useMemo, useState } from "react";
import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";

type NotificationRow = { id?: string; title?: string; type?: string; status?: string; createdAt?: string };

export default function NotificationsPage() {
  const { t, tEnum } = useTranslation();
  const [refreshToken, setRefreshToken] = useState(0);
  const onDelete = useCallback(async (row: NotificationRow) => {
    if (row.id) await apiClient.delete(`/notifications/${row.id}`);
  }, []);
  const onEdit = useCallback(async (row: NotificationRow) => {
    if (row.id) {
      await apiClient.patch(`/notifications/${row.id}/read`);
      setRefreshToken((x) => x + 1);
    }
  }, []);
  const columns = useMemo(
    () => [
      { header: t("tables.notifications.titleCol"), render: (n: { title?: string }) => n.title || "—" },
      { header: t("tables.notifications.type"), render: (n: { type?: string }) => tEnum("notificationType", n.type) },
      { header: t("tables.notifications.status"), render: (n: { status?: string }) => tEnum("notificationStatus", n.status), statusBadge: "notification", statusField: "status" },
      {
        header: t("tables.notifications.createdAt"),
        render: (n: { createdAt?: string }) =>
          n.createdAt ? new Date(n.createdAt).toLocaleString() : "—",
      },
    ],
    [t, tEnum]
  );
  return (
    <DashboardDataTablePage<NotificationRow>
      title={t("tables.notifications.title")}
      description={t("tables.notifications.description")}
      endpoint={(userId: string) => `/notifications/user/${userId}`}
      emptyMessage={t("tables.notifications.empty")}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getConfirmDeleteMessage={() => t("tables.notifications.confirmDelete")}
      refreshToken={refreshToken}
    />
  );
}
