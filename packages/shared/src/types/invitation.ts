import { SystemRole } from "./user";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED";

export interface Invitation {
  id: string;
  email: string;
  companyId: string;
  role: SystemRole;
  token: string;
  status: InvitationStatus;
  invitedByUserId: string;
  expiresAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}
