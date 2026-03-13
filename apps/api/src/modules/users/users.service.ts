import crypto from "crypto";
import { prisma } from "../../shared/prisma";
import { CreateUserDTO, UpdateUserDTO } from "./users.types";
import { hashPassword } from "../auth/auth.utils";
import { SystemRole } from "@prisma/client";
import { sendInvitationEmail } from "../../shared/email/invitationEmail";

const INVITATION_EXPIRY_HOURS = 72;

/** Si la empresa está PENDING y este es el primer usuario, la pasa a ACTIVE. */
async function activateCompanyIfFirstUser(companyId: string): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { status: true },
  });
  if (!company || company.status !== "PENDING") return;
  const count = await prisma.user.count({ where: { companyId } });
  if (count === 1) {
    await prisma.company.update({
      where: { id: companyId },
      data: { status: "ACTIVE" },
    });
  }
}

/** Si el usuario es CUSTOMER y tiene companyId, crea el registro en Client (governmentId pendiente). */
async function ensureClientForCustomer(
  companyId: string,
  user: { id: string; systemRole: string; companyId: string | null }
): Promise<void> {
  if (user.systemRole !== "CUSTOMER" || !user.companyId) return;
  await prisma.client.create({
    data: {
      companyId,
      userId: user.id,
      governmentId: `PENDING-${user.id}`,
    },
  });
}

export class UsersService {
  static async create(companyId: string, data: CreateUserDTO) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new Error("Company not found");
    }

    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) {
      throw new Error("Email already in use");
    }

    const isInvitation = data.password == null || data.password === "";

    if (isInvitation) {
      const invitationToken = crypto.randomBytes(32).toString("hex");
      const invitationTokenExpiresAt = new Date();
      invitationTokenExpiresAt.setHours(
        invitationTokenExpiresAt.getHours() + INVITATION_EXPIRY_HOURS
      );

      const user = await prisma.user.create({
        data: {
          companyId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash: null,
          systemRole: data.systemRole ?? SystemRole.STAFF,
          invitationToken,
          invitationTokenExpiresAt,
        },
      });

      const companyDisplayName = company.commercialName?.trim() || company.legalName || "";
      await sendInvitationEmail({
        to: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token: invitationToken,
        companyName: companyDisplayName,
      });

      await activateCompanyIfFirstUser(companyId);
      await ensureClientForCustomer(companyId, user);
      return user;
    }

    const passwordHash = await hashPassword(data.password!);

    const user = await prisma.user.create({
      data: {
        companyId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        systemRole: data.systemRole ?? SystemRole.STAFF,
      },
    });
    await activateCompanyIfFirstUser(companyId);
    await ensureClientForCustomer(companyId, user);
    return user;
  }

  /** Crea un SUPER_ADMIN (companyId: null). Solo otros SUPER_ADMIN pueden invocar. */
  static async createSuperAdmin(data: { email: string; firstName: string; lastName: string; password?: string }) {
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (exists) {
      throw new Error("Email already in use");
    }
    const isInvitation = data.password == null || data.password === "";
    if (isInvitation) {
      const invitationToken = crypto.randomBytes(32).toString("hex");
      const invitationTokenExpiresAt = new Date();
      invitationTokenExpiresAt.setHours(
        invitationTokenExpiresAt.getHours() + INVITATION_EXPIRY_HOURS
      );
      const user = await prisma.user.create({
        data: {
          companyId: null,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash: null,
          systemRole: SystemRole.SUPER_ADMIN,
          invitationToken,
          invitationTokenExpiresAt,
        },
      });
      await sendInvitationEmail({
        to: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token: invitationToken,
        companyName: undefined,
      });
      return user;
    }
    const passwordHash = await hashPassword(data.password!);
    return prisma.user.create({
      data: {
        companyId: null,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        systemRole: SystemRole.SUPER_ADMIN,
      },
    });
  }

  /** Crea un usuario valet (companyId: null, STAFF). Para invitación por super-admin o auto-registro. */
  static async createValetUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
  }) {
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (exists) {
      throw new Error("Email already in use");
    }
    const isInvitation = data.password == null || data.password === "";
    if (isInvitation) {
      const invitationToken = crypto.randomBytes(32).toString("hex");
      const invitationTokenExpiresAt = new Date();
      invitationTokenExpiresAt.setHours(
        invitationTokenExpiresAt.getHours() + INVITATION_EXPIRY_HOURS
      );
      const user = await prisma.user.create({
        data: {
          companyId: null,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash: null,
          systemRole: SystemRole.STAFF,
          invitationToken,
          invitationTokenExpiresAt,
        },
      });
      await sendInvitationEmail({
        to: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token: invitationToken,
        companyName: undefined,
      });
      return user;
    }
    const passwordHash = await hashPassword(data.password!);
    return prisma.user.create({
      data: {
        companyId: null,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        systemRole: SystemRole.STAFF,
      },
    });
  }

  /** Select sin columnas de invitación (por si la migración no está aplicada). */
  private static readonly listSelectWithoutInvitation = {
    id: true,
    companyId: true,
    firstName: true,
    lastName: true,
    email: true,
    avatarUrl: true,
    timezone: true,
    phone: true,
    phoneVerified: true,
    systemRole: true,
    lastLogin: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  static async list(
    companyId: string,
    options?: { excludeValets?: boolean; systemRoles?: string[]; includeInactives?: boolean }
  ) {
    const where = {
      companyId,
      ...(options?.excludeValets === true ? { valet: null } : {}),
      ...(options?.systemRoles?.length
        ? { systemRole: { in: options.systemRoles as SystemRole[] } }
        : {}),
      ...(options?.includeInactives === false ? { isActive: true } : {}),
    };
    const orderBy = { createdAt: "desc" as const };

    try {
      const users = await prisma.user.findMany({
        where,
        select: {
          ...this.listSelectWithoutInvitation,
          invitationTokenExpiresAt: true,
        },
        orderBy,
      });
      return users.map((u) => {
        const { invitationTokenExpiresAt, ...rest } = u;
        const pendingInvitation =
          invitationTokenExpiresAt != null && new Date(invitationTokenExpiresAt) > new Date();
        return { ...rest, pendingInvitation };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("does not exist in the current database")) {
        const users = await prisma.user.findMany({
          where,
          select: this.listSelectWithoutInvitation,
          orderBy,
        });
        return users.map((u) => ({ ...u, pendingInvitation: false }));
      }
      throw err;
    }
  }

  static async getById(companyId: string, userId: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: userId, companyId },
      });
      if (!user) return null;
      const { passwordHash, invitationToken, invitationTokenExpiresAt, ...rest } = user;
      const pendingInvitation =
        invitationTokenExpiresAt != null && new Date(invitationTokenExpiresAt) > new Date();
      return { ...rest, pendingInvitation };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("does not exist in the current database")) {
        const user = await prisma.user.findFirst({
          where: { id: userId, companyId },
          select: { ...this.listSelectWithoutInvitation },
        });
        return user ? { ...user, pendingInvitation: false } : null;
      }
      throw err;
    }
  }

  static async resendInvitation(companyId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });
    if (!user) throw new Error("User not found");
    if (!user.invitationToken || user.passwordHash != null) {
      throw new Error("User has already set their password or was not invited by email");
    }
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { commercialName: true, legalName: true },
    });
    const companyDisplayName = company
      ? (company.commercialName?.trim() || company.legalName || "").trim()
      : "";
    const invitationToken = crypto.randomBytes(32).toString("hex");
    const invitationTokenExpiresAt = new Date();
    invitationTokenExpiresAt.setHours(
      invitationTokenExpiresAt.getHours() + INVITATION_EXPIRY_HOURS
    );
    await prisma.user.update({
      where: { id: userId },
      data: { invitationToken, invitationTokenExpiresAt },
    });
    await sendInvitationEmail({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token: invitationToken,
      companyName: companyDisplayName || undefined,
    });
    return { ok: true };
  }

  static async update(
    companyId: string,
    userId: string,
    data: UpdateUserDTO
  ) {
    return prisma.user.update({
      where: {
        id: userId,
        companyId,
      },
      data,
    });
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;
    return user;
  }

  static async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      timezone?: string;
      avatarUrl?: string;
      appPreferences?: {
        theme?: "light" | "dark";
        locale?: "es" | "en";
      };
    }
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    if (data.email !== undefined) updateData.email = data.email.trim();
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.timezone !== undefined) updateData.timezone = data.timezone?.trim() || "UTC";
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;
    if (data.appPreferences !== undefined) {
      const current = await prisma.user.findUnique({
        where: { id: userId },
        select: { appPreferences: true },
      });
      const existingPrefs =
        current && current.appPreferences && typeof current.appPreferences === "object"
          ? (current.appPreferences as Record<string, unknown>)
          : {};
      updateData.appPreferences = {
        ...existingPrefs,
        ...data.appPreferences,
      };
    }
    return prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  static async deactivate(companyId: string, userId: string) {
    return prisma.user.update({
      where: {
        id: userId,
        companyId,
      },
      data: {
        isActive: false,
      },
    });
  }
}
