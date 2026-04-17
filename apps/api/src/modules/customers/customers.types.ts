import type { Prisma } from "@prisma/client";

export interface CreateCustomerDTO {
  userId: string;
  governmentId: string;
  emergencyPhone?: Prisma.InputJsonValue;
}

export interface UpdateCustomerDTO {
  governmentId?: string;
  emergencyPhone?: Prisma.InputJsonValue;
}

export interface CustomerResponse {
  id: string;
  userId: string;
  governmentId: string;
  companyId: string;
  emergencyPhone?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}
