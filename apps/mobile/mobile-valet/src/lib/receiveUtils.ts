import { formatPlate } from "@parkit/shared";
import type { Locale } from "@parkit/shared";

export const COUNTRY_CR = "CR";
export const MANUAL_TICKET_CODE_RE = /^[A-Za-z0-9\-_]+$/;
export const MAX_DAMAGE_PHOTOS = 8;

export function randomWalkInPassword(): string {
  const r = Math.random().toString(36).slice(2, 10);
  return `Tmp${r}Aa1`;
}

export function isValidCrPlate(value: string): boolean {
  const p = formatPlate(value).trim();
  return /^\d{6}$/.test(p) || /^[A-Z]{3}-\d{3}$/.test(p);
}

export function formatBenefitTime(
  value: number | null | undefined,
  locale: Locale
): string {
  if (value == null || Number.isNaN(value)) {
    return locale === "es" ? "0 min" : "0 min";
  }
  const totalMinutes = Math.max(0, Math.floor(value));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) return locale === "es" ? "0 min" : "0 min";
  if (hours === 0) return locale === "es" ? `${minutes} min` : `${minutes} min`;
  if (minutes === 0) return locale === "es" ? `${hours} h` : `${hours} h`;
  return locale === "es" ? `${hours} h ${minutes} min` : `${hours} h ${minutes} min`;
}

export function extractBookingIdFromScan(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^[a-f0-9-]{8,}$/i.test(t)) return t;
  try {
    const u = new URL(t);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^[a-f0-9-]{8,}$/i.test(last)) return last;
    const q = u.searchParams.get("id") || u.searchParams.get("bookingId");
    if (q && /^[a-f0-9-]{8,}$/i.test(q.trim())) return q.trim();
  } catch {
    /* no es URL */
  }
  return t;
}
