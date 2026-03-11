/**
 * Catálogo de vehículos: marcas, modelos y dimensiones. Solo CarQuery API (gratis, sin key).
 */

const CARQUERY_BASE = "https://www.carqueryapi.com/api/0.3";

export interface MakeItem {
  Make_ID: number;
  Make_Name: string;
}

export interface ModelItem {
  Model_ID: number;
  Model_Name: string;
}

export interface VehicleDimensions {
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

async function carQueryFetch<T>(params: Record<string, string>): Promise<T> {
  const url = `${CARQUERY_BASE}/?${new URLSearchParams({ ...params, callback: "" })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CarQuery ${res.status}`);
  const text = await res.text().then((s) => s.trim());
  const jsonStr = text.replace(/^\s*\(/, "").replace(/\)\s*;?\s*$/, "");
  return JSON.parse(jsonStr) as T;
}

async function getMakesFromCarQuery(year?: number): Promise<MakeItem[]> {
  try {
    const params: Record<string, string> = { cmd: "getMakes" };
    if (year != null && year > 0) params.year = String(year);
    const data = await carQueryFetch<{ Makes?: Array<{ make_id: string; make_display: string }> }>(params);
    const list = data?.Makes ?? [];
    return list
      .filter((m) => m?.make_display?.trim())
      .map((m, i) => ({ Make_ID: i + 1, Make_Name: m.make_display.trim() }))
      .sort((a, b) => a.Make_Name.localeCompare(b.Make_Name));
  } catch {
    return [];
  }
}

async function getModelsFromCarQuery(make: string, year?: number): Promise<ModelItem[]> {
  try {
    const params: Record<string, string> = { cmd: "getModels", make: make.trim().toLowerCase() };
    if (year != null && year > 0) params.year = String(year);
    const data = await carQueryFetch<{ Models?: Array<{ model_name: string; model_make_id: string }> }>(params);
    const list = data?.Models ?? [];
    return list
      .filter((m) => m?.model_name?.trim())
      .map((m, i) => ({ Model_ID: i + 1, Model_Name: m.model_name.trim() }))
      .sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
  } catch {
    return [];
  }
}

async function getDimensionsFromCarQuery(
  make: string,
  model: string,
  year?: number
): Promise<VehicleDimensions | null> {
  try {
    const params: Record<string, string> = { cmd: "getTrims", make: make.trim().toLowerCase(), model: model.trim().toLowerCase() };
    if (year != null && year > 0) params.year = String(year);
    const data = await carQueryFetch<{
      Trims?: Array<{ model_length_mm?: string | null; model_width_mm?: string | null; model_height_mm?: string | null }>;
    }>(params);
    const trims = data?.Trims;
    if (!Array.isArray(trims) || trims.length === 0) return null;
    const toCm = (v: string | number | null | undefined) =>
      v != null && v !== "" && !Number.isNaN(Number(v)) ? Math.round(Number(v) / 10) : undefined;
    for (const t of trims) {
      const lengthCm = toCm(t.model_length_mm);
      const widthCm = toCm(t.model_width_mm);
      const heightCm = toCm(t.model_height_mm);
      if (lengthCm != null || widthCm != null || heightCm != null) {
        return { lengthCm, widthCm, heightCm };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export class VehicleCatalogService {
  static async getMakes(year?: number): Promise<MakeItem[]> {
    return getMakesFromCarQuery(year);
  }

  static async getModels(make: string, year?: number): Promise<ModelItem[]> {
    return getModelsFromCarQuery(make, year);
  }

  static async getDimensions(
    make: string,
    model: string,
    year?: number
  ): Promise<VehicleDimensions | null> {
    const fromCarQuery = await getDimensionsFromCarQuery(make, model, year);
    return fromCarQuery;
  }
}
