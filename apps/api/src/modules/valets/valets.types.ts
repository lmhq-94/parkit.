export interface CreateValetDTO {
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  currentParkingId?: string;
}

export interface UpdateValetDTO {
  licenseNumber?: string;
  licenseExpiry?: string;
  currentParkingId?: string;
  /** null para limpiar; omitir para no tocar */
  ratingAvg?: number | null;
}

export interface ValetResponse {
  id: string;
  companyId: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  currentStatus: string;
  staffRole: "RECEPTIONIST" | "DRIVER" | null;
  ratingAvg: number | null;
  createdAt: Date;
  updatedAt: Date;
}
