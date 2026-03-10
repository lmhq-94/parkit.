import { prisma } from "../../shared/prisma";
import { ValetStatus } from "@prisma/client";

interface CreateValetDTO {
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  currentParkingId?: string;
}

interface UpdateValetDTO {
  licenseNumber?: string;
  licenseExpiry?: string;
  currentParkingId?: string;
  ratingAvg?: number;
}

export class ValetsService {
  static async create(companyId: string, data: CreateValetDTO) {
    const userExists = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    return prisma.valet.create({
      data: {
        companyId,
        userId: data.userId,
        licenseNumber: data.licenseNumber,
        licenseExpiry: new Date(data.licenseExpiry),
        currentParkingId: data.currentParkingId,
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

  static async list(companyId: string, statuses?: string[]) {
    const where = {
      companyId,
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
      invitationTokenExpiresAt: true,
    } as const;
    const userSelectWithoutInvitation = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    } as const;

    try {
      const valets = await prisma.valet.findMany({
        where,
        include: {
          user: { select: userSelectWithInvitation },
          assignments: {
            select: { id: true, ticketId: true, role: true, assignedAt: true },
            orderBy: { assignedAt: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return valets.map((v) => {
        const user = v.user
          ? (() => {
              const { invitationTokenExpiresAt, ...rest } = v.user!;
              const pendingInvitation =
                invitationTokenExpiresAt != null && new Date(invitationTokenExpiresAt) > new Date();
              return { ...rest, pendingInvitation };
            })()
          : null;
        return { ...v, user };
      });
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
        }));
      }
      throw err;
    }
  }

  static async getById(companyId: string, valetId: string) {
    return prisma.valet.findFirst({
      where: { id: valetId, companyId },
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
    companyId: string,
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
        ratingAvg: data.ratingAvg,
      },
      include: {
        user: true,
      },
    });
  }

  static async updateStatus(
    companyId: string,
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

  static async deactivate(companyId: string, valetId: string) {
    return prisma.valet.update({
      where: { id: valetId },
      data: {
        currentStatus: ValetStatus.AWAY,
      },
    });
  }
}
