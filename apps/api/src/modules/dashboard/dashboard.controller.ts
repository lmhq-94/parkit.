import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { ok, fail } from "../../shared/utils/response";

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      // SUPER_ADMIN: use selected company from header so stats (and hasParkingWithBooking) are for that company
      const headerCompanyId =
        req.user?.role === "SUPER_ADMIN"
          ? (req.headers["x-company-id"] as string | undefined)
          : undefined;
      const companyId = headerCompanyId ?? req.user?.companyId ?? null;
      const rawDays = req.query.days;
      const rawFrom = req.query.from;
      const rawTo = req.query.to;
      const days = typeof rawDays === "string" && /^[0-9]+$/.test(rawDays)
        ? Math.min(90, Math.max(1, parseInt(rawDays, 10)))
        : 7;
      const from = typeof rawFrom === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawFrom) ? rawFrom : undefined;
      const to = typeof rawTo === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawTo) ? rawTo : undefined;
      const stats = await DashboardService.getStats(companyId, days, from, to);
      return ok(res, stats);
    } catch (error: unknown) {
      return fail(
        res,
        500,
        error instanceof Error ? error.message : "Failed to load dashboard stats"
      );
    }
  }
}
