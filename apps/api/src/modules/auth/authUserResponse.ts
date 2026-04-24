import type { SystemRole, ValetStaffRole } from "@prisma/client";

/** User payload exposed to client (without secrets). */
export type AuthUserResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  systemRole: SystemRole;
  companyId?: string;
  phone?: string;
  avatarUrl?: string;
  /** Only valets (STAFF with valet profile). */
  valetStaffRole: ValetStaffRole | null;
};

export function toAuthUserResponse(
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    systemRole: SystemRole;
    companyId: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  },
  valetStaffRole: ValetStaffRole | null | undefined
): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    systemRole: user.systemRole,
    companyId: user.companyId ?? undefined,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    valetStaffRole: valetStaffRole ?? null,
  };
}
