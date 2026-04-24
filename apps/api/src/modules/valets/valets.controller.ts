import { Request, Response } from "express";
import type { ValetStaffRole } from "@prisma/client";
import { ValetsService } from "./valets.service";
import { parseQueryParamArray } from "../../shared/utils/queryParser";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class ValetsController {
  /** Valets who have worked in the current company (to assign to tickets). ADMIN/STAFF with company. */
  static async listForCompany(req: Request, res: Response) {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return fail(res, 400, "Company context required");
      }
      const valets = await ValetsService.listValetsForCompany(companyId);
      return ok(res, valets);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /** Valets for workflow filtered by specific parking. */
  static async listForParking(req: Request, res: Response) {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return fail(res, 400, "Company context required");
      }
      const raw = req.params.parkingId;
      const parkingId = Array.isArray(raw) ? raw[0] : raw;
      if (!parkingId || typeof parkingId !== "string") {
        return fail(res, 400, "parkingId required");
      }
      const valets = await ValetsService.listValetsForParking(parkingId, companyId);
      return ok(res, valets);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /** Workflow statistics for the workflow tile. */
  static async getWorkflowStatus(req: Request, res: Response) {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return fail(res, 400, "Company context required");
      }
      const rawParkingId = req.query.parkingId;
      const parkingId = typeof rawParkingId === "string" ? rawParkingId : undefined;
      const status = await ValetsService.getWorkflowStatus(companyId, parkingId);
      return ok(res, status);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /** Logged-in valet's assignments (mobile-valet). Does not require company. */
  static async getMyAssignments(req: Request, res: Response) {
    try {
      const assignments = await ValetsService.getMyAssignments(req.user!.userId);
      if (assignments === null) {
        return fail(res, 403, "User is not a valet");
      }
      return ok(res, assignments);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /** Current valet profile (staffRole, etc.). */
  static async getMe(req: Request, res: Response) {
    try {
      const valet = await ValetsService.getMe(req.user!.userId);
      if (!valet) {
        return fail(res, 403, "User is not a valet");
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

  /** Update authenticated valet's role, license and/or operational context. */
  static async patchMe(req: Request, res: Response) {
    try {
      const body = req.body as {
        staffRole?: ValetStaffRole;
        licenseNumber?: string | null;
        licenseExpiry?: string | null;
        companyId?: string | null;
        currentParkingId?: string | null;
      };
      const updated = await ValetsService.patchMe(req.user!.userId, {
        staffRole: body.staffRole,
        licenseNumber: body.licenseNumber,
        licenseExpiry: body.licenseExpiry,
        companyId: body.companyId,
        currentParkingId: body.currentParkingId,
      });
      return ok(res, updated);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg === "User is not a valet") {
        return fail(res, 403, msg);
      }
      return fail(res, 400, msg);
    }
  }

  /** App heartbeat: updates lastPresenceAt (does not change AWAY). */
  static async postMyPing(req: Request, res: Response) {
    try {
      const row = await ValetsService.pingMyPresence(req.user!.userId);
      return ok(res, row);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg === "User is not a valet") {
        return fail(res, 403, msg);
      }
      return fail(res, 400, msg);
    }
  }

  /** Mark absence (logout) or become available without active tickets. */
  static async postMyPresence(req: Request, res: Response) {
    try {
      const { status } = req.body as { status: "AWAY" | "AVAILABLE" };
      const updated = await ValetsService.updateMyPresence(req.user!.userId, status);
      return ok(res, updated);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg === "User is not a valet") {
        return fail(res, 403, msg);
      }
      return fail(res, 400, msg);
    }
  }

  /** Start valet wizard. */
  static async postMyWizardStart(req: Request, res: Response) {
    try {
      const { wizardType } = req.body as { wizardType: "RECEIVE" | "PARK" | "RETURN" };
      if (!wizardType || !["RECEIVE", "PARK", "RETURN"].includes(wizardType)) {
        return fail(res, 400, "Invalid wizardType");
      }
      const updated = await ValetsService.startMyWizard(req.user!.userId, wizardType);
      return ok(res, updated);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg === "User is not a valet") {
        return fail(res, 403, msg);
      }
      return fail(res, 400, msg);
    }
  }

  /** End valet wizard. */
  static async postMyWizardEnd(req: Request, res: Response) {
    try {
      const updated = await ValetsService.endMyWizard(req.user!.userId);
      return ok(res, updated);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg === "User is not a valet") {
        return fail(res, 403, msg);
      }
      return fail(res, 400, msg);
    }
  }

  /** AVAILABLE drivers at the specified parking (company = current context). */
  static async listAvailableDriversAtParking(req: Request, res: Response) {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return fail(res, 400, "Company context required");
      }
      const raw = req.params.parkingId;
      const parkingId = Array.isArray(raw) ? raw[0] : raw;
      if (!parkingId || typeof parkingId !== "string") {
        return fail(res, 400, "parkingId required");
      }
      const valets = await ValetsService.listAvailableDriversAtParking(parkingId, companyId);
      return ok(res, valets);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg === "Parking not found or not in your company context") {
        return fail(res, 404, msg);
      }
      return fail(res, 400, msg);
    }
  }

  static async listDispatchDriversAtParking(req: Request, res: Response) {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return fail(res, 400, "Company context required");
      }
      const raw = req.params.parkingId;
      const parkingId = Array.isArray(raw) ? raw[0] : raw;
      if (!parkingId || typeof parkingId !== "string") {
        return fail(res, 400, "parkingId required");
      }
      const valets = await ValetsService.listDispatchDriversAtParking(parkingId, companyId);
      return ok(res, valets);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg === "Parking not found or not in your company context") {
        return fail(res, 404, msg);
      }
      return fail(res, 400, msg);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const valet = await ValetsService.create(
        req.user.companyId ?? undefined,
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
      const accountStatusRaw = parseQueryParamArray(
        req.query.accountStatus as string | string[] | undefined
      );
      const accountStatusArr = accountStatusRaw.filter((v) => v === "active" || v === "inactive");

      const valets = await ValetsService.list(
        req.user.companyId ?? undefined,
        statusArr.length > 0 ? statusArr : undefined,
        accountStatusArr.length > 0 ? accountStatusArr : undefined
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
        req.user.companyId ?? undefined,
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
        req.user.companyId ?? undefined,
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
        req.user.companyId ?? undefined,
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
        req.user.companyId ?? undefined,
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
