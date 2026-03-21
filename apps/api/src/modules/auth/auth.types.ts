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
  licenseNumber?: string;
  licenseExpiry?: string;
}