import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT configuration - expires in 7 days for security balance between usability and token refresh
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = "7d";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string
) => {
  return bcrypt.compare(password, hash);
};

export const signToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Signs a token specifically for invitations, with a 7-day expiry.
 */
export const signInvitationToken = (payload: object) => {
  return jwt.sign({ ...payload, type: "invitation" }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export interface AcceptInvitationDTO {
  token: string;
  password: string;
}

export interface RegisterInvitedDTO {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

export const verifyInvitationToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== "invitation") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired invitation token");
  }
};
