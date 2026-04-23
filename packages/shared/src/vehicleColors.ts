export const VEHICLE_COLORS = [
  { value: "Blanco" as const, label: "Blanco" as const },
  { value: "Negro" as const, label: "Negro" as const },
  { value: "Gris" as const, label: "Gris" as const },
  { value: "Plateado" as const, label: "Plateado" as const },
  { value: "Azul" as const, label: "Azul" as const },
  { value: "Rojo" as const, label: "Rojo" as const },
  { value: "Verde" as const, label: "Verde" as const },
  { value: "Amarillo" as const, label: "Amarillo" as const },
  { value: "Naranja" as const, label: "Naranja" as const },
  { value: "Café" as const, label: "Café" as const },
  { value: "Beige" as const, label: "Beige" as const },
  { value: "Dorado" as const, label: "Dorado" as const },
  { value: "Morado" as const, label: "Morado" as const },
  { value: "Turquesa" as const, label: "Turquesa" as const },
  { value: "Rosa" as const, label: "Rosa" as const },
  { value: "Vino" as const, label: "Vino" as const },
  { value: "Celeste" as const, label: "Celeste" as const },
  { value: "Bronce" as const, label: "Bronce" as const },
  { value: "Cobre" as const, label: "Cobre" as const },
  { value: "Champagne" as const, label: "Champagne" as const },
  { value: "Coral" as const, label: "Coral" as const },
  { value: "Lavanda" as const, label: "Lavanda" as const },
  { value: "Crema" as const, label: "Crema" as const },
] as const;

type VehicleColor = { value: string; label: string };
type VehicleColorValue = VehicleColor["value"];
type VehicleColorLocale = "es" | "en" | (string & {});

const VEHICLE_COLOR_LOOKUP = new Map<string, VehicleColor>();
for (const color of VEHICLE_COLORS) {
  VEHICLE_COLOR_LOOKUP.set(color.value.toLowerCase(), color);
  VEHICLE_COLOR_LOOKUP.set(color.label.toLowerCase(), color);
}

const VEHICLE_COLOR_LABELS_ES: Record<VehicleColorValue, string> = {
  Blanco: "Blanco",
  Negro: "Negro",
  Gris: "Gris",
  Plateado: "Plateado",
  Azul: "Azul",
  Rojo: "Rojo",
  Verde: "Verde",
  Amarillo: "Amarillo",
  Naranja: "Naranja",
  Café: "Café",
  Beige: "Beige",
  Dorado: "Dorado",
  Morado: "Morado",
  Turquesa: "Turquesa",
  Rosa: "Rosa",
  Vino: "Vino",
  Celeste: "Celeste",
  Bronce: "Bronce",
  Cobre: "Cobre",
  Champagne: "Champagne",
  Coral: "Coral",
  Lavanda: "Lavanda",
  Crema: "Crema",
  AzulReal: "Azul Real",
};

const VEHICLE_COLOR_LABELS_EN: Record<VehicleColorValue, string> = {
  Blanco: "White",
  Negro: "Black",
  Gris: "Gray",
  Plateado: "Silver",
  Azul: "Blue",
  Rojo: "Red",
  Verde: "Green",
  Amarillo: "Yellow",
  Naranja: "Orange",
  Café: "Brown",
  Beige: "Beige",
  Dorado: "Gold",
  Morado: "Purple",
  Turquesa: "Turquoise",
  Rosa: "Pink",
  Vino: "Burgundy",
  Celeste: "Sky Blue",
  Bronce: "Bronze",
  Cobre: "Copper",
  Champagne: "Champagne",
  Coral: "Coral",
  Lavanda: "Lavender",
  Crema: "Cream",
  AzulReal: "Royal Blue",
};

function toTitleCaseWords(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function resolveVehicleColorLabel(value: VehicleColorValue, locale?: VehicleColorLocale): string {
  if (locale && locale.toLowerCase().startsWith("en")) {
    return VEHICLE_COLOR_LABELS_EN[value] ?? value;
  }
  return VEHICLE_COLOR_LABELS_ES[value] ?? value;
}

export function normalizeVehicleColorValue(raw: string): string {
  const input = raw.trim();
  if (!input) return "";
  const found = VEHICLE_COLOR_LOOKUP.get(input.toLowerCase());
  if (found) return found.value;
  return toTitleCaseWords(input);
}

export function formatVehicleColorLabel(raw?: string | null, locale?: VehicleColorLocale): string {
  const input = raw?.trim() ?? "";
  if (!input) return "";
  const normalized = normalizeVehicleColorValue(input);
  const found = VEHICLE_COLOR_LOOKUP.get(normalized.toLowerCase());
  if (found) return resolveVehicleColorLabel(found.value, locale);
  return toTitleCaseWords(normalized);
}

export function getVehicleColorOptions(locale?: VehicleColorLocale): VehicleColor[] {
  return VEHICLE_COLORS.map((color) => ({
    ...color,
    label: resolveVehicleColorLabel(color.value, locale),
  }));
}
