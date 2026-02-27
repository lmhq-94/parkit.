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

    let companyId = payload.companyId;
    if (!companyId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        return res.status(401).json({ message: "Unable to resolve company context" });
      }
      companyId = user.companyId;
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
      companyId,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
