/** Assignment from API GET /valets/me/assignments */
export interface ApiAssignment {
  id: string;
  ticketId: string;
  valetId: string;
  assignedAt: string;
  ticket: {
    id: string;
    status: string;
    companyId: string;
    ticketCode?: string | null;
    keyCode?: string | null;
    entryTime?: string;
    vehicle: {
      plate: string;
      countryCode?: string;
      brand?: string | null;
      model?: string | null;
      color?: string | null;
    };
    parking: { name: string; address?: string };
    slot?: { label: string } | null;
  };
}

export interface TicketAssignment {
  id: string;
  assignmentId: string;
  ticketId: string;
  valetId: string;
  /** Estado real del ticket en backend. */
  ticketStatus: string;
  status: "assigned" | "in-transit" | "completed";
  ticketCode?: string | null;
  keyCode?: string | null;
  vehiclePlate: string;
  vehicleBrandModel: string;
  vehicleColor: string | null;
  parkingName: string;
  createdAt: string;
  location: string;
  timestamp: string;
  companyId: string;
}
