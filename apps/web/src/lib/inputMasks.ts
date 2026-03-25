/**
 * Input masks for forms.
 * Each function receives current value and change event, and returns formatted value.
 */

// Import phone formatting functions from shared package
export {
  COUNTRY_DIAL_CODES,
  formatPhone,
  formatPhoneInternational,
  formatPhoneWithCountryCode,
  getDeviceCountryCode,
} from "@parkit/shared";

/** NIF / Tax ID: digits and hyphens, format 3-101-123456 (CR legal ID) or similar */
export function formatTaxId(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (digits.length <= 1) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4)}`;
}

/**
 * Costa Rica plate: numeric only (e.g. 345723) or alphanumeric LLL-NNN (e.g. RWF-001).
 * Accepts only A-Z and 0-9; automatically adds hyphen in mixed format.
 */
export function formatPlate(value: string): string {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const letters = raw.replace(/[^A-Z]/g, "").slice(0, 3);
  const allDigits = raw.replace(/[^0-9]/g, "");

  // Numeric only: up to 6 digits (e.g. 345723)
  if (letters.length === 0) {
    return allDigits.slice(0, 6);
  }

  // Alphanumeric: 3 letters + hyphen + 3 digits (e.g. RWF-001)
  const digits = allDigits.slice(0, 3);
  return letters + (digits.length > 0 ? "-" + digits : "");
}

/** For UI display: first letter of each word uppercase, rest lowercase. Example: TOYOTA -> Toyota */
export function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(?:^|\s|[-])\w/g, (c) => c.toUpperCase());
}
