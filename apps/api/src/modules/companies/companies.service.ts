import { prisma } from "../../shared/prisma";
import type { CompanyStatus, Prisma } from "@prisma/client";
import { CreateCompanyDTO, UpdateCompanyDTO } from "./companies.types";
import { normalizeBrandingConfig, DEFAULT_BRANDING_CONFIG } from "./branding-defaults";

function withNormalizedBranding<T extends { brandingConfig?: unknown }>(company: T): T {
  if (!company) return company;
  return {
    ...company,
    brandingConfig: normalizeBrandingConfig(company.brandingConfig as Parameters<typeof normalizeBrandingConfig>[0]),
  };
}

export class CompaniesService {
  static async create(data: CreateCompanyDTO) {
    const createInput: Prisma.CompanyCreateInput = {
      legalName: data.legalName,
      taxId: data.taxId,
      ...(data.commercialName && { commercialName: data.commercialName }),
      ...(data.industry && { industry: data.industry }),
      ...(data.countryCode && { countryCode: data.countryCode }),
      ...(data.currency && { currency: data.currency }),
      ...(data.timezone && { timezone: data.timezone }),
      ...(data.email && { email: data.email }),
      ...(data.contactPhone && { contactPhone: data.contactPhone }),
      ...(data.legalAddress && { legalAddress: data.legalAddress }),
      ...(typeof data.requiresCustomerApp === "boolean" && {
        requiresCustomerApp: data.requiresCustomerApp,
      }),
      brandingConfig: (data.brandingConfig ?? DEFAULT_BRANDING_CONFIG) as Prisma.InputJsonValue,
    };
    
    const company = await prisma.company.create({
      data: createInput,
    });
    return withNormalizedBranding(company);
  }

  static async getById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
    });
    return company ? withNormalizedBranding(company) : null;
  }

  /** Solo branding (respuesta ligera para cargar rápido en login/cambio de empresa). */
  static async getBrandingById(id: string) {
    const row = await prisma.company.findUnique({
      where: { id },
      select: { brandingConfig: true, industry: true },
    });
    if (!row) return null;
    const brandingConfig = normalizeBrandingConfig(
      row.brandingConfig as Parameters<typeof normalizeBrandingConfig>[0]
    );
    // Include industry as businessActivity for frontend icon selection
    return { brandingConfig: { ...brandingConfig, businessActivity: row.industry } };
  }

  static async update(id: string, data: UpdateCompanyDTO) {
    const updateInput: Prisma.CompanyUpdateInput = {};
    if (data.legalName !== undefined) updateInput.legalName = data.legalName;
    if (data.taxId !== undefined) updateInput.taxId = data.taxId;
    if (data.commercialName !== undefined) updateInput.commercialName = data.commercialName;
    if (data.industry !== undefined) updateInput.industry = data.industry;
    if (data.countryCode !== undefined) updateInput.countryCode = data.countryCode;
    if (data.currency !== undefined) updateInput.currency = data.currency;
    if (data.timezone !== undefined) updateInput.timezone = data.timezone;
    if (data.email !== undefined) updateInput.email = data.email;
    if (data.contactPhone !== undefined) updateInput.contactPhone = data.contactPhone;
    if (data.legalAddress !== undefined) updateInput.legalAddress = data.legalAddress;
    // brandingConfig se persiste completo (incl. logoImageUrl y bannerImageUrl en base64)
    if (data.brandingConfig !== undefined) {
      updateInput.brandingConfig = data.brandingConfig as Prisma.InputJsonValue;
    }
    if (data.requiresCustomerApp !== undefined) {
      updateInput.requiresCustomerApp = data.requiresCustomerApp;
    }
    if (data.status !== undefined) updateInput.status = data.status;
    const company = await prisma.company.update({
      where: { id },
      data: updateInput,
    });
    return withNormalizedBranding(company);
  }

  static async list(statuses?: string[]) {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        legalName: true,
        commercialName: true,
        taxId: true,
        industry: true,
        countryCode: true,
        currency: true,
        timezone: true,
        email: true,
        contactPhone: true,
        legalAddress: true,
        brandingConfig: true,
        requiresCustomerApp: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        status: statuses?.length ? { in: statuses as CompanyStatus[] } : undefined,
      },
      orderBy: { createdAt: "desc" },
    });
    return companies.map((c) => withNormalizedBranding(c));
  }

  static async delete(id: string) {
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return null;
    const [userCount, parkingCount, clientCount] = await Promise.all([
      prisma.user.count({ where: { companyId: id } }),
      prisma.parking.count({ where: { companyId: id } }),
      prisma.client.count({ where: { companyId: id } }),
    ]);
    if (userCount > 0 || parkingCount > 0 || clientCount > 0) {
      throw new Error("No se puede eliminar una empresa con usuarios, estacionamientos o clientes asociados.");
    }
    await prisma.company.delete({ where: { id } });
    return company;
  }
}
