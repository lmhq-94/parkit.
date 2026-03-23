/**
 * Validation helpers for forms (create, edit, inline).
 * They receive the i18n t function and return translated message or null if valid.
 */

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function required(t: TranslateFn, value: unknown): string | null {
  if (value == null) return t("validation.required");
  const s = String(value).trim();
  return s === "" ? t("validation.required") : null;
}

export function email(t: TranslateFn, value: unknown): string | null {
  const s = value == null ? "" : String(value).trim();
  if (s === "") return null; // empty = no error (use required separately when mandatory)
  return EMAIL_REGEX.test(s) ? null : t("validation.invalidEmail");
}

export function minLength(t: TranslateFn, value: unknown, min: number): string | null {
  const s = value == null ? "" : String(value);
  return s.length < min ? t("validation.minLength", { min }) : null;
}

export function maxLength(t: TranslateFn, value: unknown, max: number): string | null {
  const s = value == null ? "" : String(value);
  return s.length > max ? t("validation.maxLength", { max }) : null;
}

export function selectRequired(t: TranslateFn, value: unknown): string | null {
  if (value == null) return t("validation.selectRequired");
  const s = String(value).trim();
  return s === "" ? t("validation.selectRequired") : null;
}

/** Plate format: alphanumeric, optional hyphens/spaces, reasonable length (3-15) */
const PLATE_REGEX = /^[A-Za-z0-9\u00C0-\u024F\s-]{3,15}$/;

export function plate(t: TranslateFn, value: unknown): string | null {
  const s = value == null ? "" : String(value).trim();
  if (s === "") return null;
  return PLATE_REGEX.test(s) ? null : t("validation.invalidPlate");
}

/** Optional phone: if present, must match numeric E.164 format (digits only, 10-15 chars). */
export function phone(t: TranslateFn, value: unknown): string | null {
  const s = value == null ? "" : String(value).trim();
  if (s === "") return null;
  const digits = s.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return t("validation.invalidPhone");
  return null;
}
