import { prisma } from "../../shared/prisma";
import type { Prisma } from "@prisma/client";
import { CreateCompanyDTO, UpdateCompanyDTO } from "./companies.types";

export class CompaniesService {
  static async create(data: CreateCompanyDTO) {
    const createInput: Prisma.CompanyCreateInput = {
      legalName: data.legalName,
      taxId: data.taxId,
      ...(data.commercialName && { commercialName: data.commercialName }),
      ...(data.countryCode && { countryCode: data.countryCode }),
      ...(data.currency && { currency: data.currency }),
      ...(data.timezone && { timezone: data.timezone }),
      ...(data.billingEmail && { billingEmail: data.billingEmail }),
      ...(data.contactPhone && { contactPhone: data.contactPhone }),
      ...(data.legalAddress && { legalAddress: data.legalAddress }),
      ...(data.brandingConfig && { brandingConfig: data.brandingConfig }),
    };
    
    return prisma.company.create({
      data: createInput,
    });
  }

  static async getById(id: string) {
    return prisma.company.findUnique({
      where: { id },
    });
  }

  static async update(id: string, data: UpdateCompanyDTO) {
    const updateInput: Prisma.CompanyUpdateInput = {};
    
    if (data.legalName !== undefined) updateInput.legalName = data.legalName;
    if (data.commercialName !== undefined) updateInput.commercialName = data.commercialName;
    if (data.billingEmail !== undefined) updateInput.billingEmail = data.billingEmail;
    if (data.contactPhone !== undefined) updateInput.contactPhone = data.contactPhone;
    if (data.legalAddress !== undefined) updateInput.legalAddress = data.legalAddress;
    if (data.brandingConfig !== undefined) updateInput.brandingConfig = data.brandingConfig;
    if (data.status !== undefined) updateInput.status = data.status;
    
    return prisma.company.update({
      where: { id },
      data: updateInput,
    });
  }

  static async list() {
    return prisma.company.findMany({
      orderBy: { createdAt: "desc" },
    });
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
