import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { ok, fail } from "../../shared/utils/response";

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId ?? null;
      const stats = await DashboardService.getStats(companyId);
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
