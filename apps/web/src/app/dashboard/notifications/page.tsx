"use client";

import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";

export default function NotificationsPage() {
  return (
    <DashboardDataTablePage
      title="Notifications"
      description="Notifications created for your user account."
      endpoint={(userId: string) => `/notifications/user/${userId}`}
      emptyMessage="No notifications found"
      columns={[
        {
          header: "Title",
          render: (notification: any) => notification.title || "N/A",
        },
        {
          header: "Type",
          render: (notification: any) => notification.type || "N/A",
        },
        {
          header: "Status",
          render: (notification: any) => notification.status || "N/A",
        },
        {
          header: "Created At",
          render: (notification: any) =>
            notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "N/A",
        },
      ]}
    />
  );
}
