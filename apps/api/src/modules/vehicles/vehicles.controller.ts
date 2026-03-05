import { Request, Response } from "express";
import { VehiclesService } from "./vehicles.service";
import { parseQueryParam } from "../../shared/utils/queryParser";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class VehiclesController {
  static async create(req: Request, res: Response) {
    try {
      const vehicle = await VehiclesService.create(
        req.user.companyId!,
        req.body
      );

      return created(res, vehicle);
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
      const vehicles = await VehiclesService.list(req.user.companyId!);

      return ok(res, vehicles);
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
      const vehicle = await VehiclesService.getById(
        req.user.companyId!,
        id
      );

      if (!vehicle) {
        return notFound(res, "Vehicle not found");
      }

      return ok(res, vehicle);
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
      const vehicle = await VehiclesService.update(
        req.user.companyId!,
        id,
        req.body
      );

      return ok(res, vehicle);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async getByPlate(req: Request, res: Response) {
    try {
      const plateStr = parseQueryParam(req.query.plate as string | string[] | undefined) || '';
      const countryStr = parseQueryParam(req.query.countryCode as string | string[] | undefined) || 'CR';

      const vehicle = await VehiclesService.getByPlate(
        req.user.companyId!,
        plateStr,
        countryStr
      );

      if (!vehicle) {
        return notFound(res, "Vehicle not found");
      }

      return ok(res, vehicle);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
