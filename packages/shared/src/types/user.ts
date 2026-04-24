export type SystemRole = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";

/** Valet profile sub-role (valet mobile app). */
export type ValetStaffRole = "RECEPTIONIST" | "DRIVER";

/** Valet operational status (API / valets/me). */
export type ValetOperationalStatus = "AVAILABLE" | "BUSY" | "AWAY";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  systemRole: SystemRole;
  /**
   * In most cases the user belongs to a company.
   * In some contexts (e.g. SUPER_ADMIN) it can be optional.
   */
  companyId?: string;
  /** If the user has a valet profile (STAFF in valet app). */
  valetStaffRole?: ValetStaffRole | null;
  /** Synchronized from GET /valets/me when applicable. */
  valetCurrentStatus?: ValetOperationalStatus | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

