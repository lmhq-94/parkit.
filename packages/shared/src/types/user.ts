export type SystemRole = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";

/** Sub-rol del perfil valet (app móvil valet). */
export type ValetStaffRole = "RECEPTIONIST" | "DRIVER";

/** Estado operativo del valet (API / valets/me). */
export type ValetOperationalStatus = "AVAILABLE" | "BUSY" | "AWAY";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  systemRole: SystemRole;
  /**
   * En la mayoría de los casos el usuario pertenece a una empresa.
   * En algunos contextos (por ejemplo SUPER_ADMIN) puede ser opcional.
   */
  companyId?: string;
  /** Si el usuario tiene perfil valet (STAFF en app valet). */
  valetStaffRole?: ValetStaffRole | null;
  /** Sincronizado desde GET /valets/me cuando aplica. */
  valetCurrentStatus?: ValetOperationalStatus | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

