import { Request, Response } from "express";
import { CompaniesService } from "./companies.service";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class CompaniesController {
  static async create(req: Request, res: Response) {
    try {
      const company = await CompaniesService.create(req.body);
      return created(res, company);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return fail(res, 400, "Company context required");
      }
      const company = await CompaniesService.getById(companyId);

      if (!company) {
        return notFound(res, "Company not found");
      }

      return ok(res, company);
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
      const companyId = req.user.companyId;
      if (!companyId) {
        return fail(res, 400, "Company context required");
      }
      const company = await CompaniesService.update(
        companyId,
        req.body
      );

      return ok(res, company);
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
      const company = await CompaniesService.getById(id);
      if (!company) return notFound(res, "Company not found");
      return ok(res, company);
    } catch (error: unknown) {
      return fail(res, 400, error instanceof Error ? error.message : "Unknown error");
    }
  }

  static async list(_req: Request, res: Response) {
    try {
      const companies = await CompaniesService.list();
      return ok(res, companies);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async updateById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const company = await CompaniesService.update(id, req.body);
      return ok(res, company);
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
      const company = await CompaniesService.delete(id);
      if (!company) return notFound(res, "Company not found");
      return ok(res, company);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
