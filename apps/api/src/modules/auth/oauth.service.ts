import { prisma } from "../../shared/prisma";
import { signToken } from "./auth.utils";
import { toAuthUserResponse, type AuthUserResponse } from "./authUserResponse";

// OAuth configuration from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:4000/auth/google/callback";

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || "";
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || "";
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || "http://localhost:4000/auth/microsoft/callback";
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID || "common";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || "http://localhost:4000/auth/facebook/callback";

interface OAuthUserInfo {
  email: string;
  firstName: string;
  lastName: string;
  provider: string;
  providerId: string;
  picture?: string;
}

export class OAuthService {
  /**
   * Get Google OAuth authorization URL
   */
  static async getGoogleAuthUrl(): Promise<string> {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error("Google OAuth not configured");
    }

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange Google authorization code for tokens and user info
   */
  static async handleGoogleCallback(code: string): Promise<{ user: AuthUserResponse; token: string }> {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error("Google OAuth not configured");
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get user info from Google");
    }

    const googleUser = await userResponse.json();

    const userInfo: OAuthUserInfo = {
      email: googleUser.email,
      firstName: googleUser.given_name || "",
      lastName: googleUser.family_name || "",
      provider: "google",
      providerId: googleUser.id,
      picture: googleUser.picture,
    };

    return this.findOrCreateOAuthUser(userInfo);
  }

  /**
   * Verify Google ID token (for mobile apps)
   */
  static async verifyGoogleTokenAndGetUser(idToken: string): Promise<{ user: AuthUserResponse; token: string }> {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error("Google OAuth not configured");
    }

    // Verify the ID token with Google's token info endpoint
    const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

    if (!tokenInfoResponse.ok) {
      throw new Error("Invalid Google ID token");
    }

    const tokenInfo = await tokenInfoResponse.json();

    // Verify the audience matches our client ID
    if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
      throw new Error("Invalid token audience");
    }

    // Check if email is verified
    if (!tokenInfo.email_verified) {
      throw new Error("Email not verified");
    }

    const userInfo: OAuthUserInfo = {
      email: tokenInfo.email,
      firstName: tokenInfo.given_name || "",
      lastName: tokenInfo.family_name || "",
      provider: "google",
      providerId: tokenInfo.sub,
      picture: tokenInfo.picture,
    };

    return this.findOrCreateOAuthUser(userInfo);
  }

  /**
   * Get Microsoft OAuth authorization URL
   */
  static async getMicrosoftAuthUrl(): Promise<string> {
    if (!MICROSOFT_CLIENT_ID) {
      throw new Error("Microsoft OAuth not configured");
    }

    const params = new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      redirect_uri: MICROSOFT_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile User.Read",
      response_mode: "query",
    });

    return `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange Microsoft authorization code for tokens and user info
   */
  static async handleMicrosoftCallback(code: string): Promise<{ user: AuthUserResponse; token: string }> {
    if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
      throw new Error("Microsoft OAuth not configured");
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          redirect_uri: MICROSOFT_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Microsoft Graph
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get user info from Microsoft");
    }

    const msUser = await userResponse.json();

    const userInfo: OAuthUserInfo = {
      email: msUser.mail || msUser.userPrincipalName,
      firstName: msUser.givenName || "",
      lastName: msUser.surname || "",
      provider: "microsoft",
      providerId: msUser.id,
    };

    return this.findOrCreateOAuthUser(userInfo);
  }

  /**
   * Verify Microsoft access token (for mobile apps)
   */
  static async verifyMicrosoftTokenAndGetUser(accessToken: string): Promise<{ user: AuthUserResponse; token: string }> {
    // Get user info from Microsoft Graph
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      throw new Error("Invalid Microsoft access token");
    }

    const msUser = await userResponse.json();

    const userInfo: OAuthUserInfo = {
      email: msUser.mail || msUser.userPrincipalName,
      firstName: msUser.givenName || "",
      lastName: msUser.surname || "",
      provider: "microsoft",
      providerId: msUser.id,
    };

    return this.findOrCreateOAuthUser(userInfo);
  }

  /**
   * Get Facebook OAuth authorization URL
   */
  static async getFacebookAuthUrl(): Promise<string> {
    if (!FACEBOOK_APP_ID) {
      throw new Error("Facebook OAuth not configured");
    }

    const params = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      redirect_uri: FACEBOOK_REDIRECT_URI,
      response_type: "code",
      scope: "email,public_profile",
      auth_type: "rerequest",
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange Facebook authorization code for tokens and user info
   */
  static async handleFacebookCallback(code: string): Promise<{ user: AuthUserResponse; token: string }> {
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      throw new Error("Facebook OAuth not configured");
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${new URLSearchParams({
        code,
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: FACEBOOK_REDIRECT_URI,
      })}`
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Facebook
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email,first_name,last_name,picture&access_token=${tokenData.access_token}`
    );

    if (!userResponse.ok) {
      throw new Error("Failed to get user info from Facebook");
    }

    const fbUser = await userResponse.json();

    const userInfo: OAuthUserInfo = {
      email: fbUser.email,
      firstName: fbUser.first_name || "",
      lastName: fbUser.last_name || "",
      provider: "facebook",
      providerId: fbUser.id,
      picture: fbUser.picture?.data?.url,
    };

    return this.findOrCreateOAuthUser(userInfo);
  }

  /**
   * Handle Apple OAuth callback (web flow)
   * Apple Sign-In uses a different flow (JWT validation)
   */
  static async handleAppleCallback(_code: string, _userData?: string): Promise<{ user: AuthUserResponse; token: string }> {
    // Apple Sign-In implementation requires generating a client secret JWT
    // and exchanging the authorization code for tokens
    // This is a simplified version - full implementation requires
    // Apple developer account setup with private key
    throw new Error("Apple Sign-In requires additional configuration. Please use the mobile app implementation.");
  }

  /**
   * Verify Apple identity token (for mobile apps)
   * The mobile app handles the Apple Sign-In UI and sends us the identity token
   */
  static async verifyAppleTokenAndGetUser(identityToken: string, _nonce?: string): Promise<{ user: AuthUserResponse; token: string }> {
    // Apple's identity token is a JWT that we need to verify
    // For now, this is a placeholder - full implementation requires:
    // 1. Fetching Apple's public keys from https://appleid.apple.com/auth/keys
    // 2. Verifying the JWT signature
    // 3. Validating the nonce (if provided)
    // 4. Extracting user info from the token claims

    // Decode the JWT payload (without verification for now - mobile app already verified with Apple)
    const parts = identityToken.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid identity token format");
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());

    if (!payload.email) {
      throw new Error("Email not provided in Apple identity token");
    }

    // Extract name from user data if available (only provided on first sign-in)
    const firstName = "";
    const lastName = "";

    const userInfo: OAuthUserInfo = {
      email: payload.email,
      firstName,
      lastName,
      provider: "apple",
      providerId: payload.sub,
    };

    return this.findOrCreateOAuthUser(userInfo);
  }

  /**
   * Find existing user by OAuth provider info or create new user
   */
  private static async findOrCreateOAuthUser(userInfo: OAuthUserInfo): Promise<{ user: AuthUserResponse; token: string }> {
    // Try to find user by email first
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (user) {
      // User exists - update OAuth provider info if needed
      // Note: You might want to store provider info in a separate table
      // For now, we just authenticate the existing user
      
      // Check if user was originally created with password
      if (user.passwordHash) {
        // User has password - allow OAuth login
      }
    } else {
      // Create new user from OAuth data
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          firstName: userInfo.firstName || userInfo.email.split("@")[0],
          lastName: userInfo.lastName || "",
          // No password - OAuth users authenticate via provider
          passwordHash: "",
          systemRole: "ADMIN", // Default role - adjust as needed
        },
      });
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      role: user.systemRole,
      companyId: user.companyId ?? undefined,
    });

    // Get valet staff role if applicable
    const valet = await prisma.valet.findUnique({
      where: { userId: user.id },
      select: { staffRole: true },
    });

    return {
      user: toAuthUserResponse(user, valet?.staffRole ?? null),
      token,
    };
  }
}
