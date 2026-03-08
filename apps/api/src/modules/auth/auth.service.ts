import { prisma } from "../../shared/prisma";
import { AcceptInvitationDTO, LoginDTO, RegisterDTO } from "./auth.types";
import { comparePassword, hashPassword, signToken } from "./auth.utils";

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
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.passwordHash) {
      throw new Error(
        "Account pending. Please set your password using the invitation link sent to your email."
      );
    }

    const isValid = await comparePassword(
      data.password,
      user.passwordHash
    );

    if (!isValid) {
      throw new Error("Invalid credentials");
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
}
