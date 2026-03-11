import type { Prisma } from "@prisma/client";

export interface CreateCompanyDTO {
  legalName: string;
  commercialName?: string;
  taxId: string;
  industry?: string;
  countryCode?: string;
  currency?: string;
  timezone?: string;
  email?: string;
  contactPhone?: string;
  legalAddress?: string;
  brandingConfig?: Prisma.InputJsonValue;
}

export interface UpdateCompanyDTO {
  legalName?: string;
  taxId?: string;
  commercialName?: string;
  industry?: string;
  countryCode?: string;
  currency?: string;
  timezone?: string;
  email?: string;
  contactPhone?: string;
  legalAddress?: string;
  brandingConfig?: Prisma.InputJsonValue;
  status?: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
}
