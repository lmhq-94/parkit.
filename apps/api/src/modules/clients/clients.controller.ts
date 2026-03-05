import { Request, Response } from "express";
import { ClientsService } from "./clients.service";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class ClientsController {
  static async create(req: Request, res: Response) {
    try {
      const client = await ClientsService.create(
        req.user.companyId!,
        req.body
      );

      return created(res, client);
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
      const clients = await ClientsService.list(req.user.companyId!);

      return ok(res, clients);
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
      const client = await ClientsService.getById(
        req.user.companyId!,
        id
      );

      if (!client) {
        return notFound(res, "Client not found");
      }

      return ok(res, client);
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
      const client = await ClientsService.update(
        req.user.companyId!,
        id,
        req.body
      );

      return ok(res, client);
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
      const vehicles = await ClientsService.getVehicles(
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
      const clientVehicle = await ClientsService.addVehicle(
        req.user.companyId!,
        id,
        req.body
      );

      return created(res, clientVehicle);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
