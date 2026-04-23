/**
 * Vehicle catalog: makes, models, and dimensions.
 * Queries local database first for fast, reliable responses;
 * falls back to CarQuery API if database is empty.
 */

import { prisma } from "@/shared/prisma";

const CARQUERY_BASE = "https://www.carqueryapi.com/api/0.3";

/** Static list of makes when the external API is unavailable (e.g. CarQuery 403). */
const FALLBACK_MAKES: MakeItem[] = [
  "Acura", "Alfa Romeo", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge",
  "Fiat", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover",
  "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mercury", "Mini", "Mitsubishi", "Nissan",
  "Peugeot", "Porsche", "Ram", "Renault", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen",
  "Volvo",
].sort().map((name, i) => ({ Make_ID: i + 1, Make_Name: name }));

/** Static fallback models for popular makes when CarQuery fails or returns empty. */
const FALLBACK_MODELS: Record<string, string[]> = {
  "Acura": ["ILX", "TLX", "MDX", "RDX", "NSX"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
  "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron", "TT", "R8"],
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "i4", "i7", "iX"],
  "Buick": ["Encore", "Encore GX", "Envision", "Enclave"],
  "Cadillac": ["CT4", "CT5", "CT6", "XT4", "XT5", "XT6", "Escalade"],
  "Chevrolet": ["Spark", "Sonic", "Malibu", "Impala", "Camaro", "Corvette", "Equinox", "Blazer", "Traverse", "Tahoe", "Suburban", "Silverado"],
  "Chrysler": ["Pacifica", "Voyager", "300"],
  "Dodge": ["Charger", "Challenger", "Durango", "Journey"],
  "Fiat": ["500", "500X"],
  "Ford": ["Fiesta", "Focus", "Fusion", "Mustang", "Escape", "Bronco", "Edge", "Explorer", "Expedition", "F-150", "Ranger", "Maverick"],
  "GMC": ["Terrain", "Acadia", "Yukon", "Sierra"],
  "Honda": ["Civic", "Accord", "Insight", "Clarity", "Fit", "HR-V", "CR-V", "Passport", "Pilot", "Ridgeline"],
  "Hyundai": ["Elantra", "Sonata", "Ioniq", "Kona", "Tucson", "Santa Fe", "Palisade"],
  "Infiniti": ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"],
  "Jaguar": ["XE", "XF", "XJ", "F-PACE", "E-PACE", "I-PACE", "F-TYPE"],
  "Jeep": ["Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator", "Renegade"],
  "Kia": ["Forte", "K5", "Stinger", "Soul", "Seltos", "Sportage", "Sorento", "Telluride"],
  "Land Rover": ["Discovery", "Discovery Sport", "Defender", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque"],
  "Lexus": ["IS", "ES", "GS", "LS", "UX", "NX", "RX", "GX", "LX", "RC", "LC"],
  "Lincoln": ["Corsair", "Nautilus", "Aviator", "Navigator"],
  "Mazda": ["Mazda3", "Mazda6", "CX-30", "CX-5", "CX-50", "CX-9", "MX-5 Miata"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "SL", "AMG GT"],
  "Mitsubishi": ["Mirage", "Outlander", "Outlander Sport", "Eclipse Cross"],
  "Nissan": ["Versa", "Sentra", "Altima", "Maxima", "Leaf", "Kicks", "Rogue", "Murano", "Pathfinder", "Armada", "Frontier", "Titan"],
  "Porsche": ["718", "911", "Taycan", "Panamera", "Macan", "Cayenne"],
  "Ram": ["1500", "2500", "3500", "ProMaster"],
  "Subaru": ["Impreza", "Legacy", "WRX", "BRZ", "Crosstrek", "Forester", "Outback", "Ascent"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  "Toyota": ["Corolla", "Camry", "Avalon", "Prius", "86", "Supra", "C-HR", "RAV4", "Highlander", "4Runner", "Sequoia", "Tacoma", "Tundra", "Sienna"],
  "Volkswagen": ["Jetta", "Passat", "Arteon", "Tiguan", "Atlas", "Atlas Cross Sport", "ID.4"],
  "Volvo": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
};

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
  /**
   * Approximate weight in kilograms, when CarQuery provides it.
   */
  weightKg?: number;
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
      Trims?: Array<{
        model_length_mm?: string | null;
        model_width_mm?: string | null;
        model_height_mm?: string | null;
        // Exact field names may vary depending on the CarQuery version,
        // but these are the documented/common fields.
        model_weight_kg?: string | null;
        model_weight_lbs?: string | null;
      }>;
    }>(params);
    const trims = data?.Trims;
    if (!Array.isArray(trims) || trims.length === 0) return null;
    const toCm = (v: string | number | null | undefined) =>
      v != null && v !== "" && !Number.isNaN(Number(v)) ? Math.round(Number(v) / 10) : undefined;
    const toKg = (kg: string | null | undefined, lbs: string | null | undefined) => {
      if (kg != null && kg !== "" && !Number.isNaN(Number(kg))) {
        return Number(kg);
      }
      if (lbs != null && lbs !== "" && !Number.isNaN(Number(lbs))) {
        // Approximate pounds-to-kilograms conversion
        return Math.round((Number(lbs) * 0.45359237 + Number.EPSILON) * 10) / 10;
      }
      return undefined;
    };

    // Choose the "most complete" trim: the one with more dimension fields present.
    let best: VehicleDimensions | null = null;
    let bestScore = -1;
    for (const t of trims) {
      const lengthCm = toCm(t.model_length_mm);
      const widthCm = toCm(t.model_width_mm);
      const heightCm = toCm(t.model_height_mm);
      const weightKg = toKg(t.model_weight_kg ?? null, t.model_weight_lbs ?? null);

      const score =
        (lengthCm != null ? 1 : 0) +
        (widthCm != null ? 1 : 0) +
        (heightCm != null ? 1 : 0) +
        (weightKg != null ? 1 : 0);

      if (score > bestScore && score > 0) {
        bestScore = score;
        best = { lengthCm, widthCm, heightCm, weightKg };
      }
    }
    return best;
  } catch {
    return null;
  }
}

export interface CreateMakeInput {
  name: string;
}

export interface CreateModelInput {
  makeId: string;
  name: string;
}

export class VehicleCatalogService {
  static async getMakes(year?: number): Promise<MakeItem[]> {
    // Query local database first (fast and reliable)
    try {
      const dbMakes = await prisma.vehicleMake.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });

      if (dbMakes.length > 0) {
        return dbMakes.map((m, i) => ({ Make_ID: i + 1, Make_Name: m.name }));
      }
    } catch (err) {
      console.error("[VehicleCatalog] Database query failed for makes:", err);
    }

    // Fallback to external API
    const fromApi = await getMakesFromCarQuery(year);
    if (fromApi.length > 0) return fromApi;

    // Final fallback to static list
    return FALLBACK_MAKES;
  }

  static async getModels(make: string, year?: number): Promise<ModelItem[]> {
    const makeName = make.trim();

    // Query local database first (fast and reliable)
    try {
      const dbMake = await prisma.vehicleMake.findFirst({
        where: {
          name: { equals: makeName, mode: "insensitive" },
          isActive: true,
        },
        include: {
          models: {
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          },
        },
      });

      if (dbMake && dbMake.models.length > 0) {
        return dbMake.models.map((m, i) => ({ Model_ID: i + 1, Model_Name: m.name }));
      }
    } catch (err) {
      console.error("[VehicleCatalog] Database query failed for models:", err);
    }

    // Fallback to external API
    const fromApi = await getModelsFromCarQuery(makeName, year);
    if (fromApi.length > 0) return fromApi;

    // Final fallback to static list
    const normalizedMake = Object.keys(FALLBACK_MODELS).find(
      (k) => k.toLowerCase() === makeName.toLowerCase()
    );
    if (normalizedMake) {
      return FALLBACK_MODELS[normalizedMake].map((name, i) => ({
        Model_ID: i + 1,
        Model_Name: name,
      }));
    }

    return [];
  }

  static async getDimensions(
    make: string,
    model: string,
    year?: number
  ): Promise<VehicleDimensions | null> {
    // Query local database first for cached dimensions by year
    try {
      const dbModel = await prisma.vehicleModel.findFirst({
        where: {
          name: { equals: model.trim(), mode: "insensitive" },
          make: { name: { equals: make.trim(), mode: "insensitive" } },
          isActive: true,
        },
        include: {
          variants: {
            where: year
              ? { yearStart: { lte: year }, yearEnd: { gte: year }, isActive: true }
              : { isActive: true },
            take: 1,
          },
        },
      });

      const variant = dbModel?.variants?.[0];
      if (variant && variant.lengthCm && variant.widthCm && variant.heightCm) {
        // If local DB has dimensions but no weight, try to get weight from external API
        if (!variant.weightKg) {
          const externalDims = await getDimensionsFromCarQuery(make, model, year);
          if (externalDims?.weightKg) {
            return {
              lengthCm: variant.lengthCm,
              widthCm: variant.widthCm,
              heightCm: variant.heightCm,
              weightKg: externalDims.weightKg,
            };
          }
        }
        return {
          lengthCm: variant.lengthCm,
          widthCm: variant.widthCm,
          heightCm: variant.heightCm,
          weightKg: variant.weightKg ?? undefined,
        };
      }
    } catch (err) {
      console.error("[VehicleCatalog] Database query failed for dimensions:", err);
    }

    // Fallback to external API
    return await getDimensionsFromCarQuery(make, model, year);
  }

  // Create a new make (manual entry)
  static async createMake(input: CreateMakeInput) {
    const existing = await prisma.vehicleMake.findFirst({
      where: { name: { equals: input.name.trim(), mode: "insensitive" } },
    });

    if (existing) {
      throw new Error(`Make "${input.name}" already exists`);
    }

    const count = await prisma.vehicleMake.count();
    
    return prisma.vehicleMake.create({
      data: {
        name: input.name.trim(),
        isActive: true,
        sortOrder: count,
      },
    });
  }

  // Create a new model (manual entry)
  static async createModel(input: CreateModelInput) {
    const make = await prisma.vehicleMake.findUnique({
      where: { id: input.makeId },
    });

    if (!make) {
      throw new Error("Make not found");
    }

    const existing = await prisma.vehicleModel.findFirst({
      where: {
        makeId: input.makeId,
        name: { equals: input.name.trim(), mode: "insensitive" },
      },
    });

    if (existing) {
      throw new Error(`Model "${input.name}" already exists for this make`);
    }

    const count = await prisma.vehicleModel.count({
      where: { makeId: input.makeId },
    });

    return prisma.vehicleModel.create({
      data: {
        makeId: input.makeId,
        name: input.name.trim(),
        isActive: true,
        sortOrder: count,
      },
    });
  }

  // Find or create make by name (useful when user enters custom make)
  static async findOrCreateMake(makeName: string): Promise<string> {
    const normalizedName = makeName.trim();
    
    // Try to find existing
    const existing = await prisma.vehicleMake.findFirst({
      where: { name: { equals: normalizedName, mode: "insensitive" } },
    });

    if (existing) {
      return existing.id;
    }

    // Create new
    const count = await prisma.vehicleMake.count();
    const newMake = await prisma.vehicleMake.create({
      data: {
        name: normalizedName,
        isActive: true,
        sortOrder: count,
      },
    });

    return newMake.id;
  }

  // Find or create model by name (useful when user enters custom model)
  static async findOrCreateModel(
    makeId: string,
    modelName: string
  ): Promise<string> {
    const normalizedName = modelName.trim();
    
    // Try to find existing
    const existing = await prisma.vehicleModel.findFirst({
      where: {
        makeId,
        name: { equals: normalizedName, mode: "insensitive" },
      },
    });

    if (existing) {
      return existing.id;
    }

    // Create new
    const count = await prisma.vehicleModel.count({ where: { makeId } });
    const newModel = await prisma.vehicleModel.create({
      data: {
        makeId,
        name: normalizedName,
        isActive: true,
        sortOrder: count,
      },
    });

    return newModel.id;
  }
}
