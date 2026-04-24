import { Request, Response } from "express";
import { TicketsService } from "./tickets.service";
import { parseQueryParam, parseQueryParamArray } from "../../shared/utils/queryParser";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class TicketsController {
  static async create(req: Request, res: Response) {
    try {
      // Mobile app reception: assigned driver is required.
      if (req.user.role === "STAFF") {
        const body = req.body as { driverValetId?: unknown };
        const driverValetId =
          typeof body.driverValetId === "string" ? body.driverValetId.trim() : "";
        if (!driverValetId) {
          return fail(
            res,
            400,
            "driverValetId is required for staff ticket creation"
          );
        }
      }

      const ticket = await TicketsService.create(
        req.user.companyId!,
        req.body
      );

      return created(res, ticket);
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
      const statusArr = parseQueryParamArray(req.query.status as string | string[] | undefined);
      const clientIdStr = parseQueryParam(req.query.clientId as string | string[] | undefined);
      const valetIdStr = parseQueryParam(req.query.valetId as string | string[] | undefined);

      const tickets = await TicketsService.list(
        req.user.companyId!,
        {
          statuses: statusArr.length > 0 ? statusArr : undefined,
          clientId: clientIdStr,
          valetId: valetIdStr,
        }
      );

      return ok(res, tickets);
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
      const ticket = await TicketsService.getById(
        req.user.companyId!,
        id
      );

      if (!ticket) {
        return notFound(res, "Ticket not found");
      }

      return ok(res, ticket);
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
      const ticket = await TicketsService.update(
        req.user.companyId!,
        id,
        req.body
      );

      return ok(res, ticket);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async assignValet(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const assignment = await TicketsService.assignValet(
        req.user.companyId!,
        id,
        req.body
      );

      return created(res, assignment);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async reportDamage(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const damageReport = await TicketsService.reportDamage(
        req.user.companyId!,
        id,
        req.body
      );

      return created(res, damageReport);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async addReview(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const review = await TicketsService.addReview(
        req.user.companyId!,
        id,
        req.body
      );

      return created(res, review);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async checkout(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const ticket = await TicketsService.checkout(
        req.user.companyId!,
        id
      );

      return ok(res, ticket);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
