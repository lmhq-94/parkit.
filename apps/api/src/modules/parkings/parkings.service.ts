import { prisma } from "../../shared/prisma";
import type { ParkingType, SlotType } from "@prisma/client";

interface CreateParkingSlotDTO {
  label: string;
  slotType?: SlotType;
}

interface CreateParkingDTO {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  type?: ParkingType;
  slots: CreateParkingSlotDTO[];
  requiresBooking?: boolean;
  geofenceRadius?: number;
}

interface UpdateParkingDTO {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  type?: ParkingType;
  totalSlots?: number;
  requiresBooking?: boolean;
}

export class ParkingsService {
  static async create(companyId: string, data: CreateParkingDTO) {
    const slots = data.slots ?? [];
    const totalSlots = slots.length;
    return prisma.$transaction(async (tx) => {
      const parking = await tx.parking.create({
        data: {
          companyId,
          name: data.name,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          geofenceRadius: data.geofenceRadius,
          type: data.type || "OPEN",
          totalSlots,
          requiresBooking: data.requiresBooking || false,
        },
      });
      if (slots.length > 0) {
        await tx.parkingSlot.createMany({
          data: slots.map((s) => ({
            parkingId: parking.id,
            label: s.label.trim(),
            slotType: s.slotType || "REGULAR",
          })),
        });
      }
      return tx.parking.findUniqueOrThrow({
        where: { id: parking.id },
        include: { slots: true },
      });
    });
  }

  /** True si la empresa tiene al menos un estacionamiento con requiresBooking. */
  static async hasAnyRequiringBooking(companyId: string): Promise<boolean> {
    const count = await prisma.parking.count({
      where: { companyId, requiresBooking: true },
    });
    return count > 0;
  }

  static async list(companyId: string) {
    return prisma.parking.findMany({
      where: { companyId },
      include: {
        slots: {
          select: {
            id: true,
            label: true,
            isAvailable: true,
            slotType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(companyId: string, parkingId: string) {
    return prisma.parking.findFirst({
      where: { id: parkingId, companyId },
      include: {
        slots: true,
        tickets: {
          where: { exitTime: null },
          select: {
            id: true,
            vehicle: {
              select: {
                plate: true,
                brand: true,
                model: true,
              },
            },
            slot: {
              select: {
                label: true,
              },
            },
          },
        },
      },
    });
  }

  static async update(
    companyId: string,
    parkingId: string,
    data: UpdateParkingDTO
  ) {
    return prisma.parking.update({
      where: { id: parkingId },
      data: {
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.totalSlots !== undefined ? { totalSlots: data.totalSlots } : {}),
        requiresBooking: data.requiresBooking,
      },
      include: {
        slots: true,
      },
    });
  }

  static async getSlots(companyId: string, parkingId: string) {
    return prisma.parkingSlot.findMany({
      where: {
        parking: { id: parkingId, companyId },
      },
      include: {
        tickets: {
          where: { exitTime: null },
          select: {
            id: true,
            vehicle: {
              select: {
                plate: true,
              },
            },
          },
        },
      },
      orderBy: { label: "asc" },
    });
  }

  static async getAvailableSlots(companyId: string, parkingId: string) {
    return prisma.parkingSlot.findMany({
      where: {
        parking: { id: parkingId, companyId },
        isAvailable: true,
      },
      orderBy: { label: "asc" },
    });
  }

  static async delete(companyId: string, parkingId: string) {
    const parking = await prisma.parking.findFirst({
      where: { id: parkingId, companyId },
    });
    if (!parking) return null;
    const [ticketCount, bookingCount] = await Promise.all([
      prisma.ticket.count({ where: { parkingId } }),
      prisma.booking.count({ where: { parkingId } }),
    ]);
    if (ticketCount > 0 || bookingCount > 0) {
      throw new Error("No se puede eliminar un estacionamiento con tickets o reservas asociados.");
    }
    await prisma.parkingSlot.deleteMany({ where: { parkingId } });
    await prisma.parking.delete({ where: { id: parkingId } });
    return parking;
  }

  static async createSlots(
    parkingId: string,
    slots: Array<{ label: string; slotType?: SlotType }>
  ) {
    if (slots.length === 0) return [];

    const createdSlots = await prisma.$transaction(async (tx) => {
      const created: typeof prisma.parkingSlot[] = [];
      for (const slot of slots) {
        const s = await tx.parkingSlot.create({
          data: {
            parkingId,
            label: slot.label,
            slotType: slot.slotType || "REGULAR",
          },
        });
        created.push(s);
      }
      await tx.parking.update({
        where: { id: parkingId },
        data: {
          totalSlots: {
            increment: created.length,
          },
        },
      });
      return created;
    });

    return createdSlots;
  }
}
