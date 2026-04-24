import { Request, Response } from "express";
import { OAuthService } from "./oauth.service";
import { ok, fail } from "../../shared/utils/response";

export class OAuthController {
  /**
   * Initiate Google OAuth flow
   * Redirects user to Google consent screen
   */
  static async initiateGoogleAuth(req: Request, res: Response) {
    try {
      const authUrl = await OAuthService.getGoogleAuthUrl();
      res.redirect(authUrl);
    } catch (error: unknown) {
      return fail(
        res,
        500,
        error instanceof Error ? error.message : "Failed to initiate Google OAuth"
      );
    }
  }

  /**
   * Handle Google OAuth callback
   * Exchanges code for tokens and creates/logs in user
   */
  static async handleGoogleCallback(req: Request, res: Response) {
    try {
      const { code, error: oauthError } = req.query;

      if (oauthError) {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_cancelled`);
      }

      if (!code || typeof code !== "string") {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_failed`);
      }

      const result = await OAuthService.handleGoogleCallback(code);
      
      // Redirect to frontend with token
      const redirectUrl = new URL(`${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback`);
      redirectUrl.searchParams.set("token", result.token);
      redirectUrl.searchParams.set("provider", "google");
      
      res.redirect(redirectUrl.toString());
    } catch (error: unknown) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_failed`);
    }
  }

  /**
   * Handle Apple OAuth callback
   * Apple uses POST for the callback with form data
   */
  static async handleAppleCallback(req: Request, res: Response) {
    try {
      const { code, error: oauthError, user } = req.body;

      if (oauthError) {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_cancelled`);
      }

      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_failed`);
      }

      const result = await OAuthService.handleAppleCallback(code, user);
      
      // Redirect to frontend with token
      const redirectUrl = new URL(`${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback`);
      redirectUrl.searchParams.set("token", result.token);
      redirectUrl.searchParams.set("provider", "apple");
      
      res.redirect(redirectUrl.toString());
    } catch (error: unknown) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_failed`);
    }
  }

  /**
   * Handle Microsoft OAuth
   * Microsoft uses similar flow to Google
   */
  static async initiateMicrosoftAuth(req: Request, res: Response) {
    try {
      const authUrl = await OAuthService.getMicrosoftAuthUrl();
      res.redirect(authUrl);
    } catch (error: unknown) {
      return fail(
        res,
        500,
        error instanceof Error ? error.message : "Failed to initiate Microsoft OAuth"
      );
    }
  }

  /**
   * Handle Microsoft OAuth callback
   */
  static async handleMicrosoftCallback(req: Request, res: Response) {
    try {
      const { code, error: oauthError } = req.query;

      if (oauthError) {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_cancelled`);
      }

      if (!code || typeof code !== "string") {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_failed`);
      }

      const result = await OAuthService.handleMicrosoftCallback(code);
      
      // Redirect to frontend with token
      const redirectUrl = new URL(`${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback`);
      redirectUrl.searchParams.set("token", result.token);
      redirectUrl.searchParams.set("provider", "microsoft");
      
      res.redirect(redirectUrl.toString());
    } catch (error: unknown) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_failed`);
    }
  }

  /**
   * Initiate Facebook OAuth flow
   * Redirects user to Facebook consent screen
   */
  static async initiateFacebookAuth(req: Request, res: Response) {
    try {
      const authUrl = await OAuthService.getFacebookAuthUrl();
      res.redirect(authUrl);
    } catch (error: unknown) {
      return fail(
        res,
        500,
        error instanceof Error ? error.message : "Failed to initiate Facebook OAuth"
      );
    }
  }

  /**
   * Handle Facebook OAuth callback
   * Exchanges code for tokens and creates/logs in user
   */
  static async handleFacebookCallback(req: Request, res: Response) {
    try {
      const { code, error: oauthError } = req.query;

      if (oauthError) {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_cancelled`);
      }

      if (!code || typeof code !== "string") {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_failed`);
      }

      const result = await OAuthService.handleFacebookCallback(code);
      
      // Redirect to frontend with token
      const redirectUrl = new URL(`${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback`);
      redirectUrl.searchParams.set("token", result.token);
      redirectUrl.searchParams.set("provider", "facebook");
      
      res.redirect(redirectUrl.toString());
    } catch (error: unknown) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=oauth_failed`);
    }
  }

  /**
   * Mobile OAuth endpoints
   * These receive tokens directly from mobile apps and verify them
   */
  static async handleMobileGoogleAuth(req: Request, res: Response) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return fail(res, 400, "ID token is required");
      }

      const result = await OAuthService.verifyGoogleTokenAndGetUser(idToken);
      return ok(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Google authentication failed"
      );
    }
  }

  static async handleMobileAppleAuth(req: Request, res: Response) {
    try {
      const { identityToken, nonce } = req.body;

      if (!identityToken) {
        return fail(res, 400, "Identity token is required");
      }

      const result = await OAuthService.verifyAppleTokenAndGetUser(identityToken, nonce);
      return ok(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Apple authentication failed"
      );
    }
  }

  static async handleMobileMicrosoftAuth(req: Request, res: Response) {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        return fail(res, 400, "Access token is required");
      }

      const result = await OAuthService.verifyMicrosoftTokenAndGetUser(accessToken);
      return ok(res, result);
    } catch (error: unknown) {
      return fail(
        res,
        400,
        error instanceof Error ? error.message : "Microsoft authentication failed"
      );
    }
  }
}
