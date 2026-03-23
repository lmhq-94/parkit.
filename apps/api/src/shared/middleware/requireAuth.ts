import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SystemRole } from "@prisma/client";
import { prisma } from "../prisma";

interface JwtPayload {
  userId: string;
  role: SystemRole;
  companyId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid Authorization format" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        isActive: true,
        companyId: true,
        systemRole: true,
        valet: { select: { companyId: true } },
      },
    });

    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }
    if (dbUser.isActive === false) {
      return res.status(401).json({ message: "USER_INACTIVE" });
    }

    let companyId: string | undefined = payload.companyId;
    if (!companyId) {
      if (dbUser.companyId) {
        companyId = dbUser.companyId;
      } else if (dbUser.valet?.companyId) {
        companyId = dbUser.valet.companyId ?? undefined;
      }
      // SUPER_ADMIN and valets without a company (companyId null) can use x-company-id in requireCompany
      if (!companyId && dbUser.systemRole !== "SUPER_ADMIN" && !dbUser.valet) {
        return res.status(401).json({ message: "Unable to resolve company context" });
      }
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
      companyId: companyId ?? undefined,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
