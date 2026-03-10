import { Request, Response } from "express";
import { ValetsService } from "./valets.service";
import { parseQueryParamArray } from "../../shared/utils/queryParser";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class ValetsController {
  static async create(req: Request, res: Response) {
    try {
      const valet = await ValetsService.create(
        req.user.companyId!,
        req.body
      );

      return created(res, valet);
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

      const valets = await ValetsService.list(
        req.user.companyId!,
        statusArr.length > 0 ? statusArr : undefined
      );

      return ok(res, valets);
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
      const valet = await ValetsService.getById(
        req.user.companyId!,
        id
      );

      if (!valet) {
        return notFound(res, "Valet not found");
      }

      return ok(res, valet);
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
      const valet = await ValetsService.update(
        req.user.companyId!,
        id,
        req.body
      );

      return ok(res, valet);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const valet = await ValetsService.updateStatus(
        req.user.companyId!,
        id,
        req.body.status
      );

      return ok(res, valet);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async deactivate(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await ValetsService.deactivate(
        req.user.companyId!,
        id
      );

      return ok(res, null, "Valet deactivated");
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
