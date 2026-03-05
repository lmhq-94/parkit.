export interface CreateUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    systemRole?: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";
  }
  
  export interface UpdateUserDTO {
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive?: boolean;
    systemRole?: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";
  }
  