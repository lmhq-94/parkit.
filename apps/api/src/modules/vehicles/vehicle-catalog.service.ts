/**
 * Vehicle catalog from NHTSA vPIC API (US).
 * https://vpic.nhtsa.dot.gov/api/
 * Used for makes (brands) and models. Dimensions require a separate paid API or manual input.
 */

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

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

/** Nombres de tipo de vehículo (NHTSA). Solo coches y multipropósito. */
const COMMON_VEHICLE_TYPE_NAMES = ["Passenger Car", "Multipurpose Passenger Vehicle"];
/** IDs de tipo en vPIC: 1 = Passenger Car, 2 = Multipurpose Passenger Vehicle. */
const COMMON_VEHICLE_TYPE_IDS = [1, 2];

/** Marcas a excluir cuando se usa fallback GetAllMakes (buses, trailers, camiones pesados, etc.). */
const EXCLUDED_MAKE_PATTERNS = [
  /^trailer/i,
  /^bus\b/i,
  /^motorcycle/i,
  /^atv\b/i,
  /^utv\b/i,
  /^freightliner/i,
  /^peterbilt/i,
  /^kenworth/i,
  /^mack\b/i,
  /^western star/i,
  /^international\s+(harvester|truck)/i,
  /^navistar/i,
  /^oshkosh/i,
  /^blue bird/i,
  /^thomas\s+bus/i,
  /^girardin/i,
  /^collins\s+bus/i,
  /^prevost/i,
  /^mci\b/i,
  /^neoplan/i,
  /^daimler\s+bus/i,
  /^utility\s+trailer/i,
  /^great\s+dane/i,
  /^wabash/i,
  /^hyundai\s+trans/i,
  /^volvo\s+truck/i,
  /^scania/i,
  /^man\s+truck/i,
  /^iveco\s+(bus|truck)/i,
  /^daf\b/i,
  /^isuzu\s+(truck|commercial|npr)/i,
  /^hino\b/i,
  /^fuso/i,
  /^ud\s+truck/i,
  /^ram\s+commercial/i,
];

function addMakesToMap(data: { Results?: MakeItem[] }, seen: Map<number, MakeItem>): void {
  const list = data.Results ?? [];
  for (const m of list) {
    if (m.Make_Name?.trim() && !seen.has(m.Make_ID)) seen.set(m.Make_ID, m);
  }
}

function isExcludedMake(name: string): boolean {
  return EXCLUDED_MAKE_PATTERNS.some((p) => p.test(name.trim()));
}

export class VehicleCatalogService {
  /**
   * Marcas para vehículos comunes (coches, SUV). Si NHTSA por tipo falla, fallback a GetAllMakes filtrando buses/trailers.
   */
  static async getMakes(): Promise<MakeItem[]> {
    const seen = new Map<number, MakeItem>();
    for (const vehicleType of COMMON_VEHICLE_TYPE_NAMES) {
      try {
        const url = `${NHTSA_BASE}/GetMakesForVehicleType/${encodeURIComponent(vehicleType)}?format=json`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = (await res.json()) as { Results?: MakeItem[] };
        addMakesToMap(data, seen);
      } catch {
        // skip
      }
    }
    if (seen.size === 0) {
      for (const typeId of COMMON_VEHICLE_TYPE_IDS) {
        try {
          const url = `${NHTSA_BASE}/GetMakesForVehicleType/${typeId}?format=json`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = (await res.json()) as { Results?: MakeItem[] };
          addMakesToMap(data, seen);
        } catch {
          // skip
        }
      }
    }
    if (seen.size === 0) {
      try {
        const url = `${NHTSA_BASE}/GetAllMakes?format=json`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = (await res.json()) as { Results?: MakeItem[] };
        const all = data.Results ?? [];
        for (const m of all) {
          if (m.Make_Name?.trim() && !isExcludedMake(m.Make_Name) && !seen.has(m.Make_ID)) {
            seen.set(m.Make_ID, m);
          }
        }
      } catch {
        return [];
      }
    }
    const list = Array.from(seen.values());
    return list.sort((a, b) => a.Make_Name.localeCompare(b.Make_Name));
  }

  static async getModels(make: string): Promise<ModelItem[]> {
    const encoded = encodeURIComponent(make.trim());
    const url = `${NHTSA_BASE}/GetModelsForMake/${encoded}?format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch models");
    const data = (await res.json()) as { Results?: ModelItem[] };
    const list = data.Results ?? [];
    return list.filter((m) => m.Model_Name?.trim()).sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
  }

  /**
   * Dimensions: NHTSA free API does not provide dimensions.
   * Optional: set API_NINJAS_KEY to use API Ninjas Cars API for dimensions.
   */
  static async getDimensions(
    _make: string,
    _model: string,
    year?: number
  ): Promise<VehicleDimensions | null> {
    const key = process.env.API_NINJAS_KEY;
    if (!key?.trim()) return null;
    try {
      const params = new URLSearchParams({
        make: _make,
        model: _model,
        ...(year != null && { year: String(year) }),
        limit: "1",
      });
      const res = await fetch(`https://api.api-ninjas.com/v1/cars?${params}`, {
        headers: { "X-Api-Key": key },
      });
      if (!res.ok) return null;
      const arr = (await res.json()) as Array<{ length?: number; width?: number; height?: number }>;
      const car = arr?.[0];
      if (!car) return null;
      const lengthCm = car.length != null ? Math.round(car.length * 2.54) : undefined;
      const widthCm = car.width != null ? Math.round(car.width * 2.54) : undefined;
      const heightCm = car.height != null ? Math.round(car.height * 2.54) : undefined;
      if (lengthCm == null && widthCm == null && heightCm == null) return null;
      return { lengthCm, widthCm, heightCm };
    } catch {
      return null;
    }
  }
}
