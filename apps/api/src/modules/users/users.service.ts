import { prisma } from "../../shared/prisma";
import { CreateUserDTO, UpdateUserDTO } from "./users.types";
import { hashPassword } from "../auth/auth.utils";
import { SystemRole } from "@prisma/client";

export class UsersService {
  static async create(companyId: string, data: CreateUserDTO) {
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) {
      throw new Error("Email already in use");
    }

    const passwordHash = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        companyId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        systemRole: data.systemRole ?? SystemRole.STAFF,
      },
    });
  }

  static async list(companyId: string, options?: { excludeValets?: boolean }) {
    return prisma.user.findMany({
      where: {
        companyId,
        ...(options?.excludeValets === true ? { valet: null } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(companyId: string, userId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });
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
