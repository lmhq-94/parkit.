import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { ok, fail } from "../../shared/utils/response";

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId ?? null;
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
