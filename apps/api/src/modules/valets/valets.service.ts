import { prisma } from "../../shared/prisma";
import { ValetStaffRole, ValetStatus } from "@prisma/client";
import { UsersService } from "../users/users.service";

interface CreateValetDTO {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  licenseNumber: string;
  licenseExpiry: string;
  currentParkingId?: string;
  staffRole: ValetStaffRole;
}

/** Última actividad del valet (empresa/parking del último ticket asignado). */
export interface ValetLastActivity {
  companyId?: string | null;
  companyName?: string | null;
  parkingId?: string | null;
  parkingName?: string | null;
  assignedAt?: string | null;
}

interface UpdateValetDTO {
  licenseNumber?: string;
  licenseExpiry?: string;
  currentParkingId?: string;
  ratingAvg?: number | null;
  staffRole?: ValetStaffRole | null;
}

export class ValetsService {
  /**
   * Crea un valet. Para super-admin: companyId puede ser null (valet subcontratado).
   * Si viene userId usa ese usuario; si vienen firstName, lastName, email crea User (STAFF, companyId null) y Valet.
   */
  static async create(companyId: string | null | undefined, data: CreateValetDTO) {
    let userId: string;
    const isGlobalValet = companyId == null;

    if (data.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: data.userId },
      });
      if (!userExists) {
        throw new Error("User not found");
      }
      userId = data.userId;
    } else if (data.firstName && data.lastName && data.email) {
      if (isGlobalValet) {
        const user = await UsersService.createValetUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        });
        userId = user.id;
      } else {
        const user = await UsersService.create(companyId, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          systemRole: "STAFF",
        });
        userId = user.id;
      }
    } else {
      throw new Error("Provide either userId or user data (firstName, lastName, email)");
    }

    return prisma.valet.create({
      data: {
        companyId: isGlobalValet ? null : companyId!,
        userId,
        licenseNumber: data.licenseNumber,
        licenseExpiry: new Date(data.licenseExpiry),
        currentParkingId: data.currentParkingId,
        staffRole: data.staffRole,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /** Lista valets. Si companyId es null/undefined (super-admin), devuelve todos e incluye lastActivity. */
  static async list(companyId: string | null | undefined, statuses?: string[]) {
    const where = {
      ...(companyId != null ? { companyId } : {}),
      currentStatus: statuses?.length
        ? { in: statuses as ValetStatus[] }
        : undefined,
    };
    const userSelectWithInvitation = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      lastLogin: true,
      invitationTokenExpiresAt: true,
    } as const;
    const userSelectWithoutInvitation = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      lastLogin: true,
    } as const;

    const assignmentsInclude =
      companyId == null
        ? {
            assignments: {
              include: {
                ticket: {
                  select: {
                    companyId: true,
                    parkingId: true,
                    company: { select: { commercialName: true, legalName: true } },
                    parking: { select: { name: true } },
                  },
                },
              },
              orderBy: { assignedAt: "desc" as const },
              take: 5,
            },
          }
        : {
            assignments: {
              select: { id: true, ticketId: true, role: true, assignedAt: true },
              orderBy: { assignedAt: "desc" as const },
              take: 5,
            },
          };

    try {
      const valets = await prisma.valet.findMany({
        where,
        include: {
          user: { select: userSelectWithInvitation },
          ...assignmentsInclude,
        },
        orderBy: { createdAt: "desc" },
      });

      const listWithLastActivity = valets.map((v) => {
        const user = v.user
          ? (() => {
              const { invitationTokenExpiresAt, ...rest } = v.user!;
              const pendingInvitation =
                invitationTokenExpiresAt != null && new Date(invitationTokenExpiresAt) > new Date();
              return { ...rest, pendingInvitation };
            })()
          : null;

        let lastActivity: ValetLastActivity | null = null;
        if (companyId == null && v.assignments?.length) {
          const first = v.assignments[0] as {
            assignedAt: Date;
            ticket?: {
              companyId: string;
              parkingId: string;
              company?: { commercialName?: string | null; legalName?: string } | null;
              parking?: { name?: string } | null;
            };
          };
          const ticket = first?.ticket;
          if (ticket) {
            lastActivity = {
              companyId: ticket.companyId,
              companyName: ticket.company?.commercialName?.trim() || ticket.company?.legalName || null,
              parkingId: ticket.parkingId,
              parkingName: ticket.parking?.name ?? null,
              assignedAt: first.assignedAt?.toISOString?.() ?? null,
            };
          }
        }

        const assignments = v.assignments?.map((a) => ({
          id: a.id,
          ticketId: a.ticketId,
          role: a.role,
          assignedAt: a.assignedAt,
        }));
        const { assignments: _a, ...rest } = v;
        return {
          ...rest,
          user,
          lastActivity: lastActivity ?? undefined,
          assignments,
        };
      });

      return listWithLastActivity;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("does not exist in the current database")) {
        const valets = await prisma.valet.findMany({
          where,
          include: {
            user: { select: userSelectWithoutInvitation },
            assignments: {
              select: { id: true, ticketId: true, role: true, assignedAt: true },
              orderBy: { assignedAt: "desc" },
              take: 5,
            },
          },
          orderBy: { createdAt: "desc" },
        });
        return valets.map((v) => ({
          ...v,
          user: v.user ? { ...v.user, pendingInvitation: false } : null,
          lastActivity: undefined,
        }));
      }
      throw err;
    }
  }

  static async getById(companyId: string | null | undefined, valetId: string) {
    return prisma.valet.findFirst({
      where:
        companyId != null ? { id: valetId, companyId } : { id: valetId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignments: {
          include: {
            ticket: {
              select: {
                id: true,
                status: true,
                vehicle: {
                  select: {
                    plate: true,
                  },
                },
              },
            },
          },
          orderBy: { assignedAt: "desc" },
          take: 10,
        },
        damageReports: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  }

  static async update(
    _companyId: string | null | undefined,
    valetId: string,
    data: UpdateValetDTO
  ) {
    return prisma.valet.update({
      where: { id: valetId },
      data: {
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry
          ? new Date(data.licenseExpiry)
          : undefined,
        currentParkingId: data.currentParkingId,
        ...(data.ratingAvg !== undefined && { ratingAvg: data.ratingAvg }),
        ...(data.staffRole !== undefined && { staffRole: data.staffRole }),
      },
      include: {
        user: true,
      },
    });
  }

  static async updateStatus(
    _companyId: string | null | undefined,
    valetId: string,
    status: ValetStatus
  ) {
    return prisma.valet.update({
      where: { id: valetId },
      data: {
        currentStatus: status,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  static async deactivate(_companyId: string | null | undefined, valetId: string) {
    return prisma.valet.update({
      where: { id: valetId },
      data: {
        currentStatus: ValetStatus.AWAY,
      },
    });
  }

  /** Valets que tienen al menos una asignación en tickets de esta empresa (para selector al asignar). */
  static async listValetsForCompany(companyId: string) {
    const assignmentValetIds = await prisma.ticketAssignment.findMany({
      where: { ticket: { companyId } },
      select: { valetId: true },
      distinct: ["valetId"],
    });
    const valetIds = assignmentValetIds.map((a) => a.valetId);
    if (valetIds.length === 0) return [];

    return prisma.valet.findMany({
      where: { id: { in: valetIds } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Asignaciones del valet actual (por userId). Para mobile-valet; no requiere company. */
  static async getMyAssignments(userId: string) {
    const valet = await prisma.valet.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!valet) return null;

    const assignments = await prisma.ticketAssignment.findMany({
      where: { valetId: valet.id },
      orderBy: { assignedAt: "desc" },
      include: {
        ticket: {
          select: {
            id: true,
            status: true,
            companyId: true,
            vehicle: { select: { plate: true, countryCode: true } },
            parking: { select: { name: true, address: true } },
            slot: { select: { label: true } },
          },
        },
      },
    });
    return assignments;
  }

  /** Perfil valet del usuario (mobile: rol recepción/conducción). */
  static async getMe(userId: string) {
    return prisma.valet.findUnique({
      where: { userId },
      select: {
        id: true,
        staffRole: true,
        companyId: true,
      },
    });
  }
}
