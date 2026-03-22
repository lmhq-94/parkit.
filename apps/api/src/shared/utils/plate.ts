/** Igual que web/mobile: LLL-NNN o solo dígitos (hasta 6). */
export function formatPlate(value: string): string {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const letters = raw.replace(/[^A-Z]/g, "").slice(0, 3);
  const allDigits = raw.replace(/[^0-9]/g, "");

  if (letters.length === 0) {
    return allDigits.slice(0, 6);
  }

  const digits = allDigits.slice(0, 3);
  return letters + (digits.length > 0 ? "-" + digits : "");
}
