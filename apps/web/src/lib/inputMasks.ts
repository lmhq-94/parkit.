/**
 * Máscaras de entrada para formularios.
 * Cada función recibe el valor actual y el evento de cambio, y devuelve el valor formateado.
 */

/** NIF / Tax ID: dígitos y guiones, formato 3-101-123456 (cédula jurídica CR) o similar */
export function formatTaxId(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (digits.length <= 1) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4)}`;
}

/** Teléfono: dígitos, + al inicio opcional. Máx 15 dígitos (E.164). */
export function formatPhone(value: string): string {
  const trimmed = value.trimStart();
  const hasPlus = trimmed.startsWith("+");
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (digits.length === 0) return hasPlus ? "+" : "";
  return (hasPlus ? "+" : "") + digits;
}

/**
 * Placa tipo Costa Rica / internacional: 3 letras + guión + 3 números (LLL-NNN).
 * Formato antiguo CR: solo 6 dígitos (123456). Se extraen letras y dígitos en orden.
 */
export function formatPlate(value: string): string {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const letters = raw.replace(/[^A-Z]/g, "").slice(0, 3);
  const digits = raw.replace(/[^0-9]/g, "").slice(0, 3);
  if (digits.length === 0 && letters.length === 0) return "";
  if (letters.length === 0) return digits.length <= 6 ? digits : digits.slice(0, 6);
  return letters + (digits.length > 0 ? "-" + digits : "");
}

/** Para mostrar en UI: primera letra de cada palabra en mayúscula, resto en minúscula. Ej: TOYOTA → Toyota */
export function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(?:^|\s|[-])\w/g, (c) => c.toUpperCase());
}
