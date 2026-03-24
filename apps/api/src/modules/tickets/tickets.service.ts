import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { TicketStatus, AssignmentRole, ValetStatus } from "@prisma/client";
import type { CreateTicketDTO } from "./tickets.types";

const MANUAL_CODE_MIN_LEN = 2;
const MANUAL_CODE_MAX_LEN = 64;
/** Letras, números, guion y guion bajo (etiquetas físicas / PKT-…). */
const MANUAL_CODE_PATTERN = /^[A-Za-z0-9\-_]+$/;

async function allocateTicketCodes(tx: Prisma.TransactionClient): Promise<{
  keyCode: string;
  ticketCode: string;
}> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const keyCode = randomBytes(4).toString("hex").toUpperCase();
    const ticketCode = `PKT-${randomBytes(5).toString("hex").toUpperCase()}`;
    const clash = await tx.ticket.count({
      where: { OR: [{ keyCode }, { ticketCode }] },
    });
    if (clash === 0) {
      return { keyCode, ticketCode };
    }
  }
  throw new Error("Could not allocate unique ticket codes");
}

function normalizeOptionalCode(raw: unknown): string | undefined {
  if (raw == null) return undefined;
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length === 0 ? undefined : t;
}

function assertValidManualCode(value: string, fieldLabel: string): string {
  if (value.length < MANUAL_CODE_MIN_LEN || value.length > MANUAL_CODE_MAX_LEN) {
    throw new Error(
      `${fieldLabel} must be between ${MANUAL_CODE_MIN_LEN} and ${MANUAL_CODE_MAX_LEN} characters`
    );
  }
  if (!MANUAL_CODE_PATTERN.test(value)) {
    throw new Error(
      `${fieldLabel} may only contain letters, numbers, hyphens and underscores`
    );
  }
  return value;
}

async function resolveTicketCodes(
  tx: Prisma.TransactionClient,
  body: { keyCode?: string; ticketCode?: string }
): Promise<{ keyCode: string; ticketCode: string }> {
  const tIn = normalizeOptionalCode(body.ticketCode);
  const kIn = normalizeOptionalCode(body.keyCode);

  if (!tIn && !kIn) {
    return allocateTicketCodes(tx);
  }

  let ticketCode: string;
  let keyCode: string;
  if (tIn && kIn) {
    ticketCode = assertValidManualCode(tIn, "Ticket code");
    keyCode = assertValidManualCode(kIn, "Key code");
  } else if (tIn) {
    ticketCode = assertValidManualCode(tIn, "Ticket code");
    keyCode = ticketCode;
  } else {
    keyCode = assertValidManualCode(kIn!, "Key code");
    ticketCode = keyCode;
  }

  const clash = await tx.ticket.count({
    where: { OR: [{ keyCode }, { ticketCode }] },
  });
  if (clash > 0) {
    throw new Error("Ticket code or key code is already in use");
  }

  return { keyCode, ticketCode };
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
      if (data.driverValetId) {
        const driver = await tx.valet.findFirst({
          where: {
            id: data.driverValetId,
            currentParkingId: data.parkingId,
            currentStatus: ValetStatus.AVAILABLE,
            AND: [
              { OR: [{ companyId }, { companyId: null }] },
              { OR: [{ staffRole: ValetStaffRole.DRIVER }, { staffRole: null }] },
            ],
            user: { isActive: true },
          },
          select: { id: true },
        });
        if (!driver) {
          throw new Error("Selected driver is not available for this parking");
        }
      }

      const { keyCode, ticketCode } = await resolveTicketCodes(tx, {
        keyCode: data.keyCode,
        ticketCode: data.ticketCode,
      });
      const ticket = await tx.ticket.create({
        data: {
          companyId,
          bookingId: data.bookingId,
          parkingId: data.parkingId,
          vehicleId: data.vehicleId,
          clientId: data.clientId,
          slotId: data.slotId,
          keyCode,
          ticketCode,
        },
      });

      const intake = data.intakeDamageReport;
      if (intake) {
        const desc = (intake.description ?? "").trim();
        const photos = (intake.photos ?? []).filter(
          (p) => typeof p.url === "string" && p.url.length > 0
        );
        if (photos.length > 0 || desc.length > 0) {
          const damageReport = await tx.damageReport.create({
            data: {
              ticketId: ticket.id,
              valetId: data.receptorValetId,
              description: desc.length > 0 ? desc : "",
            },
          });
          for (const photo of photos) {
            await tx.damagePhoto.create({
              data: {
                damageReportId: damageReport.id,
                url: photo.url,
                label: photo.label,
              },
            });
          }
        }
      }

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

      if (
        data.status === TicketStatus.DELIVERED ||
        data.status === TicketStatus.CANCELLED
      ) {
        const assigns = await tx.ticketAssignment.findMany({
          where: { ticketId },
          select: { valetId: true },
        });
        const valetIds = [...new Set(assigns.map((a) => a.valetId))];
        for (const valetId of valetIds) {
          const activeCount = await tx.ticketAssignment.count({
            where: {
              valetId,
              ticket: { status: { notIn: [TicketStatus.DELIVERED, TicketStatus.CANCELLED] } },
            },
          });
          if (activeCount === 0) {
            await tx.valet.update({
              where: { id: valetId },
              data: { currentStatus: ValetStatus.AVAILABLE },
            });
          }
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

    return prisma.$transaction(async (tx) => {
      const created = await tx.ticketAssignment.create({
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
      await tx.valet.update({
        where: { id: data.valetId },
        data: { currentStatus: ValetStatus.BUSY },
      });
      return created;
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
