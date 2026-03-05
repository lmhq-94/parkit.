import { Request, Response } from "express";
import { BookingsService } from "./bookings.service";
import { parseQueryParam } from "../../shared/utils/queryParser";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class BookingsController {
  static async create(req: Request, res: Response) {
    try {
      const booking = await BookingsService.create(
        req.user.companyId!,
        req.body
      );

      return created(res, booking);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const statusStr = parseQueryParam(req.query.status as string | string[] | undefined);
      const clientIdStr = parseQueryParam(req.query.clientId as string | string[] | undefined);

      const bookings = await BookingsService.list(
        req.user.companyId!,
        {
          status: statusStr,
          clientId: clientIdStr,
        }
      );

      return ok(res, bookings);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const booking = await BookingsService.getById(
        req.user.companyId!,
        id
      );

      if (!booking) {
        return notFound(res, "Booking not found");
      }

      return ok(res, booking);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const booking = await BookingsService.update(
        req.user.companyId!,
        id,
        req.body
      );

      return ok(res, booking);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const booking = await BookingsService.cancel(
        req.user.companyId!,
        id
      );

      return ok(res, booking);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
