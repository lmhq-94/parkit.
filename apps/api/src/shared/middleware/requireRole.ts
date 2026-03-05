import { Request, Response, NextFunction } from "express";

type SystemRole = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";

// Middleware factory: returns middleware that enforces role-based access control.
// - If user is SUPER_ADMIN and "SUPER_ADMIN" is in allowedRoles → allow (super-admin-only route).
// - If user is SUPER_ADMIN and "SUPER_ADMIN" is not in allowedRoles → allow (SUPER_ADMIN can do everything).
// - Otherwise, user role must be in allowedRoles.
export const requireRole =
  (...allowedRoles: SystemRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (role === "SUPER_ADMIN") {
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    next();
  };
