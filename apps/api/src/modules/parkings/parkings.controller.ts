import type { SlotType } from "@prisma/client";
import { Request, Response } from "express";
import { ParkingsService } from "./parkings.service";
import { CompaniesService } from "../companies/companies.service";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class ParkingsController {
  /** Si la empresa tiene canal con app (requiresCustomerApp), tiene bookings habilitados. */
  static async hasAnyRequiringBooking(req: Request, res: Response) {
    try {
      const company = await CompaniesService.getById(req.user.companyId!);
      const hasBookable = company?.requiresCustomerApp ?? false;
      return ok(res, { hasBookable });
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

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

  static async createSlots(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const body = (req.body ?? {}) as { slots?: Array<{ label: string; slotType?: string }> };
      const slots = (Array.isArray(body.slots) ? body.slots : []) as Array<{ label: string; slotType?: SlotType }>;
      const created = await ParkingsService.createSlots(id, slots);
      return ok(res, created);
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
      const parking = await ParkingsService.delete(req.user.companyId!, id);
      if (!parking) return notFound(res, "Parking not found");
      return ok(res, parking);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
