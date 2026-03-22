/**
 * Mismos códigos que en web (`apps/web/src/lib/companyOptions.ts` LICENSE_TYPES).
 * `licenseNumber` en API = valores unidos por ", ".
 */
export const LICENSE_TYPE_VALUES = [
  "A1",
  "A2",
  "A3",
  "B1",
  "B2",
  "C",
  "D1",
  "D2",
  "D3",
  "E",
  "F",
] as const;

export type LicenseTypeValue = (typeof LICENSE_TYPE_VALUES)[number];

export const LICENSE_TYPE_OPTIONS: ReadonlyArray<{
  value: LicenseTypeValue;
  labelEs: string;
  labelEn: string;
}> = [
  { value: "A1", labelEs: "A1 — Motocicletas hasta 250cc", labelEn: "A1 — Motorcycles up to 250cc" },
  { value: "A2", labelEs: "A2 — Motocicletas hasta 750cc", labelEn: "A2 — Motorcycles up to 750cc" },
  { value: "A3", labelEs: "A3 — Motocicletas sin restricción", labelEn: "A3 — Motorcycles unrestricted" },
  { value: "B1", labelEs: "B1 — Automóviles y camionetas", labelEn: "B1 — Cars and light trucks" },
  { value: "B2", labelEs: "B2 — Vehículos de carga no articulados", labelEn: "B2 — Non-articulated cargo vehicles" },
  { value: "C", labelEs: "C — Vehículos de carga pesada", labelEn: "C — Heavy cargo vehicles" },
  { value: "D1", labelEs: "D1 — Autobuses interurbanos", labelEn: "D1 — Intercity buses" },
  { value: "D2", labelEs: "D2 — Microbuses y buses", labelEn: "D2 — Minibuses and buses" },
  { value: "D3", labelEs: "D3 — Taxi y transporte especial", labelEn: "D3 — Taxi and special transport" },
  { value: "E", labelEs: "E — Maquinaria pesada", labelEn: "E — Heavy machinery" },
  { value: "F", labelEs: "F — Vehículos especiales", labelEn: "F — Special vehicles" },
];

export function labelForLicenseType(
  value: string,
  locale: "es" | "en"
): string {
  const row = LICENSE_TYPE_OPTIONS.find((o) => o.value === value);
  if (!row) return value;
  return locale === "en" ? row.labelEn : row.labelEs;
}
