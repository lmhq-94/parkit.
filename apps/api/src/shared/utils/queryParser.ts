import type { ParsedQs } from "qs";

export function parseQueryParam(
  value: string | string[] | ParsedQs | ParsedQs[] | undefined
): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
    return value[0] as string;
  }
  return undefined;
}

/** Devuelve un array de strings para parámetros como status (acepta ?status=A&status=B o ?status=A,B) */
export function parseQueryParamArray(
  value: string | string[] | ParsedQs | ParsedQs[] | undefined
): string[] {
  if (typeof value === "string") {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  return [];
}
