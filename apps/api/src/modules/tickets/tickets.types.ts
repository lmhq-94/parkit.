export interface CreateTicketDTO {
  bookingId?: string;
  parkingId: string;
  vehicleId: string;
  clientId: string;
  slotId?: string;
  receptorValetId: string;
  driverValetId?: string;
  delivererValetId?: string;
  /** Manual codes from valet app; if both omitted, server allocates unique codes. */
  keyCode?: string;
  ticketCode?: string;
  /**
   * Estado del vehículo al ingreso (fotos en data URL o URL pública + nota opcional).
   * Si no hay fotos ni descripción, no se crea fila DamageReport.
   */
  intakeDamageReport?: {
    description?: string;
    photos?: Array<{
      url: string;
      label?: string;
    }>;
  };
}

export interface UpdateTicketDTO {
  status?: string;
  slotId?: string;
}

export interface AssignValetDTO {
  valetId: string;
}

export interface ReportDamageDTO {
  valetId: string;
  description: string;
  photos?: Array<{
    url: string;
    label?: string;
  }>;
}

export interface AddReviewDTO {
  stars: number;
  comment?: string;
}

export interface TicketResponse {
  id: string;
  companyId: string;
  parkingId: string;
  vehicleId: string;
  clientId: string;
  status: string;
  entryTime: Date;
  exitTime?: Date;
  createdAt: Date;
}
