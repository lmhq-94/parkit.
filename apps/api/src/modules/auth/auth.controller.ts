import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { created, fail, ok } from "../../shared/utils/response";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);

      return created(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async registerValet(req: Request, res: Response) {
    try {
      const result = await AuthService.registerValet(req.body);

      return created(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);

      return ok(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        401,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async registerInvited(req: Request, res: Response) {
    try {
      const result = await AuthService.registerInvited(req.body);
      return created(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const result = await AuthService.requestPasswordReset(req.body);
      return ok(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const result = await AuthService.resetPassword(req.body);
      return ok(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async requestOtp(req: Request, res: Response) {
    try {
      const result = await AuthService.requestOtp(req.body);

      return ok(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const result = await AuthService.verifyOtp(req.body);

      return ok(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
