export type SystemRole = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";

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
}

