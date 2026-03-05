"use client";

import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";

export default function ValetsPage() {
  return (
    <DashboardDataTablePage
      title="Valets"
      description="Valet staff in your company."
      endpoint="/valets"
      emptyMessage="No valets found"
      columns={[
        {
          header: "Name",
          render: (valet: any) => {
            const u = valet.user;
            if (!u) return "N/A";
            return `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "N/A";
          },
        },
        {
          header: "Email",
          render: (valet: any) => valet.user?.email ?? "N/A",
        },
        {
          header: "Status",
          render: (valet: any) => valet.currentStatus ?? "N/A",
        },
        {
          header: "License",
          render: (valet: any) => valet.licenseNumber ?? "—",
        },
      ]}
    />
  );
}
