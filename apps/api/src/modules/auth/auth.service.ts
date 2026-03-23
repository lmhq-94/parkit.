import { prisma } from "../../shared/prisma";
import {
  AcceptInvitationDTO,
  ForgotPasswordDTO,
  LoginDTO,
  RegisterDTO,
  RegisterValetDTO,
  RequestOtpDTO,
  ResetPasswordDTO,
  VerifyOtpDTO,
} from "./auth.types";
import { comparePassword, hashPassword, signToken } from "./auth.utils";
import crypto from "crypto";
import { UsersService } from "../users/users.service";
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

    return { user: toAuthUserResponse(user, vr), token };
  }

  static async acceptInvitation(data: AcceptInvitationDTO) {
    const user = await prisma.user.findFirst({
      where: {
        invitationToken: data.token,
        invitationTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error("Invalid or expired invitation link. Ask your admin to resend the invitation.");
    }

    if (user.isActive === false) {
      throw new Error("USER_INACTIVE");
    }

    const passwordHash = await hashPassword(data.password);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        invitationToken: null,
        invitationTokenExpiresAt: null,
        lastLogin: new Date(),
      },
    });

    const vr = await valetStaffRoleForUser(updated.id);
    const token = signToken({
      userId: updated.id,
      role: updated.systemRole,
      companyId: updated.companyId ?? undefined,
    });

    return { user: toAuthUserResponse(updated, vr), token };
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
      const passwordResetExpiresAt = new Date();
      passwordResetExpiresAt.setHours(
        passwordResetExpiresAt.getHours() + PASSWORD_RESET_EXPIRY_HOURS
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken, passwordResetExpiresAt },
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
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: data.token.trim(),
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error(
        "Invalid or expired reset link. Request a new one from the login page."
      );
    }

    if (user.isActive === false) {
      throw new Error("USER_INACTIVE");
    }

    const passwordHash = await hashPassword(data.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        invitationToken: null,
        invitationTokenExpiresAt: null,
        lastLogin: new Date(),
      },
    });

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

    return { user: toAuthUserResponse(user, vr), token };
  }
}
