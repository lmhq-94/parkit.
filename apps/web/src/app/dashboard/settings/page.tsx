"use client";

import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";

export default function SettingsPage() {
  return (
    <DashboardDataTablePage
      title="Settings"
      description="Company configuration data available for your account."
      endpoint="/companies/me"
      emptyMessage="No settings data found"
      columns={[
        {
          header: "Commercial Name",
          render: (company: any) => company.commercialName || "N/A",
        },
        {
          header: "Legal Name",
          render: (company: any) => company.legalName || "N/A",
        },
        {
          header: "Billing Email",
          render: (company: any) => company.billingEmail || "N/A",
        },
        {
          header: "Phone",
          render: (company: any) => company.contactPhone || "N/A",
        },
        {
          header: "Status",
          render: (company: any) => company.status || "N/A",
        },
      ]}
    />
  );
}
