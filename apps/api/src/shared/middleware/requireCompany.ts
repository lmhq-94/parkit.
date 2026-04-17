import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";

export async function requireCompany(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Already resolved by requireAuth (e.g. from User record for ADMIN/STAFF)
  if (req.user.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
    });
    if (!company) {
      return res.status(403).json({
        message: "Company not found. Your account may be linked to a company that no longer exists.",
      });
    }
    return next();
  }

  const headerCompanyId = req.headers["x-company-id"] as string | undefined;

  // SUPER_ADMIN or valet without a company: can send x-company-id to act in a company
  const canUseHeaderCompany =
    req.user.role === "SUPER_ADMIN" || (req.user.role === "STAFF" && !req.user.companyId);
  if (canUseHeaderCompany) {
    if (headerCompanyId) {
      const company = await prisma.company.findUnique({
        where: { id: headerCompanyId },
      });
      if (!company) {
        return res.status(400).json({
          message: "Invalid x-company-id: company not found",
        });
      }
      req.user.companyId = headerCompanyId;
      return next();
    }
    if (req.user.companyId) {
      return next();
    }
    return res.status(400).json({
      message: "x-company-id header required for this operation",
    });
  }

  if (headerCompanyId) {
    const company = await prisma.company.findUnique({
      where: { id: headerCompanyId },
    });
    if (!company) {
      return res.status(400).json({
        message: "Invalid x-company-id: company not found",
      });
    }
    req.user.companyId = headerCompanyId;
    return next();
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      valet: true,
      customer: true,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if (user.valet?.companyId) {
    req.user.companyId = user.valet.companyId;
    return next();
  }

  if (user.customer?.companyId) {
    req.user.companyId = user.customer.companyId;
    return next();
  }

  return res
    .status(403)
    .json({ message: "No company context available" });
}
