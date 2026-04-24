export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId?: string | null;
}

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

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
}

export interface RequestOtpDTO {
  email: string;
  purpose?: string;
  channel?: string;
}

export interface VerifyOtpDTO {
  email: string;
  code: string;
  purpose?: string;
}

export interface RegisterValetDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  /** STAFF sub-role: receptionist or driver. */
  staffRole: "RECEPTIONIST" | "DRIVER";
  /** Optional; registration from mobile-valet does not send these fields. */
  licenseNumber?: string;
  licenseExpiry?: string;
}