/**
 * Email validation regex
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email string
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}
