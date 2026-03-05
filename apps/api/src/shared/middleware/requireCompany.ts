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

  // Already resolved (e.g. by requireAuth from User record)
  if (req.user.companyId) {
    return next();
  }

  const headerCompanyId = req.headers["x-company-id"] as string | undefined;

  // SUPER_ADMIN: must send x-company-id when acting in a company context
  if (req.user.role === "SUPER_ADMIN") {
    if (headerCompanyId) {
      req.user.companyId = headerCompanyId;
      return next();
    }
    if (req.user.companyId) {
      return next();
    }
    return res.status(400).json({
      message: "x-company-id header required for this operation when using super admin",
    });
  }

  if (headerCompanyId) {
    req.user.companyId = headerCompanyId;
    return next();
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      valet: true,
      client: true,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if (user.valet?.companyId) {
    req.user.companyId = user.valet.companyId;
    return next();
  }

  if (user.client?.companyId) {
    req.user.companyId = user.client.companyId;
    return next();
  }

  return res
    .status(403)
    .json({ message: "No company context available" });
}
