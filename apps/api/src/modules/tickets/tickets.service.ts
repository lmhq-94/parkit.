import { prisma } from "../../shared/prisma";
import { TicketStatus, AssignmentRole } from "@prisma/client";

interface CreateTicketDTO {
  bookingId?: string;
  parkingId: string;
  vehicleId: string;
  clientId: string;
  slotId?: string;
}

interface UpdateTicketDTO {
  status?: TicketStatus;
  slotId?: string;
  parkingId?: string;
  vehicleId?: string;
  entryTime?: string;
  exitTime?: string;
}

interface AssignValet {
  valetId: string;
  role: AssignmentRole;
}

interface ReportDamageDTO {
  valetId: string;
  description: string;
  photos?: Array<{ url: string; label?: string }>;
}

interface AddReviewDTO {
  stars: number;
  comment?: string;
}

interface TicketFilters {
  statuses?: string[];
  clientId?: string;
  valetId?: string;
}

export class TicketsService {
  static async create(companyId: string, data: CreateTicketDTO) {
    return prisma.ticket.create({
      data: {
        companyId,
        bookingId: data.bookingId,
        parkingId: data.parkingId,
        vehicleId: data.vehicleId,
        clientId: data.clientId,
        slotId: data.slotId,
      },
      include: {
        client: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        vehicle: {
          select: {
            plate: true,
            brand: true,
            model: true,
          },
        },
        parking: {
          select: {
            name: true,
            address: true,
          },
        },
        slot: {
          select: {
            label: true,
          },
        },
      },
    });
  }

  static async list(companyId: string, filters: TicketFilters) {
    return prisma.ticket.findMany({
      where: {
        companyId,
        status: filters.statuses?.length
          ? { in: filters.statuses as TicketStatus[] }
          : undefined,
        clientId: filters.clientId,
        assignments: filters.valetId
          ? {
              some: {
                valetId: filters.valetId,
              },
            }
          : undefined,
      },
      include: {
        vehicle: {
          select: {
            plate: true,
            brand: true,
            model: true,
          },
        },
        parking: {
          select: {
            name: true,
            address: true,
          },
        },
        client: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        assignments: {
          include: {
            valet: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { entryTime: "desc" },
    });
  }

  static async getById(companyId: string, ticketId: string) {
    return prisma.ticket.findFirst({
      where: { id: ticketId, companyId },
      include: {
        vehicle: true,
        client: {
          include: {
            user: true,
          },
        },
        parking: {
          select: {
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        slot: true,
        booking: true,
        assignments: {
          include: {
            valet: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        damages: {
          include: {
            photos: true,
          },
        },
        review: true,
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  static async update(
    companyId: string,
    ticketId: string,
    data: UpdateTicketDTO
  ) {
    return prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: data.status,
        slotId: data.slotId,
        parkingId: data.parkingId,
        vehicleId: data.vehicleId,
        entryTime: data.entryTime ? new Date(data.entryTime) : undefined,
        exitTime: data.exitTime ? new Date(data.exitTime) : undefined,
      },
      include: {
        vehicle: true,
        assignments: {
          include: {
            valet: true,
          },
        },
      },
    });
  }

  static async assignValet(
    companyId: string,
    ticketId: string,
    data: AssignValet
  ) {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, companyId },
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return prisma.ticketAssignment.create({
      data: {
        ticketId,
        valetId: data.valetId,
        role: data.role,
      },
      include: {
        valet: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        ticket: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
  }

  static async reportDamage(
    companyId: string,
    ticketId: string,
    data: ReportDamageDTO
  ) {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, companyId },
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const damageReport = await prisma.damageReport.create({
      data: {
        ticketId,
        valetId: data.valetId,
        description: data.description,
      },
      include: {
        valet: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (data.photos && data.photos.length > 0) {
      for (const photo of data.photos) {
        await prisma.damagePhoto.create({
          data: {
            damageReportId: damageReport.id,
            url: photo.url,
            label: photo.label,
          },
        });
      }
    }

    return damageReport;
  }

  static async addReview(
    companyId: string,
    ticketId: string,
    data: AddReviewDTO
  ) {
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, companyId },
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return prisma.ticketReview.create({
      data: {
        ticketId,
        stars: data.stars,
        comment: data.comment,
      },
    });
  }

  static async checkout(companyId: string, ticketId: string) {
    return prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.DELIVERED,
        exitTime: new Date(),
      },
      include: {
        vehicle: true,
        client: true,
      },
    });
  }
}
