export const VEHICLE_COLORS = [
  { value: "Blanco", label: "Blanco" },
  { value: "Negro", label: "Negro" },
  { value: "Gris", label: "Gris" },
  { value: "Plateado", label: "Plateado" },
  { value: "Azul", label: "Azul" },
  { value: "Rojo", label: "Rojo" },
  { value: "Verde", label: "Verde" },
  { value: "Amarillo", label: "Amarillo" },
  { value: "Naranja", label: "Naranja" },
  { value: "Cafe", label: "Cafe" },
  { value: "Beige", label: "Beige" },
  { value: "Dorado", label: "Dorado" },
  { value: "Morado", label: "Morado" },
] as const;

type VehicleColor = (typeof VEHICLE_COLORS)[number];
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
  Cafe: "Cafe",
  Beige: "Beige",
  Dorado: "Dorado",
  Morado: "Morado",
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
  Cafe: "Brown",
  Beige: "Beige",
  Dorado: "Gold",
  Morado: "Purple",
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
