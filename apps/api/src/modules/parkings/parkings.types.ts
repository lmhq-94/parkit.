import type { ParkingType, SlotType } from "@prisma/client";

export interface CreateParkingSlotDTO {
  label: string;
  slotType?: SlotType;
}

export interface CreateParkingDTO {
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

export interface UpdateParkingDTO {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  type?: ParkingType;
  totalSlots?: number;
  freeBenefitMinutes?: number;
  pricePerExtraHour?: number;
}

export interface ParkingResponse {
  id: string;
  companyId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  type: string;
  totalSlots: number;
  freeBenefitMinutes: number;
  pricePerExtraHour?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
