"use client";

import { DashboardDataTablePage } from "@/components/DashboardDataTablePage";

export default function TicketsPage() {
  return (
    <DashboardDataTablePage
      title="Tickets"
      description="Tickets currently registered for your company."
      endpoint="/tickets"
      emptyMessage="No tickets found"
      columns={[
        {
          header: "Status",
          render: (ticket: any) => ticket.status || "N/A",
        },
        {
          header: "Vehicle ID",
          render: (ticket: any) => ticket.vehicleId || "N/A",
        },
        {
          header: "Parking ID",
          render: (ticket: any) => ticket.parkingId || "N/A",
        },
        {
          header: "Entry",
          render: (ticket: any) => (ticket.entryTime ? new Date(ticket.entryTime).toLocaleString() : "N/A"),
        },
        {
          header: "Exit",
          render: (ticket: any) => (ticket.exitTime ? new Date(ticket.exitTime).toLocaleString() : "N/A"),
        },
      ]}
    />
  );
}
