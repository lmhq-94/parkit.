export interface VehicleOwnerRow {
  client: {
    id: string;
    user: {
      id?: string;
      firstName: string;
      lastName: string;
      email?: string | null;
      phone?: string | null;
    };
  };
}

export interface VehicleLookup {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color?: string | null;
  year?: number | null;
  countryCode: string;
  companyId: string;
  owners: VehicleOwnerRow[];
}

export interface CatalogMake {
  id: number;
  name: string;
}

export interface CatalogModel {
  id: number;
  name: string;
}

export interface VehicleDimensions {
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  weightKg?: number;
}

export interface ParkingOpt {
  id: string;
  name: string;
  address: string;
  companyId: string;
}

export interface ValetOpt {
  id: string;
  staffRole?: string | null;
  currentStatus?: "AVAILABLE" | "BUSY" | "AWAY" | null;
  user: {
    firstName: string;
    lastName: string;
    email?: string | null;
    avatarUrl?: string | null;
  };
}

export interface BookingLookup {
  id: string;
  status: string;
  clientId: string;
  vehicleId: string;
  parkingId: string;
  client?: {
    id: string;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phone?: string | null;
    };
  };
  vehicle?: {
    id: string;
    plate?: string | null;
    brand?: string | null;
    model?: string | null;
    color?: string | null;
    year?: number | null;
  };
  parking?: {
    id: string;
    name?: string | null;
    address?: string | null;
    freeBenefitMinutes?: number | null;
  };
}

export interface ClientByIdLookup {
  id: string;
  user?: { email?: string | null; phone?: string | null };
}

export interface LoadedDriverSnapshot {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface LoadedVehicleSnapshot {
  brand: string;
  model: string;
  color: string;
  year: string;
}

export type DisplayedParking = {
  parking: ParkingOpt & { company?: { commercialName?: string | null; legalName?: string | null } };
  distanceKm: number | null;
  isManual: boolean;
};

export type ValetDispatchRowVariant = {
  variant: 'available' | 'busy';
} & ValetOpt;
