"use client";

import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";

export default function BookingsPage() {
  return (
    <DashboardDataTablePage
      title="Bookings"
      description="Bookings associated with your company."
      endpoint="/bookings"
      emptyMessage="No bookings found"
      columns={[
        {
          header: "Status",
          render: (booking: any) => booking.status || "N/A",
        },
        {
          header: "Vehicle ID",
          render: (booking: any) => booking.vehicleId || "N/A",
        },
        {
          header: "Parking ID",
          render: (booking: any) => booking.parkingId || "N/A",
        },
        {
          header: "Entry",
          render: (booking: any) =>
            booking.scheduledEntryTime ? new Date(booking.scheduledEntryTime).toLocaleString() : "N/A",
        },
        {
          header: "Exit",
          render: (booking: any) =>
            booking.scheduledExitTime ? new Date(booking.scheduledExitTime).toLocaleString() : "N/A",
        },
      ]}
    />
  );
}
