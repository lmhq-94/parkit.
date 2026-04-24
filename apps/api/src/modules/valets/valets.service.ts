import { prisma } from "../../shared/prisma";
import { ValetStaffRole, ValetStatus, TicketStatus } from "@prisma/client";
import { UsersService } from "../users/users.service";
import { VALET_PRESENCE_MAX_AGE_MS } from "./valetPresence.constants";

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

/** Valet's last activity (company/parking of the last assigned ticket). */
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

/** DTO for PATCH /valets/me (mobile app). */
export interface PatchValetMeDTO {
  staffRole?: ValetStaffRole;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  companyId?: string | null;
  currentParkingId?: string | null;
}

export class ValetsService {
  /** Active tickets that keep the valet BUSY. */
  static async countActiveTicketAssignments(valetId: string): Promise<number> {
    const assignments = await prisma.ticketAssignment.findMany({
      where: {
        valetId,
        ticket: {
          status: {
            in: [
              TicketStatus.PARKED,
              TicketStatus.REQUEST_PARKING,
              TicketStatus.REQUEST_DELIVERY,
            ],
          },
        },
      },
      include: {
        ticket: {
          select: { status: true },
        },
      },
    });

    // For RECEPTIONIST: only counts tickets in REQUEST_PARKING (reception phase)
    // For DRIVER: counts tickets in any active state
    const valet = await prisma.valet.findUnique({
      where: { id: valetId },
      select: { staffRole: true },
    });

    if (!valet) return 0;

    if (valet.staffRole === ValetStaffRole.RECEPTIONIST) {
      return assignments.filter(
        (a) => a.ticket.status === TicketStatus.REQUEST_PARKING
      ).length;
    }

    // DRIVER or null (legacy): counts all active tickets
    return assignments.length;
  }

  /** Determines if the valet is busy based on wizard and active tickets. */
  static async isValetBusy(valetId: string): Promise<boolean> {
    const valet = await prisma.valet.findUnique({
      where: { id: valetId },
      select: { isInWizard: true, staffRole: true },
    });

    if (!valet) return false;

    // If in wizard, is busy
    if (valet.isInWizard) return true;

    // Fallback: check active tickets
    const activeCount = await ValetsService.countActiveTicketAssignments(valetId);
    return activeCount > 0;
  }

  /**
   * Tras login u OTP: AVAILABLE si no tiene trabajo activo; si no, BUSY.
   * No pisa AWAY hasta que el usuario vuelva a autenticarse (el login llama esto).
   */
  static async syncValetStatusAfterAuthSession(userId: string): Promise<void> {
    const v = await prisma.valet.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!v) return;
    const active = await ValetsService.countActiveTicketAssignments(v.id);
    await prisma.valet.update({
      where: { id: v.id },
      data: {
        currentStatus: active > 0 ? ValetStatus.BUSY : ValetStatus.AVAILABLE,
        lastPresenceAt: new Date(),
      },
    });
  }

  /** Heartbeat from app: updates lastPresenceAt unless AWAY (e.g. logged out). */
  static async pingMyPresence(userId: string) {
    const v = await prisma.valet.findUnique({
      where: { userId },
      select: { id: true, currentStatus: true },
    });
    if (!v) {
      throw new Error("User is not a valet");
    }
    if (v.currentStatus === ValetStatus.AWAY) {
      return prisma.valet.findUnique({
        where: { id: v.id },
        select: {
          id: true,
          staffRole: true,
          companyId: true,
          currentParkingId: true,
          currentStatus: true,
          lastPresenceAt: true,
          licenseNumber: true,
          licenseExpiry: true,
        },
      });
    }
    return prisma.valet.update({
      where: { id: v.id },
      data: { lastPresenceAt: new Date() },
      select: {
        id: true,
        staffRole: true,
        companyId: true,
        currentParkingId: true,
        currentStatus: true,
        lastPresenceAt: true,
        licenseNumber: true,
        licenseExpiry: true,
      },
    });
  }

  /**
   * AWAY: el valet indica ausencia (p. ej. cerró sesión).
   * AVAILABLE: solo si no hay tickets activos
   */
  static async updateMyPresence(userId: string, status: "AWAY" | "AVAILABLE") {
    const v = await prisma.valet.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!v) {
      throw new Error("User is not a valet");
    }

    const data: { currentStatus: ValetStatus; lastPresenceAt: Date | null } =
      status === "AWAY"
        ? { currentStatus: ValetStatus.AWAY, lastPresenceAt: null }
        : { currentStatus: ValetStatus.AVAILABLE, lastPresenceAt: new Date() };

    // If in wizard, close wizard on logout
    if (status === "AWAY") {
      await prisma.valet.update({
        where: { id: v.id },
        data: {
          ...data,
          isInWizard: false,
          wizardType: null,
          wizardStartedAt: null,
        },
      });
    } else {
      await prisma.valet.update({
        where: { id: v.id },
        data,
      });
    }

    const active = await ValetsService.countActiveTicketAssignments(v.id);
    if (active > 0) {
      return prisma.valet.update({
        where: { id: v.id },
        data: { currentStatus: ValetStatus.BUSY },
        select: {
          id: true,
          staffRole: true,
          companyId: true,
          currentParkingId: true,
          currentStatus: true,
          lastPresenceAt: true,
          licenseNumber: true,
          licenseExpiry: true,
        },
      });
    }
    return prisma.valet.findUnique({
      where: { id: v.id },
      select: {
        id: true,
        staffRole: true,
        companyId: true,
        currentParkingId: true,
        currentStatus: true,
        lastPresenceAt: true,
        licenseNumber: true,
        licenseExpiry: true,
      },
    });
  }

  /** Start valet wizard (RECEIVE, PARK, RETURN). */
  static async startMyWizard(userId: string, wizardType: "RECEIVE" | "PARK" | "RETURN") {
    const v = await prisma.valet.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!v) {
      throw new Error("User is not a valet");
    }

    const updated = await prisma.valet.update({
      where: { id: v.id },
      data: {
        isInWizard: true,
        wizardType,
        wizardStartedAt: new Date(),
        currentStatus: ValetStatus.BUSY,
        lastPresenceAt: new Date(),
      },
    });

    return updated;
  }

  /** End valet wizard. */
  static async endMyWizard(userId: string) {
    const v = await prisma.valet.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!v) {
      throw new Error("User is not a valet");
    }

    // Check if has active tickets to determine final status
    const activeCount = await ValetsService.countActiveTicketAssignments(v.id);

    const updated = await prisma.valet.update({
      where: { id: v.id },
      data: {
        isInWizard: false,
        wizardType: null,
        wizardStartedAt: null,
        currentStatus: activeCount > 0 ? ValetStatus.BUSY : ValetStatus.AVAILABLE,
        lastPresenceAt: new Date(),
      },
    });

    return updated;
  }

  /** Automatic timeout for abandoned wizards (more than 30 minutes). */
  static async cleanupAbandonedWizards() {
    const timeoutMinutes = 30;
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const abandonedValets = await prisma.valet.findMany({
      where: {
        isInWizard: true,
        wizardStartedAt: { lt: cutoff },
      },
      select: { id: true },
    });

    for (const valet of abandonedValets) {
      const activeCount = await ValetsService.countActiveTicketAssignments(valet.id);
      await prisma.valet.update({
        where: { id: valet.id },
        data: {
          isInWizard: false,
          wizardType: null,
          wizardStartedAt: null,
          currentStatus: activeCount > 0 ? ValetStatus.BUSY : ValetStatus.AVAILABLE,
        },
      });
    }

    return { cleaned: abandonedValets.length };
  }

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
        lastPresenceAt: new Date(),
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

  /** List valets. If companyId is null/undefined (super-admin), returns all and includes lastActivity. */
  static async list(
    companyId: string | null | undefined,
    statuses?: string[],
    accountStatuses?: string[]
  ) {
    const hasActive = accountStatuses?.includes("active") ?? false;
    const hasInactive = accountStatuses?.includes("inactive") ?? false;
    const accountFilterUser =
      accountStatuses != null &&
      accountStatuses.length > 0 &&
      hasActive !== hasInactive
        ? { isActive: hasActive }
        : undefined;

    const where = {
      ...(companyId != null ? { companyId } : {}),
      currentStatus: statuses?.length
        ? { in: statuses as ValetStatus[] }
        : undefined,
      ...(accountFilterUser ? { user: accountFilterUser } : {}),
    };
    const userSelectWithInvitation = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      lastLogin: true,
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
              select: { id: true, ticketId: true, assignedAt: true },
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
          ? { ...v.user, pendingInvitation: false }
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
              select: { id: true, ticketId: true, assignedAt: true },
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

  /** Valets to assign in tickets: priority to those with activity in the company; if none, all in the company. */
  static async listValetsForCompany(companyId: string) {
    const assignmentValetIds = await prisma.ticketAssignment.findMany({
      where: { ticket: { companyId } },
      select: { valetId: true },
      distinct: ["valetId"],
    });
    const valetIds = assignmentValetIds.map((a) => a.valetId);

    const includeUser = {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      },
    } as const;

    if (valetIds.length > 0) {
      return prisma.valet.findMany({
        where: { id: { in: valetIds } },
        include: includeUser,
        orderBy: { createdAt: "desc" },
      });
    }

    return prisma.valet.findMany({
      where: { companyId },
      include: includeUser,
      orderBy: { createdAt: "desc" },
    });
  }

  /** Valets for workflow filtered by specific parking. */
  static async listValetsForParking(parkingId: string, companyId: string) {
    const includeUser = {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      },
    } as const;

    // Get all valets in the parking (by currentParkingId)
    const valets = await prisma.valet.findMany({
      where: {
        companyId,
        OR: [
          { currentParkingId: parkingId },
          // Also include valets with recent active assignments in the parking
        ],
      },
      include: includeUser,
      orderBy: { currentStatus: "asc" },
    });

    // Calculate current status of each valet based on isInWizard and active tickets
    const valetsWithStatus = await Promise.all(
      valets.map(async (valet) => {
        const isBusy = await ValetsService.isValetBusy(valet.id);
        return {
          ...valet,
          currentStatus: isBusy ? ValetStatus.BUSY : ValetStatus.AVAILABLE,
        };
      })
    );

    return valetsWithStatus;
  }

  /** Workflow statistics for the workflow tile. */
  static async getWorkflowStatus(companyId: string, parkingId?: string) {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

    const where = parkingId
      ? { companyId, parkingId }
      : { companyId };

    // Active tickets (active processes)
    const activeProcesses = await prisma.ticket.count({
      where: {
        ...where,
        status: {
          in: [TicketStatus.PARKED, TicketStatus.REQUEST_PARKING, TicketStatus.REQUEST_DELIVERY],
        },
      },
    });

    // Tickets completed today
    const completedToday = await prisma.ticket.count({
      where: {
        ...where,
        status: TicketStatus.DELIVERED,
        exitTime: { gte: startOfDay },
      },
    });

    // Pending tickets (in queue)
    const pendingTasks = await prisma.ticket.count({
      where: {
        ...where,
        status: {
          in: [TicketStatus.REQUEST_PARKING, TicketStatus.REQUEST_DELIVERY],
        },
      },
    });

    return {
      activeProcesses,
      completedToday,
      pendingTasks,
      lastUpdated: now.toISOString(),
    };
  }

  /** Current valet's assignments (by userId). For mobile-valet; does not require company. */
  static async getMyAssignments(userId: string) {
    const valet = await prisma.valet.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!valet) return null;

    const assignments = await prisma.ticketAssignment.findMany({
      where: { valetId: valet.id, role: ValetStaffRole.DRIVER },
      orderBy: { assignedAt: "desc" },
      include: {
        ticket: {
          select: {
            id: true,
            status: true,
            companyId: true,
            ticketCode: true,
            keyCode: true,
            entryTime: true,
            vehicle: {
              select: {
                plate: true,
                countryCode: true,
                brand: true,
                model: true,
                color: true,
              },
            },
            parking: { select: { name: true, address: true } },
            slot: { select: { label: true } },
          },
        },
      },
    });
    return assignments;
  }

  /** User's valet profile (mobile: reception/driving role). */
  static async getMe(userId: string) {
    return prisma.valet.findUnique({
      where: { userId },
      select: {
        id: true,
        staffRole: true,
        companyId: true,
        currentParkingId: true,
        currentStatus: true,
        lastPresenceAt: true,
        licenseNumber: true,
        licenseExpiry: true,
      },
    });
  }

  /**
   * Conductores AVAILABLE en un parqueo concreto (misma empresa que el contexto).
   * Incluye staffRole DRIVER o null (legado). Requiere ping reciente en la app.
   */
  static async listAvailableDriversAtParking(parkingId: string, companyId: string) {
    const p = await prisma.parking.findFirst({
      where: { id: parkingId, companyId },
      select: { id: true },
    });
    if (!p) {
      throw new Error("Parking not found or not in your company context");
    }

    const presenceSince = new Date(Date.now() - VALET_PRESENCE_MAX_AGE_MS);

    return prisma.valet.findMany({
      where: {
        currentParkingId: parkingId,
        currentStatus: ValetStatus.AVAILABLE,
        lastPresenceAt: { gte: presenceSince },
        OR: [{ staffRole: ValetStaffRole.DRIVER }, { staffRole: null }],
        user: { isActive: true },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ user: { firstName: "asc" } }, { user: { lastName: "asc" } }],
    });
  }

  /**
   * Conductores del parqueo para asignación en recepción:
   * - available: se puede mover de inmediato
   * - busy: se puede asignar en cola (tomará más tiempo)
   * Incluye conductores con currentParkingId configurado O con asignaciones activas en el parqueo
   */
  static async listDispatchDriversAtParking(parkingId: string, companyId: string) {
    const p = await prisma.parking.findFirst({
      where: { id: parkingId, companyId },
      select: { id: true },
    });
    if (!p) {
      throw new Error("Parking not found or not in your company context");
    }

    const presenceSince = new Date(Date.now() - VALET_PRESENCE_MAX_AGE_MS);

    // Find valets with active assignments in this parking
    const activeAssignmentValetIds = await prisma.ticketAssignment.findMany({
      where: {
        ticket: {
          parkingId: parkingId,
          status: {
            in: [TicketStatus.PARKED, TicketStatus.REQUEST_PARKING, TicketStatus.REQUEST_DELIVERY],
          },
        },
      },
      select: { valetId: true },
      distinct: ["valetId"],
    });

    const assignmentValetIds = activeAssignmentValetIds.map((a) => a.valetId);

    const rows = await prisma.valet.findMany({
      where: {
        currentStatus: { in: [ValetStatus.AVAILABLE, ValetStatus.BUSY] },
        lastPresenceAt: { gte: presenceSince },
        user: { isActive: true },
        AND: [
          {
            OR: [{ staffRole: ValetStaffRole.DRIVER }, { staffRole: null }],
          },
          {
            OR: [
              { currentParkingId: parkingId },
              { id: { in: assignmentValetIds } },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { currentStatus: "asc" }, // AVAILABLE first
        { user: { firstName: "asc" } },
        { user: { lastName: "asc" } },
      ],
    });

    const available = rows.filter((v) => v.currentStatus === ValetStatus.AVAILABLE);
    const busy = rows.filter((v) => v.currentStatus === ValetStatus.BUSY);
    return { available, busy };
  }

  /** Updates current valet's profile and/or operational context (mobile app). */
  static async patchMe(userId: string, dto: PatchValetMeDTO) {
    const existing = await prisma.valet.findUnique({
      where: { userId },
      select: {
        id: true,
        staffRole: true,
        companyId: true,
        currentParkingId: true,
      },
    });
    if (!existing) {
      throw new Error("User is not a valet");
    }

    const data: {
      staffRole?: ValetStaffRole;
      licenseNumber?: string | null;
      licenseExpiry?: Date | null;
      companyId?: string | null;
      currentParkingId?: string | null;
    } = {};

    if (dto.staffRole !== undefined) {
      data.staffRole = dto.staffRole;
    }

    if (dto.licenseNumber !== undefined) {
      const n = dto.licenseNumber;
      data.licenseNumber =
        n === null || (typeof n === "string" && n.trim() === "") ? null : n.trim();
    }
    if (dto.licenseExpiry !== undefined) {
      data.licenseExpiry =
        dto.licenseExpiry === null || dto.licenseExpiry === ""
          ? null
          : new Date(dto.licenseExpiry);
    }

    let nextCompanyId = existing.companyId;

    if (dto.companyId !== undefined) {
      data.companyId = dto.companyId;
      nextCompanyId = dto.companyId;
    }
    if (dto.currentParkingId !== undefined) {
      data.currentParkingId = dto.currentParkingId;
    }

    if (dto.currentParkingId !== undefined && dto.currentParkingId !== null) {
      const parkingRow = await prisma.parking.findUnique({
        where: { id: dto.currentParkingId },
        select: { companyId: true },
      });
      if (!parkingRow) {
        throw new Error("Parking not found");
      }
      const coForParking =
        dto.companyId !== undefined ? dto.companyId : existing.companyId;
      if (coForParking != null && parkingRow.companyId !== coForParking) {
        throw new Error("Parking does not belong to the given company");
      }
      if (coForParking == null) {
        data.companyId = parkingRow.companyId;
        nextCompanyId = parkingRow.companyId;
      }
    }

    if (
      dto.companyId !== undefined &&
      dto.currentParkingId === undefined &&
      existing.currentParkingId != null
    ) {
      const p = await prisma.parking.findUnique({
        where: { id: existing.currentParkingId },
        select: { companyId: true },
      });
      if (
        p &&
        nextCompanyId != null &&
        p.companyId !== nextCompanyId
      ) {
        data.currentParkingId = null;
      }
    }

    if (Object.keys(data).length === 0) {
      return prisma.valet.findUnique({
        where: { id: existing.id },
        select: {
          id: true,
          staffRole: true,
          companyId: true,
          currentParkingId: true,
          currentStatus: true,
          lastPresenceAt: true,
          licenseNumber: true,
          licenseExpiry: true,
        },
      });
    }

    return prisma.valet.update({
      where: { id: existing.id },
      data: {
        ...data,
        lastPresenceAt: new Date(),
      },
      select: {
        id: true,
        staffRole: true,
        companyId: true,
        currentParkingId: true,
        currentStatus: true,
        lastPresenceAt: true,
        licenseNumber: true,
        licenseExpiry: true,
      },
    });
  }
}
