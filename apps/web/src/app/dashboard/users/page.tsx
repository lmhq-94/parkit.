"use client";

import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";

export default function UsersPage() {
  return (
    <DashboardDataTablePage
      title="Users"
      description="Users available in your company."
      endpoint="/users"
      emptyMessage="No users found"
      columns={[
        {
          header: "Name",
          render: (user: any) => `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
        },
        {
          header: "Email",
          render: (user: any) => user.email || "N/A",
        },
        {
          header: "Role",
          render: (user: any) => user.systemRole || "N/A",
        },
        {
          header: "Status",
          render: (user: any) => (user.isActive ? "ACTIVE" : "INACTIVE"),
        },
      ]}
    />
  );
}
