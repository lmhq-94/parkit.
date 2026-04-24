import { Request, Response } from "express";
import { VehiclesService } from "./vehicles.service";
import { VehicleCatalogService } from "./vehicle-catalog.service";
import { parseQueryParam } from "../../shared/utils/queryParser";
import { formatPlate } from "../../shared/utils/plate";
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

  static async catalogMakes(req: Request, res: Response) {
    try {
      const yearParam = parseQueryParam(req.query.year as string | string[] | undefined);
      const year = yearParam ? parseInt(yearParam, 10) : undefined;
      const makes = await VehicleCatalogService.getMakes(year);
      return ok(res, makes.map((m) => ({ id: m.Make_ID, name: m.Make_Name })));
    } catch (error: unknown) {
      return fail(res, 502, error instanceof Error ? error.message : "Catalog unavailable");
    }
  }

  static async catalogModels(req: Request, res: Response) {
    try {
      const make = parseQueryParam(req.query.make as string | string[] | undefined);
      if (!make?.trim()) return fail(res, 400, "make is required");
      const yearParam = parseQueryParam(req.query.year as string | string[] | undefined);
      const year = yearParam ? parseInt(yearParam, 10) : undefined;
      const models = await VehicleCatalogService.getModels(make, year);
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

  // POST /vehicles/catalog/makes - Create a new make manually
  static async createMake(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name?.trim()) return fail(res, 400, "name is required");
      
      const make = await VehicleCatalogService.createMake({ name });
      return created(res, { id: make.id, name: make.name }, "Make created successfully");
    } catch (error: unknown) {
      return fail(res, 400, error instanceof Error ? error.message : "Failed to create make");
    }
  }

  // POST /vehicles/catalog/models - Create a new model manually
  static async createModel(req: Request, res: Response) {
    try {
      const { makeId, name } = req.body;
      if (!makeId?.trim()) return fail(res, 400, "makeId is required");
      if (!name?.trim()) return fail(res, 400, "name is required");
      
      const model = await VehicleCatalogService.createModel({
        makeId,
        name,
      });
      return created(res, { id: model.id, name: model.name, makeId: model.makeId }, "Model created successfully");
    } catch (error: unknown) {
      return fail(res, 400, error instanceof Error ? error.message : "Failed to create model");
    }
  }

  // POST /vehicles/catalog/auto-create - Auto-create make and/or model if not exists
  static async autoCreateMakeModel(req: Request, res: Response) {
    try {
      const { make, model, year } = req.body;
      if (!make?.trim()) return fail(res, 400, "make is required");
      if (!model?.trim()) return fail(res, 400, "model is required");
      
      // Find or create make
      const makeId = await VehicleCatalogService.findOrCreateMake(make);
      
      // Try to get dimensions from API
      let dimensions: { lengthCm?: number; widthCm?: number; heightCm?: number } = {};
      try {
        const dims = await VehicleCatalogService.getDimensions(make, model, year);
        if (dims) {
          dimensions = dims;
        }
      } catch {
        // Ignore API errors
      }
      
      // Find or create model
      const modelId = await VehicleCatalogService.findOrCreateModel(makeId, model);
      
      return created(res, { makeId, modelId, make, model, dimensions }, "Make/Model created or found successfully");
    } catch (error: unknown) {
      return fail(res, 400, error instanceof Error ? error.message : "Failed to create make/model");
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

  /** Plate formatted as in web; search across entire system (STAFF valet). */
  static async getByPlateValet(req: Request, res: Response) {
    try {
      const raw = parseQueryParam(req.query.plate as string | string[] | undefined) || "";
      const countryStr =
        parseQueryParam(req.query.countryCode as string | string[] | undefined) || "CR";
      const plate = formatPlate(raw);
      if (!plate.trim()) {
        return fail(res, 400, "plate is required");
      }
      const vehicle = await VehiclesService.getByPlateGlobal(plate, countryStr);
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
