import { Request, Response } from "express";
import { ParkingsService } from "./parkings.service";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class ParkingsController {
  static async create(req: Request, res: Response) {
    try {
      const parking = await ParkingsService.create(
        req.user.companyId!,
        req.body
      );

      return created(res, parking);
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
      const parkings = await ParkingsService.list(req.user.companyId!);

      return ok(res, parkings);
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
      const parking = await ParkingsService.getById(
        req.user.companyId!,
        id
      );

      if (!parking) {
        return notFound(res, "Parking not found");
      }

      return ok(res, parking);
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
      const parking = await ParkingsService.update(
        req.user.companyId!,
        id,
        req.body
      );

      return ok(res, parking);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async getSlots(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const slots = await ParkingsService.getSlots(
        req.user.companyId!,
        id
      );

      return ok(res, slots);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async getAvailableSlots(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const slots = await ParkingsService.getAvailableSlots(
        req.user.companyId!,
        id
      );

      return ok(res, slots);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
