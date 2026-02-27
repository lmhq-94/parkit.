"use client";

import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";

export default function ParkingsPage() {
  return (
    <DashboardDataTablePage
      title="Parkings"
      description="Parking locations configured for your company."
      endpoint="/parkings"
      emptyMessage="No parkings found"
      columns={[
        {
          header: "Name",
          render: (parking: any) => parking.name || "N/A",
        },
        {
          header: "Address",
          render: (parking: any) => parking.address || "N/A",
        },
        {
          header: "Type",
          render: (parking: any) => parking.type || "N/A",
        },
        {
          header: "Total Slots",
          render: (parking: any) => parking.totalSlots ?? "N/A",
        },
        {
          header: "Requires Booking",
          render: (parking: any) => (parking.requiresBooking ? "YES" : "NO"),
        },
      ]}
    />
  );
}
