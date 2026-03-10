/**
 * Catálogo de vehículos: marcas, modelos y dimensiones.
 * Marcas: solo Car API (68 marcas). Modelos: NHTSA o API Ninjas.
 * Dimensiones: 1) API Ninjas /v1/cars (API_NINJAS_KEY), 2) Car Specs en RapidAPI (CAR_SPECS_RAPIDAPI_KEY).
 */

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";
const API_NINJAS_BASE = "https://api.api-ninjas.com/v1";
const CARAPI_BASE = "https://carapi.app/api";
const CAR_SPECS_RAPIDAPI_HOST = "car-specs.p.rapidapi.com";

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

function getApiNinjasKey(): string | null {
  const key = process.env.API_NINJAS_KEY;
  return key?.trim() ? key : null;
}

function apiNinjasFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = getApiNinjasKey();
  if (!key) return Promise.reject(new Error("API_NINJAS_KEY not set"));
  const url = `${API_NINJAS_BASE}${path}?${new URLSearchParams(params).toString()}`;
  return fetch(url, { headers: { "X-Api-Key": key } }).then((res) => {
    if (!res.ok) throw new Error(`API Ninjas ${res.status}`);
    return res.json() as Promise<T>;
  });
}

// --- Car API (carapi.app): marcas sin auth, solo coches/SUV ---
interface CarApiMake {
  id: number;
  name: string;
}
async function getMakesFromCarApi(): Promise<MakeItem[]> {
  const url = `${CARAPI_BASE}/makes?limit=200`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: CarApiMake[] };
    const data = json?.data;
    if (!Array.isArray(data)) return [];
    return data
      .filter((m) => m?.name?.trim())
      .map((m) => ({ Make_ID: m.id, Make_Name: m.name.trim() }))
      .sort((a, b) => a.Make_Name.localeCompare(b.Make_Name));
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

// --- API Ninjas: modelos (opcional si tienes plan que incluye carmodels) ---
async function getModelsFromApiNinjas(make: string, year?: number): Promise<ModelItem[]> {
  const params: Record<string, string> = { make: make.trim() };
  if (year != null && year > 0) params.year = String(year);
  const arr = await apiNinjasFetch<string[]>("/carmodels", params);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((name) => typeof name === "string" && name.trim())
    .map((name, i) => ({ Model_ID: i + 1, Model_Name: (name as string).trim() }))
    .sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
}

// --- NHTSA (fallback cuando no hay API_NINJAS_KEY) ---
const COMMON_VEHICLE_TYPE_NAMES = ["Passenger Car", "Multipurpose Passenger Vehicle"];
const COMMON_VEHICLE_TYPE_IDS = [1, 2];

const EXCLUDED_MAKE_PATTERNS = [
  /^trailer/i, /^bus\b/i, /^motorcycle/i, /^atv\b/i, /^utv\b/i,
  /^freightliner/i, /^peterbilt/i, /^kenworth/i, /^mack\b/i, /^western star/i,
  /^international\s+(harvester|truck)/i, /^navistar/i, /^oshkosh/i,
  /^blue bird/i, /^thomas\s+bus/i, /^girardin/i, /^collins\s+bus/i,
  /^prevost/i, /^mci\b/i, /^neoplan/i, /^daimler\s+bus/i,
  /^utility\s+trailer/i, /^great\s+dane/i, /^wabash/i, /^hyundai\s+trans/i,
  /^volvo\s+truck/i, /^scania/i, /^man\s+truck/i, /^iveco\s+(bus|truck)/i,
  /^daf\b/i, /^isuzu\s+(truck|commercial|npr)/i, /^hino\b/i, /^fuso/i,
  /^ud\s+truck/i, /^ram\s+commercial/i,
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

async function getMakesFromNhtsa(): Promise<MakeItem[]> {
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

/** Excluir modelos comerciales, buses, camiones, motos, incompletos o variantes no habituales. Solo SUV, sedan, hatchback, convertible y modelos comunes. */
const EXCLUDED_MODEL_PATTERNS = [
  /\bcommercial\b/i,
  /\bcutaway\b/i,
  /\bincomplete\b/i,
  /\bchassis\b/i,
  /\bstripped\b/i,
  /\bcab\s+chassis\b/i,
  /\bcargo\s+van\b/i,
  /\bpassenger\s+van\b/i,
  /\bminivan\b/i,
  /\bvan\b$/i,
  /\bbus\b/i,
  /\bmedium\s+duty\b/i,
  /\bheavy\s+duty\b/i,
  /\bclass\s+[4-8]\b/i,
  /\bstep\s+van\b/i,
  /\bmotorcycle\b/i,
  /\bmoto\b/i,
  /\bscooter\b/i,
  /\bmotorbike\b/i,
  /\btruck\b/i,
  /\bsemi\b/i,
  /\btractor\b/i,
  /\btrailer\b/i,
  /\bflatbed\b/i,
  /\bdelivery\s+truck\b/i,
  /\bbox\s+truck\b/i,
  /\bdump\s+truck\b/i,
  /\btow\s+truck\b/i,
  /\bfire\s+truck\b/i,
  /\bambulance\b/i,
  /\btransit\s+bus\b/i,
  /\bschool\s+bus\b/i,
  /\bcoach\b/i,
  /\barticulated\b/i,
];

function isExcludedModel(name: string): boolean {
  return EXCLUDED_MODEL_PATTERNS.some((p) => p.test(name.trim()));
}

async function getModelsFromNhtsa(make: string): Promise<ModelItem[]> {
  const encoded = encodeURIComponent(make.trim());
  const url = `${NHTSA_BASE}/GetModelsForMake/${encoded}?format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch models");
  const data = (await res.json()) as { Results?: ModelItem[] };
  const list = (data.Results ?? [])
    .filter((m) => m.Model_Name?.trim() && !isExcludedModel(m.Model_Name))
    .sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
  return list.map((m, i) => ({ Model_ID: i + 1, Model_Name: m.Model_Name.trim() }));
}

// --- Dimensiones: API Ninjas /v1/cars (make, model, year) → length/width/height en inches ---
async function getDimensionsFromApiNinjas(
  make: string,
  model: string,
  year?: number
): Promise<VehicleDimensions | null> {
  const key = getApiNinjasKey();
  if (!key) return null;
  try {
    const params: Record<string, string> = {
      make: make.trim(),
      model: model.trim(),
      limit: "1",
    };
    if (year != null && year > 0) params.year = String(year);
    const res = await fetch(`${API_NINJAS_BASE}/cars?${new URLSearchParams(params)}`, {
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

// --- Dimensiones: Car Specs API (RapidAPI) → lengthMm, widthMm, heightMm ---
function getCarSpecsKey(): string | null {
  const key = process.env.CAR_SPECS_RAPIDAPI_KEY ?? process.env.RAPIDAPI_KEY;
  return key?.trim() ? key : null;
}

async function getDimensionsFromCarSpecs(
  make: string,
  model: string,
  year: number
): Promise<VehicleDimensions | null> {
  const key = getCarSpecsKey();
  if (!key || year < 1990 || year > new Date().getFullYear() + 1) return null;
  const base = `https://${CAR_SPECS_RAPIDAPI_HOST}`;
  const headers = { "X-RapidAPI-Key": key, "X-RapidAPI-Host": CAR_SPECS_RAPIDAPI_HOST };
  try {
    const makesRes = await fetch(`${base}/v2/cars/makes`, { headers });
    if (!makesRes.ok) return null;
    const makes = (await makesRes.json()) as Array<{ id: number; name: string }>;
    const makeNorm = make.trim().toLowerCase();
    const makeEntry = makes?.find((m) => m.name?.toLowerCase() === makeNorm || m.name?.toLowerCase().includes(makeNorm));
    if (!makeEntry) return null;

    const modelsRes = await fetch(`${base}/v2/cars/makes/${makeEntry.id}/models`, { headers });
    if (!modelsRes.ok) return null;
    const models = (await modelsRes.json()) as Array<{ id: number; name: string }>;
    const modelNorm = model.trim().toLowerCase();
    const modelEntry = models?.find((m) => m.name?.toLowerCase() === modelNorm || m.name?.toLowerCase().includes(modelNorm));
    if (!modelEntry) return null;

    const gensRes = await fetch(`${base}/v2/cars/models/${modelEntry.id}/generations`, { headers });
    if (!gensRes.ok) return null;
    const generations = (await gensRes.json()) as Array<{ id: number; yearFrom?: number; yearTo?: number | null }>;
    const gen = generations?.find((g) => year >= (g.yearFrom ?? 0) && year <= (g.yearTo ?? 9999));
    if (!gen) return null;

    const trimsRes = await fetch(`${base}/v2/cars/generations/${gen.id}/trims`, { headers });
    if (!trimsRes.ok) return null;
    const trims = (await trimsRes.json()) as Array<{ id: number }>;
    const trimId = trims?.[0]?.id;
    if (trimId == null) return null;

    const trimRes = await fetch(`${base}/v2/cars/trims/${trimId}`, { headers });
    if (!trimRes.ok) return null;
    const trim = (await trimRes.json()) as { lengthMm?: string | number | null; widthMm?: string | number | null; heightMm?: string | number | null };
    const toCm = (v: string | number | null | undefined) => (v != null && v !== "" ? Math.round(Number(v) / 10) : undefined);
    const lengthCm = toCm(trim.lengthMm);
    const widthCm = toCm(trim.widthMm);
    const heightCm = toCm(trim.heightMm);
    if (lengthCm == null && widthCm == null && heightCm == null) return null;
    return { lengthCm, widthCm, heightCm };
  } catch {
    return null;
  }
}

// --- API pública del servicio ---

export class VehicleCatalogService {
  /**
   * Marcas: solo Car API (68 marcas coches/SUV). Sin mezclar NHTSA para no inflar la lista.
   */
  static async getMakes(year?: number): Promise<MakeItem[]> {
    try {
      const carApi = await getMakesFromCarApi();
      if (carApi.length > 0) return carApi;
    } catch {
      // sigue con otras fuentes
    }
    if (getApiNinjasKey()) {
      try {
        const params: Record<string, string> = {};
        if (year != null && year > 0) params.year = String(year);
        const arr = await apiNinjasFetch<string[]>("/carmakes", params);
        if (Array.isArray(arr) && arr.length > 0) {
          return arr
            .filter((n) => typeof n === "string" && (n as string).trim())
            .map((n, i) => ({ Make_ID: i + 1, Make_Name: (n as string).trim() }))
            .sort((a, b) => a.Make_Name.localeCompare(b.Make_Name));
        }
      } catch {
        // fallback NHTSA
      }
    }
    return getMakesFromNhtsa();
  }

  /**
   * Modelos para una marca. Con API_NINJAS_KEY: carmodels (opcional year). Sin key: NHTSA.
   */
  static async getModels(make: string, year?: number): Promise<ModelItem[]> {
    if (getApiNinjasKey()) {
      try {
        return await getModelsFromApiNinjas(make, year);
      } catch {
        return getModelsFromNhtsa(make);
      }
    }
    return getModelsFromNhtsa(make);
  }

  /**
   * Dimensiones (largo, ancho, alto en cm). Origen: 1) API Ninjas, 2) Car Specs (RapidAPI) si hay year.
   */
  static async getDimensions(
    make: string,
    model: string,
    year?: number
  ): Promise<VehicleDimensions | null> {
    const fromNinjas = await getDimensionsFromApiNinjas(make, model, year);
    if (fromNinjas != null) return fromNinjas;
    if (year != null && year > 0) {
      const fromCarSpecs = await getDimensionsFromCarSpecs(make, model, year);
      if (fromCarSpecs != null) return fromCarSpecs;
    }
    return null;
  }
}
