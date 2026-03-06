import { Request, Response } from "express";
import { UsersService } from "./users.service";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class UsersController {
  static async create(req: Request, res: Response) {
    try {
      const companyId = req.user.companyId!;
      const user = await UsersService.create(
        companyId,
        req.body
      );

      return created(res, user);
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
      const excludeValets = req.query.excludeValets === "true" || req.query.excludeValets === "1";
      const users = await UsersService.list(req.user.companyId!, { excludeValets });
      return ok(res, users);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await UsersService.getById(
        req.user.companyId!,
        id
      );

      if (!user) {
        return notFound(res, "User not found");
      }

      return ok(res, user);
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
      const user = await UsersService.update(
        req.user.companyId!,
        id,
        req.body
      );

      return ok(res, user);
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
      await UsersService.deactivate(
        req.user.companyId!,
        id
      );

      return ok(res, null, "User deactivated");
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
