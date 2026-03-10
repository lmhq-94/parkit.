import { Request, Response } from "express";
import { UsersService } from "./users.service";
import { parseQueryParamArray } from "../../shared/utils/queryParser";
import { created, fail, notFound, ok } from "../../shared/utils/response";

export class UsersController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const user = await UsersService.getProfile(userId);
      if (!user) return notFound(res, "User not found");
      const { passwordHash, invitationToken, invitationTokenExpiresAt, ...rest } = user;
      const pendingInvitation =
        invitationTokenExpiresAt != null && new Date(invitationTokenExpiresAt) > new Date();
      return ok(res, { ...rest, pendingInvitation });
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const user = await UsersService.updateProfile(userId, req.body);
      const { passwordHash, invitationToken, invitationTokenExpiresAt, ...rest } = user;
      const pendingInvitation =
        invitationTokenExpiresAt != null && new Date(invitationTokenExpiresAt) > new Date();
      return ok(res, { ...rest, pendingInvitation });
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async createSuperAdmin(req: Request, res: Response) {
    try {
      const user = await UsersService.createSuperAdmin(req.body);
      const { invitationToken, invitationTokenExpiresAt, passwordHash, ...rest } = user;
      return created(res, rest);
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
      const companyId = req.user.companyId!;
      const user = await UsersService.create(
        companyId,
        req.body
      );

      // Don't expose invitation token or password hash in API response
      const { invitationToken, invitationTokenExpiresAt, passwordHash, ...rest } = user;
      return created(res, rest);
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
      const systemRoles = parseQueryParamArray(req.query.systemRole as string | string[] | undefined);
      const includeInactives = req.query.includeInactives === "true" || req.query.includeInactives === "1";
      const users = await UsersService.list(req.user.companyId!, {
        excludeValets,
        systemRoles: systemRoles.length > 0 ? systemRoles : undefined,
        includeInactives,
      });
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

      const { passwordHash, invitationToken, invitationTokenExpiresAt, ...rest } = user;
      const pendingInvitation =
        invitationTokenExpiresAt != null && new Date(invitationTokenExpiresAt) > new Date();
      return ok(res, { ...rest, pendingInvitation });
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

  static async resendInvitation(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await UsersService.resendInvitation(req.user.companyId!, id);
      return ok(res, { ok: true }, "Invitation email sent");
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
