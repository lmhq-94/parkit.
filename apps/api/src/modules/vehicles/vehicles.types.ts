import type { Prisma } from "@prisma/client";

export interface CreateVehicleDTO {
  plate: string;
  brand: string;
  model: string;
  color?: string;
  year?: number;
  countryCode?: string;
  dimensions?: Prisma.InputJsonValue;
}

export interface UpdateVehicleDTO {
  plate?: string;
  countryCode?: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  dimensions?: Prisma.InputJsonValue;
}

export interface VehicleResponse {
  id: string;
  companyId: string;
  plate: string;
  brand: string;
  model: string;
  color?: string | null;
  year?: number;
  countryCode: string;
  createdAt: Date;
  updatedAt: Date;
}
