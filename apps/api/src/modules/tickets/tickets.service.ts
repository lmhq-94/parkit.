import { prisma } from "../../shared/prisma";
import { TicketStatus, AssignmentRole } from "@prisma/client";

interface CreateTicketDTO {
  bookingId?: string;
  parkingId: string;
  vehicleId: string;
  clientId: string;
  slotId?: string;
  receptorValetId: string;
  driverValetId?: string;
  delivererValetId?: string;
}

interface UpdateTicketDTO {
  status?: TicketStatus;
  slotId?: string;
  parkingId?: string;
  vehicleId?: string;
  clientId?: string;
  entryTime?: string;
  exitTime?: string;
  receptorValetId?: string | null;
  driverValetId?: string | null;
  delivererValetId?: string | null;
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
    const include = {
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
      assignments: {
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
        },
      },
    } as const;

    return prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          companyId,
          bookingId: data.bookingId,
          parkingId: data.parkingId,
          vehicleId: data.vehicleId,
          clientId: data.clientId,
          slotId: data.slotId,
        },
      });

      const assignmentCreates: Promise<unknown>[] = [
        tx.ticketAssignment.create({
          data: {
            ticketId: ticket.id,
            valetId: data.receptorValetId,
            role: "RECEPTOR",
          },
        }),
      ];
      if (data.driverValetId) {
        assignmentCreates.push(
          tx.ticketAssignment.create({
            data: {
              ticketId: ticket.id,
              valetId: data.driverValetId,
              role: "DRIVER",
            },
          })
        );
      }
      if (data.delivererValetId) {
        assignmentCreates.push(
          tx.ticketAssignment.create({
            data: {
              ticketId: ticket.id,
              valetId: data.delivererValetId,
              role: "DELIVERER",
            },
          })
        );
      }
      await Promise.all(assignmentCreates);

      return tx.ticket.findUniqueOrThrow({
        where: { id: ticket.id },
        include,
      });
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
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, companyId },
    });
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const include = {
      vehicle: true,
      assignments: {
        include: {
          valet: true,
        },
      },
    } as const;

    return prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: data.status,
          slotId: data.slotId,
          parkingId: data.parkingId,
          vehicleId: data.vehicleId,
          clientId: data.clientId,
          entryTime: data.entryTime ? new Date(data.entryTime) : undefined,
          exitTime: data.exitTime ? new Date(data.exitTime) : undefined,
        },
      });

      const roleUpdates: Array<{ role: AssignmentRole; valetId: string | null }> = [];
      if (data.receptorValetId !== undefined) roleUpdates.push({ role: "RECEPTOR", valetId: data.receptorValetId ?? null });
      if (data.driverValetId !== undefined) roleUpdates.push({ role: "DRIVER", valetId: data.driverValetId ?? null });
      if (data.delivererValetId !== undefined) roleUpdates.push({ role: "DELIVERER", valetId: data.delivererValetId ?? null });

      for (const { role, valetId } of roleUpdates) {
        await tx.ticketAssignment.deleteMany({
          where: { ticketId, role },
        });
        if (valetId) {
          await tx.ticketAssignment.create({
            data: { ticketId, valetId, role },
          });
        }
      }

      return tx.ticket.findUniqueOrThrow({
        where: { id: ticketId },
        include,
      });
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
