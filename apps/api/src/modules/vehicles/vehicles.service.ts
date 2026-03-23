import { prisma } from "../../shared/prisma";
import type { Prisma } from "@prisma/client";

interface CreateVehicleDTO {
  plate: string;
  brand: string;
  model: string;
  year?: number;
  countryCode?: string;
  dimensions?: Prisma.InputJsonValue;
}

interface UpdateVehicleDTO {
  plate?: string;
  countryCode?: string;
  brand?: string;
  model?: string;
  year?: number;
  dimensions?: Prisma.InputJsonValue;
}

export class VehiclesService {
  static async create(companyId: string, data: CreateVehicleDTO) {
    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        plate_countryCode: {
          plate: data.plate,
          countryCode: data.countryCode || "CR",
        },
      },
    });

    if (existingVehicle) {
      throw new Error("Vehicle with this plate already exists");
    }

    return prisma.vehicle.create({
      data: {
        companyId,
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        countryCode: data.countryCode || "CR",
        ...(data.dimensions ? { dimensions: data.dimensions } : {}),
      },
    });
  }

  static async list(companyId: string) {
    return prisma.vehicle.findMany({
      where: { companyId },
      include: {
        owners: {
          include: {
            client: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(companyId: string, vehicleId: string) {
    return prisma.vehicle.findFirst({
      where: { id: vehicleId, companyId },
      include: {
        owners: {
          include: {
            client: {
              select: {
                id: true,
                userId: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        tickets: {
          select: {
            id: true,
            status: true,
            entryTime: true,
            exitTime: true,
          },
          orderBy: { entryTime: "desc" },
          take: 10,
        },
      },
    });
  }

  static async update(
    companyId: string,
    vehicleId: string,
    data: UpdateVehicleDTO
  ) {
    const current = await prisma.vehicle.findFirst({
      where: { id: vehicleId, companyId },
      select: { countryCode: true },
    });
    if (!current) return null;

    if (data.plate != null && data.plate.trim() !== "") {
      const countryCodeToCheck =
        data.countryCode !== undefined ? data.countryCode.trim() || "CR" : current.countryCode;
      const existing = await prisma.vehicle.findFirst({
        where: {
          plate: data.plate.trim(),
          countryCode: countryCodeToCheck,
          id: { not: vehicleId },
        },
      });
      if (existing) throw new Error("Vehicle with this plate already exists");
    }
    return prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...(data.plate != null && data.plate.trim() !== "" && { plate: data.plate.trim() }),
        ...(data.countryCode !== undefined && { countryCode: data.countryCode.trim() || "CR" }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.dimensions !== undefined ? { dimensions: data.dimensions } : {}),
      },
      include: {
        owners: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  static async delete(companyId: string, vehicleId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, companyId },
    });
    if (!vehicle) return null;
    const [ticketCount, bookingCount] = await Promise.all([
      prisma.ticket.count({ where: { vehicleId } }),
      prisma.booking.count({ where: { vehicleId } }),
    ]);
    if (ticketCount > 0 || bookingCount > 0) {
      throw new Error("No se puede eliminar un vehículo con tickets o reservas asociados.");
    }
    await prisma.vehicle.delete({ where: { id: vehicleId } });
    return vehicle;
  }

  static async getByPlate(
    companyId: string,
    plate: string,
    countryCode: string = "CR"
  ) {
    return prisma.vehicle.findFirst({
      where: {
        plate,
        countryCode,
        companyId,
      },
      include: {
        owners: {
          include: {
            client: {
              select: {
                id: true,
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
            },
          },
        },
      },
    });
  }

  /** Búsqueda global por placa+país (único en BD). Valets rotativos entre empresas. */
  static async getByPlateGlobal(plate: string, countryCode: string = "CR") {
    return prisma.vehicle.findUnique({
      where: {
        plate_countryCode: {
          plate,
          countryCode: countryCode || "CR",
        },
      },
      include: {
        owners: {
          include: {
            client: {
              select: {
                id: true,
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
            },
          },
        },
      },
    });
  }
}
