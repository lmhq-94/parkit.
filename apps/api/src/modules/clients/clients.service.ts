import { prisma } from "../../shared/prisma";

interface CreateClientDTO {
  userId: string;
  governmentId: string;
  emergencyPhone?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface UpdateClientDTO {
  governmentId?: string;
  emergencyPhone?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface AddVehicleDTO {
  vehicleId: string;
  isPrimary?: boolean;
}

export class ClientsService {
  static async create(companyId: string, data: CreateClientDTO) {
    const existingClient = await prisma.client.findFirst({
      where: { governmentId: data.governmentId },
    });

    if (existingClient) {
      throw new Error("Client with this government ID already exists");
    }

    return prisma.client.create({
      data: {
        companyId,
        userId: data.userId,
        governmentId: data.governmentId,
        emergencyPhone: data.emergencyPhone || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        vehicles: {
          include: {
            vehicle: {
              select: {
                id: true,
                plate: true,
                brand: true,
                model: true,
              },
            },
          },
        },
      },
    });
  }

  static async list(companyId: string) {
    return prisma.client.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        vehicles: {
          include: {
            vehicle: {
              select: {
                plate: true,
                brand: true,
                model: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(companyId: string, clientId: string) {
    return prisma.client.findFirst({
      where: { id: clientId, companyId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        vehicles: {
          include: {
            vehicle: {
              select: {
                id: true,
                plate: true,
                brand: true,
                model: true,
                year: true,
              },
            },
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            scheduledEntryTime: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  }

  static async update(
    companyId: string,
    clientId: string,
    data: UpdateClientDTO
  ) {
    return prisma.client.update({
      where: { id: clientId },
      data: {
        governmentId: data.governmentId,
        emergencyPhone: data.emergencyPhone || undefined,
      },
      include: {
        user: true,
        vehicles: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  static async getVehicles(companyId: string, clientId: string) {
    return prisma.clientVehicle.findMany({
      where: {
        client: { id: clientId, companyId },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
          },
        },
      },
    });
  }

  static async addVehicle(
    companyId: string,
    clientId: string,
    data: AddVehicleDTO
  ) {
    const clientExists = await prisma.client.findFirst({
      where: { id: clientId, companyId },
    });

    if (!clientExists) {
      throw new Error("Client not found");
    }

    if (data.isPrimary) {
      await prisma.clientVehicle.updateMany({
        where: { clientId },
        data: { isPrimary: false },
      });
    }

    return prisma.clientVehicle.create({
      data: {
        clientId,
        vehicleId: data.vehicleId,
        isPrimary: data.isPrimary || false,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
          },
        },
      },
    });
  }

  /**
   * Find or create a Client for the given user in the company, then add the vehicle.
   * Used when assigning a vehicle to a customer (User CUSTOMER) who may not have a Client record yet.
   */
  static async addVehicleByUserId(
    companyId: string,
    userId: string,
    data: AddVehicleDTO
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.systemRole !== "CUSTOMER") {
      throw new Error("User is not a customer");
    }
    if (user.companyId !== companyId) {
      throw new Error("User does not belong to this company");
    }

    let client = await prisma.client.findFirst({
      where: { userId, companyId },
    });
    if (!client) {
      client = await prisma.client.create({
        data: {
          companyId,
          userId,
          governmentId: `PENDING-${userId}`,
        },
      });
    }

    return this.addVehicle(companyId, client.id, data);
  }
}
