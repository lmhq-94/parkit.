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
  requiresBooking?: boolean;
  geofenceRadius?: number;
}

export interface UpdateParkingDTO {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  type?: ParkingType;
  requiresBooking?: boolean;
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
  requiresBooking: boolean;
  createdAt: Date;
  updatedAt: Date;
}
