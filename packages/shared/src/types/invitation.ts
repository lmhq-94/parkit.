import { SystemRole, ValetStaffRole } from "./user";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "CANCELLED" | "EXPIRED";

export interface Invitation {
  id: string;
  email: string;
  companyId: string;
  role: SystemRole;
  // Optional fields for valets
  valetStaffRole?: ValetStaffRole;
  licenseNumber?: string;
  licenseExpiry?: string | Date;
  token: string;
  status: InvitationStatus;
  invitedByUserId: string;
  expiresAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}
