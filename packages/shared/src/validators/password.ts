/**
 * Password security rules. Must match API (apps/api/src/shared/validators/index.ts).
 * Used for set password (accept-invite) and reset password flows.
 */
export const PASSWORD_MIN_LENGTH = 8;

export function checkPasswordRequirements(password: string) {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

export function isPasswordSecure(password: string): boolean {
  const r = checkPasswordRequirements(password);
  return r.minLength && r.hasUppercase && r.hasLowercase && r.hasNumber;
}
