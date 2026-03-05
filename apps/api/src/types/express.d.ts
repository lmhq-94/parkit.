import { SystemRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        role: SystemRole;
        /** Set for all roles except SUPER_ADMIN without x-company-id */
        companyId?: string;
      };
    }
  }
}

export {};
