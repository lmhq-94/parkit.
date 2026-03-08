export interface LoginDTO {
    email: string;
    password: string;
  }
  
  export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId: string;
}

export interface AcceptInvitationDTO {
  token: string;
  password: string;
}
  