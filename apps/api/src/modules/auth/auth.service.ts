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

const PASSWORD_RESET_EXPIRY_HOURS = 24;

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

    return { user, token };
  }

  /** Auto-registro de valet: User (companyId null, STAFF) + Valet (companyId null). */
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
      user: valet.user,
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

    // SUPER_ADMIN y valets (companyId null) no dependen del estado de una empresa.
    if (user.systemRole !== "SUPER_ADMIN" && user.companyId != null) {
      if (!user.company || user.company.status !== "ACTIVE") {
        throw new Error("COMPANY_INACTIVE");
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });

    return { user, token };
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

    const token = signToken({
      userId: updated.id,
      role: updated.systemRole,
      companyId: updated.companyId ?? undefined,
    });

    return { user: updated, token };
  }

  /**
   * Solicitud de restablecimiento: si existe usuario activo con contraseña, envía correo con enlace.
   * Respuesta genérica siempre (no filtra existencia del correo).
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

    // Para no filtrar existencia de usuarios, respondemos igual aunque no exista.
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

    // TODO: enviar correo con rawCode usando el proveedor (Resend).
    // Por ahora solo devolvemos ok:true para que el flujo del cliente continúe.

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

    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });

    return { user, token };
  }
}
