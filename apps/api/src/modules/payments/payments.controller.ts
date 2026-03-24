import { Request, Response } from "express";
import { created, fail } from "../../shared/utils/response";
import { PaymentsService } from "./payments.service";

export class PaymentsController {
  static async createCardVerificationSession(req: Request, res: Response) {
    try {
      const body = req.body as { locale?: unknown };
      const locale =
        typeof body.locale === "string" && (body.locale === "es" || body.locale === "en")
          ? body.locale
          : undefined;
      const result = await PaymentsService.createCardVerificationSession({
        userId: req.user.userId,
        companyId: req.user.companyId,
        locale,
      });
      return created(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
