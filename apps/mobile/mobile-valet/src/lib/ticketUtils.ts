import type { ApiAssignment, TicketAssignment } from "@/types/tickets";

/**
 * Maps API assignment data to display format
 */
export function mapApiAssignmentToDisplay(a: ApiAssignment): TicketAssignment {
  const status =
    a.ticket.status === "DELIVERED"
      ? "completed"
      : a.ticket.status === "REQUEST_DELIVERY"
        ? "assigned"
        : "assigned";
  const location =
    [a.ticket.parking?.name, a.ticket.slot?.label].filter(Boolean).join(" · ") ||
    a.ticket.parking?.address ||
    "—";
  const plate = a.ticket.vehicle?.plate ? `${a.ticket.vehicle.plate}` : "—";
  const brand = a.ticket.vehicle?.brand?.trim() || "";
  const model = a.ticket.vehicle?.model?.trim() || "";
  const brandModel = [brand, model].filter(Boolean).join(" ").trim() || "—";
  const color = a.ticket.vehicle?.color?.trim() || null;
  const parkingName = a.ticket.parking?.name?.trim() || "—";
  return {
    id: a.ticket.id,
    assignmentId: a.id,
    ticketId: a.ticket.id,
    valetId: a.valetId,
    ticketStatus: a.ticket.status,
    status,
    ticketCode: a.ticket.ticketCode ?? null,
    keyCode: a.ticket.keyCode ?? null,
    vehiclePlate: plate,
    vehicleBrandModel: brandModel,
    vehicleColor: color,
    parkingName,
    createdAt: a.ticket.entryTime || a.assignedAt,
    location,
    timestamp: a.assignedAt,
    companyId: a.ticket.companyId,
  };
}
