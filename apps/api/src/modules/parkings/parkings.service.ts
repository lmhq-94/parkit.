import { prisma } from "../../shared/prisma";
import type { ParkingSlot, ParkingType, SlotType } from "@prisma/client";

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
  geofenceRadius?: number;
  freeBenefitMinutes?: number;
  pricePerExtraHour?: number;
}

interface UpdateParkingDTO {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  type?: ParkingType;
  totalSlots?: number;
  freeBenefitMinutes?: number;
  pricePerExtraHour?: number;
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
          freeBenefitMinutes: data.freeBenefitMinutes ?? 0,
          pricePerExtraHour: data.pricePerExtraHour != null ? data.pricePerExtraHour : undefined,
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

  static async list(companyId: string) {
    return prisma.parking.findMany({
      where: { companyId },
      include: {
        company: { select: { currency: true } },
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

  /**
   * Todos los parqueos con coordenadas (p. ej. app valet rotativa entre empresas).
   * Sin filtro por empresa.
   */
  static async listAllWithCoordinates() {
    return prisma.parking.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        companyId: true,
        company: {
          select: {
            commercialName: true,
            legalName: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async getById(companyId: string, parkingId: string) {
    return prisma.parking.findFirst({
      where: { id: parkingId, companyId },
      include: {
        company: { select: { currency: true } },
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
        ...(data.freeBenefitMinutes !== undefined ? { freeBenefitMinutes: data.freeBenefitMinutes } : {}),
        ...(data.pricePerExtraHour !== undefined ? { pricePerExtraHour: data.pricePerExtraHour } : {}),
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

  static async updateSlotAvailability(
    companyId: string,
    slotId: string,
    isAvailable: boolean
  ) {
    const slot = await prisma.parkingSlot.findFirst({
      where: { id: slotId, parking: { companyId } },
      select: { id: true },
    });
    if (!slot) {
      throw new Error("Slot not found");
    }
    return prisma.parkingSlot.update({
      where: { id: slotId },
      data: { isAvailable },
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
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get existing slots
      const existing = await tx.parkingSlot.findMany({
        where: { parkingId },
        select: { label: true },
      });
      const inputLabels = new Set(slots.map((s) => s.label.trim()));

      // 2. Delete slots not in input (synchronization)
      // Only delete if the slot is not currently occupied by an active ticket
      const toDelete = existing.filter((s) => !inputLabels.has(s.label));
      for (const slot of toDelete) {
        const inUse = await tx.ticket.count({
          where: { 
            slot: { parkingId, label: slot.label }, 
            exitTime: null 
          },
        });
        if (inUse === 0) {
          await tx.parkingSlot.delete({
            where: { parkingId_label: { parkingId, label: slot.label } },
          }).catch(() => {
            // If deletion fails due to other constraints, we skip it silently
          });
        }
      }

      // 3. Upsert input slots
      const createdOrUpdated: ParkingSlot[] = [];
      for (const slot of slots) {
        const label = slot.label.trim();
        if (!label) continue;

        const s = await tx.parkingSlot.upsert({
          where: { parkingId_label: { parkingId, label } },
          update: {
            slotType: slot.slotType || "REGULAR",
          },
          create: {
            parkingId,
            label,
            slotType: slot.slotType || "REGULAR",
          },
        });
        createdOrUpdated.push(s);
      }

      // 4. Update the totalSlots count in the main Parking record
      const finalCount = await tx.parkingSlot.count({ where: { parkingId } });
      await tx.parking.update({
        where: { id: parkingId },
        data: { totalSlots: finalCount },
      });

      return createdOrUpdated;
    });

    return result;
  }
}
