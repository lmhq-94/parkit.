import { prisma } from "../../shared/prisma";

interface CreateCustomerDTO {
  userId: string;
  governmentId: string;
  emergencyPhone?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface UpdateCustomerDTO {
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

export class CustomersService {
  static async create(companyId: string, data: CreateCustomerDTO) {
    const existingCustomer = await prisma.customer.findFirst({
      where: { governmentId: data.governmentId },
    });

    if (existingCustomer) {
      throw new Error("Customer with this government ID already exists");
    }

    return prisma.customer.create({
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
    return prisma.customer.findMany({
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

  static async getById(companyId: string, customerId: string) {
    return prisma.customer.findFirst({
      where: { id: customerId, companyId },
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
    customerId: string,
    data: UpdateCustomerDTO
  ) {
    return prisma.customer.update({
      where: { id: customerId },
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

  static async getVehicles(companyId: string, customerId: string) {
    return prisma.customerVehicle.findMany({
      where: {
        customer: { id: customerId, companyId },
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
    customerId: string,
    data: AddVehicleDTO
  ) {
    const customerExists = await prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });

    if (!customerExists) {
      throw new Error("Customer not found");
    }

    if (data.isPrimary) {
      await prisma.customerVehicle.updateMany({
        where: { customerId },
        data: { isPrimary: false },
      });
    }

    const customerVehicle = await prisma.customerVehicle.create({
      data: {
        customerId,
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
        customer: {
          select: {
            id: true,
          },
        },
      },
    });

    return { ...customerVehicle, clientId: customerVehicle.customerId };
  }

  /**
   * Find or create a Customer for the given user in the company, then add the vehicle.
   * Used when assigning a vehicle to a customer (User CUSTOMER) who may not have a Customer record yet.
   */
  static async addVehicleByUserId(
    companyId: string,
    userId: string,
    data: AddVehicleDTO
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true },
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

    let customer = await prisma.customer.findFirst({
      where: { userId, companyId },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          companyId,
          userId,
          governmentId: `PENDING-${userId}`,
        },
      });
    }

    return this.addVehicle(companyId, customer.id, data);
  }
}
