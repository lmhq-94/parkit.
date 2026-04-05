import type { ValetStaffRole } from "@parkit/shared";

/**
 * Valid staff roles for valet personnel
 */
export const STAFF_ROLES: ValetStaffRole[] = ["RECEPTIONIST", "DRIVER"];

/**
 * Type derived from STAFF_ROLES array
 */
export type StaffRole = (typeof STAFF_ROLES)[number];
