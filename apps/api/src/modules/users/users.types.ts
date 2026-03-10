export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  /** If omitted, user is created as "invited" and an email is sent to set password via link */
  password?: string;
  systemRole?: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";
}
  
  export interface UpdateUserDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    systemRole?: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";
    avatarUrl?: string;
  }
  