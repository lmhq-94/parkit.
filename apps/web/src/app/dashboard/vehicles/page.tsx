"use client";

import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";

export default function VehiclesPage() {
  return (
    <DashboardDataTablePage
      title="Vehicles"
      description="Vehicles registered in your company."
      endpoint="/vehicles"
      emptyMessage="No vehicles found"
      columns={[
        {
          header: "Plate",
          render: (vehicle: any) => vehicle.plate || "N/A",
        },
        {
          header: "Brand",
          render: (vehicle: any) => vehicle.brand || "N/A",
        },
        {
          header: "Model",
          render: (vehicle: any) => vehicle.model || "N/A",
        },
        {
          header: "Year",
          render: (vehicle: any) => vehicle.year || "N/A",
        },
        {
          header: "Country",
          render: (vehicle: any) => vehicle.countryCode || "N/A",
        },
      ]}
    />
  );
}
