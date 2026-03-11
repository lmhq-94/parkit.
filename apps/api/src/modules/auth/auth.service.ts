import { prisma } from "../../shared/prisma";
import {
  AcceptInvitationDTO,
  LoginDTO,
  RegisterDTO,
  RequestOtpDTO,
  VerifyOtpDTO,
} from "./auth.types";
import { comparePassword, hashPassword, signToken } from "./auth.utils";
import crypto from "crypto";

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
        companyId: data.companyId
      },
    });

    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });

    return { user, token };
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

    // SUPER_ADMIN no depende del estado de una empresa.
    if (user.systemRole !== "SUPER_ADMIN") {
      if (!user.company || user.company.status !== "ACTIVE") {
        throw new Error("COMPANY_INACTIVE");
      }
    }

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
      },
    });

    const token = signToken({
      userId: updated.id,
      role: updated.systemRole,
      companyId: updated.companyId ?? undefined,
    });

    return { user: updated, token };
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

    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });

    return { user, token };
  }
}
