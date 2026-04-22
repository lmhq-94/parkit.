import { prisma } from "../../shared/prisma";
import {
  ForgotPasswordDTO,
  LoginDTO,
  RegisterDTO,
  RegisterInvitedDTO,
  RegisterValetDTO,
  RequestOtpDTO,
  ResetPasswordDTO,
  VerifyOtpDTO,
} from "./auth.types";
import { comparePassword, hashPassword, signToken, verifyInvitationToken } from "./auth.utils";
import crypto from "crypto";
import { UsersService } from "../users/users.service";
import { ValetsService } from "../valets/valets.service";
import { sendPasswordResetEmail } from "../../shared/email/passwordResetEmail";
import { toAuthUserResponse } from "./authUserResponse";

const PASSWORD_RESET_EXPIRY_HOURS = 24;

async function valetStaffRoleForUser(userId: string) {
  const v = await prisma.valet.findUnique({
    where: { userId },
    select: { staffRole: true },
  });
  return v?.staffRole ?? null;
}

export class AuthService {
  static async validateInvitation(token: string) {
    const payload = verifyInvitationToken(token);
    const { email, companyId, role } = payload;

    // Check if invitation exists and is pending
    const invitation = await prisma.invitation.findUnique({
      where: { token, status: "PENDING" },
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new Error("Invalid or expired invitation");
    }

    return { email, companyId, role };
  }

  static async register(data: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        companyId: data.companyId ?? null,
      },
    });

    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });

    return { user: toAuthUserResponse(user, await valetStaffRoleForUser(user.id)), token };
  }

  /** Valet self-registration: User (companyId null, STAFF) + Valet (companyId null). */
  static async registerValet(data: RegisterValetDTO) {
    const user = await UsersService.createValetUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });
    const valet = await prisma.valet.create({
      data: {
        userId: user.id,
        companyId: null,
        staffRole: data.staffRole,
        licenseNumber: data.licenseNumber?.trim() || null,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
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
            systemRole: true,
            companyId: true,
          },
        },
      },
    });
    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });
    await ValetsService.syncValetStatusAfterAuthSession(user.id).catch(() => {});
    return {
      user: toAuthUserResponse(valet.user, valet.staffRole),
      token,
    };
  }

  static async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        company: {
          select: { status: true },
        },
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.passwordHash) {
      throw new Error(
        "Account pending. Please set your password using the invitation link sent to your email."
      );
    }

    if (user.isActive === false) {
      throw new Error("USER_INACTIVE");
    }

    const isValid = await comparePassword(
      data.password,
      user.passwordHash
    );

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // SUPER_ADMIN and valets (companyId null) do not depend on a company status.
    if (user.systemRole !== "SUPER_ADMIN" && user.companyId != null) {
      if (!user.company || user.company.status !== "ACTIVE") {
        throw new Error("COMPANY_INACTIVE");
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const vr = await valetStaffRoleForUser(user.id);
    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });

    await ValetsService.syncValetStatusAfterAuthSession(user.id).catch(() => {
      /* no bloquear login */
    });

    return { user: toAuthUserResponse(user, vr), token };
  }

  /**
   * Registers a user from a stateless invitation token.
   */
  static async registerInvited(data: RegisterInvitedDTO) {
    const payload = verifyInvitationToken(data.token);
    const { email, companyId, role, valetStaffRole, licenseNumber, licenseExpiry } = payload;

    // Check if invitation exists and is pending
    const invitation = await prisma.invitation.findUnique({
      where: { token: data.token, status: "PENDING" },
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new Error("Invalid or expired invitation");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.$transaction(async (tx) => {
      const userCompanyId = role === "STAFF" ? null : companyId;

      const newUser = await tx.user.create({
        data: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: email.toLowerCase().trim(),
          passwordHash,
          companyId: userCompanyId,
          systemRole: role,
        },
      });

      if (role === "CUSTOMER") {
        await tx.customer.create({
          data: {
            userId: newUser.id,
            companyId,
            governmentId: `INV-${newUser.id.split("-")[0]}`, // Placeholder ID, user can update later
          },
        });
      }

      // If registering a STAFF with valet data, create the Valet profile
      if (role === "STAFF" && valetStaffRole) {
        await tx.valet.create({
          data: {
            userId: newUser.id,
            companyId: null,
            staffRole: valetStaffRole,
            licenseNumber: licenseNumber || null,
            licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
            lastPresenceAt: new Date(),
          },
        });
      }

      // If registering an ADMIN, activate the company
      if (role === "ADMIN" && companyId) {
        await tx.company.update({
          where: { id: companyId },
          data: { status: "ACTIVE" },
        });
      }

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      return newUser;
    });

    const vr = await valetStaffRoleForUser(user.id);
    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });

    return { user: toAuthUserResponse(user, vr), token };
  }

  /**
   * Password reset request: if an active user with password exists, send reset email.
   * Always returns a generic response (does not reveal whether email exists).
   */
  static async requestPasswordReset(data: ForgotPasswordDTO) {
    const email = data.email.trim();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isActive !== false && user.passwordHash != null) {
      const passwordResetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);

      await prisma.oneTimeCode.create({
        data: {
          userId: user.id,
          codeHash: passwordResetToken, // for reset links, we store the full token as hash
          purpose: "RESET_PASSWORD",
          channel: "EMAIL",
          expiresAt,
        },
      });

      await sendPasswordResetEmail({
        to: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token: passwordResetToken,
      });
    }

    return { ok: true as const };
  }

  static async resetPassword(data: ResetPasswordDTO) {
    const token = data.token.trim();
    const otc = await prisma.oneTimeCode.findFirst({
      where: {
        codeHash: token,
        purpose: "RESET_PASSWORD",
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: { user: true },
    });

    if (!otc || !otc.user) {
      throw new Error(
        "Invalid or expired reset link. Request a new one from the login page."
      );
    }

    const user = otc.user;

    if (user.isActive === false) {
      throw new Error("USER_INACTIVE");
    }

    const passwordHash = await hashPassword(data.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          lastLogin: new Date(),
        },
      }),
      prisma.oneTimeCode.update({
        where: { id: otc.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { ok: true as const };
  }

  static async requestOtp(data: RequestOtpDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // To avoid leaking user existence, respond the same even when user does not exist.
    if (!user || user.isActive === false) {
      return { ok: true };
    }

    const rawCode = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = crypto.createHash("sha256").update(rawCode).digest("hex");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oneTimeCode.create({
      data: {
        userId: user.id,
        codeHash,
        purpose: data.purpose ?? "LOGIN",
        channel: data.channel ?? "EMAIL",
        expiresAt,
      },
    });

    // TODO: send rawCode by email using the provider (Resend).
    // For now, only return ok:true so the client flow can continue.

    return { ok: true };
  }

  static async verifyOtp(data: VerifyOtpDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || user.isActive === false) {
      throw new Error("Invalid code");
    }

    const codeHash = crypto.createHash("sha256").update(data.code).digest("hex");

    const oneTimeCode = await prisma.oneTimeCode.findFirst({
      where: {
        userId: user.id,
        purpose: data.purpose ?? "LOGIN",
        usedAt: null,
        expiresAt: { gt: new Date() },
        codeHash,
      },
    });

    if (!oneTimeCode) {
      throw new Error("Invalid or expired code");
    }

    await prisma.oneTimeCode.update({
      where: { id: oneTimeCode.id },
      data: { usedAt: new Date() },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const vr = await valetStaffRoleForUser(user.id);
    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });

    await ValetsService.syncValetStatusAfterAuthSession(user.id).catch(() => {});

    return { user: toAuthUserResponse(user, vr), token };
  }
}
