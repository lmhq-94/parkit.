import { prisma } from "../../shared/prisma";
import { BookingStatus } from "@prisma/client";

interface CreateBookingDTO {
  clientId: string;
  vehicleId: string;
  parkingId: string;
  scheduledEntryTime: string;
  scheduledExitTime?: string;
}

interface UpdateBookingDTO {
  status?: BookingStatus;
  scheduledEntryTime?: string;
  scheduledExitTime?: string;
  clientId?: string;
  vehicleId?: string;
  parkingId?: string;
}

interface BookingFilters {
  statuses?: string[];
  clientId?: string;
}

const bookingInclude = {
  customer: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
  vehicle: {
    select: {
      id: true,
      plate: true,
      brand: true,
      model: true,
    },
  },
  parking: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
} as const;

export class BookingsService {
  static async create(companyId: string, data: CreateBookingDTO) {
    const created = await prisma.booking.create({
      data: {
        companyId,
        clientId: data.clientId,
        vehicleId: data.vehicleId,
        parkingId: data.parkingId,
        scheduledEntryTime: new Date(data.scheduledEntryTime),
        scheduledExitTime: data.scheduledExitTime
          ? new Date(data.scheduledExitTime)
          : null,
      },
      include: bookingInclude,
    });
    await prisma.booking.update({
      where: { id: created.id },
      data: { qrCodeReference: created.id },
    });
    return { ...created, qrCodeReference: created.id };
  }

  static async list(companyId: string, filters: BookingFilters) {
    return prisma.booking.findMany({
      where: {
        companyId,
        status: filters.statuses?.length
          ? { in: filters.statuses as BookingStatus[] }
          : undefined,
        clientId: filters.clientId,
      },
      include: {
        customer: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        vehicle: {
          select: {
            plate: true,
            brand: true,
            model: true,
          },
        },
        parking: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(companyId: string, bookingId: string) {
    return prisma.booking.findFirst({
      where: { id: bookingId, companyId },
      include: {
        customer: {
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
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
          },
        },
        parking: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            dailyPricingConfig: true,
          },
        },
        ticket: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
  }

  static async update(
    companyId: string,
    bookingId: string,
    data: UpdateBookingDTO
  ) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: data.status,
        scheduledEntryTime: data.scheduledEntryTime
          ? new Date(data.scheduledEntryTime)
          : undefined,
        scheduledExitTime: data.scheduledExitTime
          ? new Date(data.scheduledExitTime)
          : undefined,
        clientId: data.clientId,
        vehicleId: data.vehicleId,
        parkingId: data.parkingId,
      },
      include: {
        customer: true,
        vehicle: true,
        parking: true,
      },
    });
  }

  static async cancel(companyId: string, bookingId: string) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
      },
      include: {
        customer: true,
        vehicle: true,
      },
    });
  }
}
