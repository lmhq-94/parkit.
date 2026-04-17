import { Request, Response } from "express";
import { CustomersService } from "./customers.service";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class CustomersController {
  static async create(req: Request, res: Response) {
    try {
      const customer = await CustomersService.create(
        req.user.companyId!,
        req.body
      );

      return created(res, customer);
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
      const customers = await CustomersService.list(req.user.companyId!);

      return ok(res, customers);
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
      const customer = await CustomersService.getById(
        req.user.companyId!,
        id
      );

      if (!customer) {
        return notFound(res, "Customer not found");
      }

      return ok(res, customer);
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
      const customer = await CustomersService.update(
        req.user.companyId!,
        id,
        req.body
      );

      return ok(res, customer);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async getVehicles(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const vehicles = await CustomersService.getVehicles(
        req.user.companyId!,
        id
      );

      return ok(res, vehicles);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async addVehicle(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customerVehicle = await CustomersService.addVehicle(
        req.user.companyId!,
        id,
        req.body
      );

      return created(res, customerVehicle);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
