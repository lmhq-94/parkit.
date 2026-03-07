import { Request, Response } from "express";
import { VehiclesService } from "./vehicles.service";
import { VehicleCatalogService } from "./vehicle-catalog.service";
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

  static async delete(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const vehicle = await VehiclesService.delete(req.user.companyId!, id);
      if (!vehicle) return notFound(res, "Vehicle not found");
      return ok(res, vehicle);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async catalogMakes(_req: Request, res: Response) {
    try {
      const makes = await VehicleCatalogService.getMakes();
      return ok(res, makes.map((m) => ({ id: m.Make_ID, name: m.Make_Name })));
    } catch (error: unknown) {
      return fail(res, 502, error instanceof Error ? error.message : "Catalog unavailable");
    }
  }

  static async catalogModels(req: Request, res: Response) {
    try {
      const make = parseQueryParam(req.query.make as string | string[] | undefined);
      if (!make?.trim()) return fail(res, 400, "make is required");
      const models = await VehicleCatalogService.getModels(make);
      return ok(res, models.map((m) => ({ id: m.Model_ID, name: m.Model_Name })));
    } catch (error: unknown) {
      return fail(res, 502, error instanceof Error ? error.message : "Catalog unavailable");
    }
  }

  static async catalogDimensions(req: Request, res: Response) {
    try {
      const make = parseQueryParam(req.query.make as string | string[] | undefined);
      const model = parseQueryParam(req.query.model as string | string[] | undefined);
      const yearParam = parseQueryParam(req.query.year as string | string[] | undefined);
      const year = yearParam ? parseInt(yearParam, 10) : undefined;
      if (!make?.trim() || !model?.trim()) return fail(res, 400, "make and model are required");
      const dimensions = await VehicleCatalogService.getDimensions(make, model, year);
      return ok(res, dimensions ?? {});
    } catch (error: unknown) {
      return fail(res, 502, error instanceof Error ? error.message : "Catalog unavailable");
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
