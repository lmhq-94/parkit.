import { Request, Response } from "express";
import { UsersService } from "./users.service";
import { ClientsService } from "../clients/clients.service";
import { parseQueryParamArray } from "../../shared/utils/queryParser";
import { created, fail, notFound, ok } from "../../shared/utils/response";
import type { CreateUserInput } from "../../shared/validators";
import { InvitationsService } from "./invitations.service";
import { SystemRole } from "@prisma/client";

export class UsersController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const user = await UsersService.getProfile(userId);
      if (!user) return notFound(res, "User not found");
      const {
        passwordHash: _passwordHash,
        ...rest
      } = user;
      return ok(res, rest);
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
      const {
        passwordHash: _passwordHash,
        ...rest
      } = user;
      return ok(res, rest);
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
      const { email, firstName: _firstName, lastName: _lastName, password } = req.body;
      
      // Si no se proporciona contraseña, enviar invitación por email
      const isInvitation = !password || password === "";
      
      if (isInvitation) {
        const invitation = await InvitationsService.sendInvitation({
          email: email.toLowerCase().trim(),
          companyId: null, // SUPER_ADMIN no tiene compañía
          role: SystemRole.SUPER_ADMIN,
          invitedByUserId: req.user.userId,
        });
        return created(res, invitation);
      }
      
      // Si se proporciona contraseña, crear usuario directamente (comportamiento anterior)
      const user = await UsersService.createSuperAdmin(req.body);
      const {
        passwordHash: _passwordHash,
        ...rest
      } = user;
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
      const body = req.body as CreateUserInput;
      
      // Si no se proporciona contraseña, enviar invitación por email
      const isInvitation = !body.password || body.password === "";
      
      if (isInvitation) {
        const invitation = await InvitationsService.sendInvitation({
          email: body.email.toLowerCase().trim(),
          companyId,
          role: (body.systemRole as SystemRole) || SystemRole.STAFF,
          invitedByUserId: req.user.userId,
        });
        return created(res, invitation);
      }
      
      // Si se proporciona contraseña, crear usuario directamente (comportamiento anterior)
      const user = await UsersService.create(companyId, body);

      // Don't expose invitation token or password hash in API response
      const {
        passwordHash: _passwordHash,
        ...rest
      } = user;
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
      const bypassCompanyScope = req.user.role === "SUPER_ADMIN";
      const user = await UsersService.update(
        req.user.companyId!,
        id,
        req.body,
        { bypassCompanyScope }
      );

      const {
        passwordHash: _passwordHash,
        ...rest
      } = user;
      return ok(res, rest);
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

  static async invite(req: Request, res: Response) {
    try {
      const companyId = req.user.companyId!;
      const { email, role } = req.body;
      if (!email) throw new Error("Email is required");

      const invitation = await InvitationsService.sendInvitation({
        email: email.toLowerCase().trim(),
        companyId,
        role: (role as SystemRole) || SystemRole.CUSTOMER,
        invitedByUserId: req.user.userId,
      });

      return created(res, invitation);
    } catch (error: unknown) {
      return fail(res, 400, error instanceof Error ? error.message : "Unknown error");
    }
  }

  static async inviteBatch(req: Request, res: Response) {
    try {
      const companyId = req.user.companyId!;
      const { emails, role } = req.body;
      if (!Array.isArray(emails) || emails.length === 0) {
        throw new Error("Emails array is required and cannot be empty");
      }

      const results = await InvitationsService.sendInvitationsBatch({
        emails: emails.map((e) => String(e).trim()),
        companyId,
        role: (role as SystemRole) || SystemRole.ADMIN,
        invitedByUserId: req.user.userId,
      });

      return created(res, results);
    } catch (error: unknown) {
      return fail(res, 400, error instanceof Error ? error.message : "Unknown error");
    }
  }

  static async listInvitations(req: Request, res: Response) {
    try {
      const companyId = req.user.companyId!;
      const role = req.query.role as SystemRole | undefined;
      const invitations = await InvitationsService.listByCompany(companyId, role);
      return ok(res, invitations);
    } catch (error: unknown) {
      return fail(res, 400, error instanceof Error ? error.message : "Unknown error");
    }
  }

  static async revokeInvitation(req: Request, res: Response) {
    try {
      const companyId = req.user.companyId!;
      const id = String(req.params.id);
      await InvitationsService.revoke(id, companyId);
      return ok(res, { ok: true }, "Invitation revoked");
    } catch (error: unknown) {
      return fail(res, 400, error instanceof Error ? error.message : "Unknown error");
    }
  }

  static async addVehicle(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const clientVehicle = await ClientsService.addVehicleByUserId(
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
