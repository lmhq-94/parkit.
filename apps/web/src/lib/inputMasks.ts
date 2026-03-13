/**
 * Máscaras de entrada para formularios.
 * Cada función recibe el valor actual y el evento de cambio, y devuelve el valor formateado.
 */

/** Códigos de marcación E.164 por código de país ISO (sin el +). */
export const COUNTRY_DIAL_CODES: Record<string, string> = {
  AF: "93", AL: "355", DE: "49", AD: "376", AO: "244", AI: "1264", AG: "1268", SA: "966",
  DZ: "213", AR: "54", AM: "374", AW: "297", AU: "61", AT: "43", AZ: "994", BS: "1242",
  BH: "973", BD: "880", BB: "1246", BE: "32", BZ: "501", BJ: "229", BM: "1441", BY: "375",
  BO: "591", BA: "387", BW: "267", BR: "55", BN: "673", BG: "359", BF: "226", BI: "257",
  BT: "975", CV: "238", KH: "855", CM: "237", CA: "1", QA: "974", TD: "235", CL: "56",
  CN: "86", CY: "357", VA: "379", CO: "57", KM: "269", CG: "242", CD: "243", KP: "850",
  KR: "82", CR: "506", CI: "225", HR: "385", CU: "53", CW: "599", DK: "45", DM: "1767",
  EC: "593", EG: "20", SV: "503", AE: "971", ER: "291", SK: "421", SI: "386", ES: "34",
  US: "1", EE: "372", ET: "251", PH: "63", FI: "358", FJ: "679", FR: "33", GA: "241",
  GM: "220", GE: "995", GH: "233", GI: "350", GD: "1473", GR: "30", GL: "299", GP: "590",
  GT: "502", GN: "224", GW: "245", GQ: "240", GY: "592", GF: "594", HT: "509", HN: "504",
  HK: "852", HU: "36", IN: "91", ID: "62", IQ: "964", IR: "98", IE: "353", IS: "354",
  IL: "972", IT: "39", JM: "1876", JP: "81", JO: "962", KZ: "7", KE: "254", KY: "1345",
  KI: "686", XK: "383", KW: "965", LA: "856", LS: "266", LV: "371", LB: "961", LR: "231",
  LY: "218", LI: "423", LT: "370", LU: "352", MO: "853", MK: "389", MG: "261", MY: "60",
  MW: "265", MV: "960", ML: "223", MT: "356", MA: "212", MU: "230", MR: "222", MX: "52",
  FM: "691", MD: "373", MC: "377", MN: "976", ME: "382", MS: "1664", MZ: "258", MM: "95",
  NA: "264", NR: "674", NP: "977", NI: "505", NE: "227", NG: "234", NO: "47", NZ: "64",
  OM: "968", NL: "31", PW: "680", PA: "507", PG: "675", PK: "92", PY: "595", PE: "51",
  PL: "48", PT: "351", PR: "1787", GB: "44", CF: "236", CZ: "420", DO: "1809", TW: "886",
  RE: "262", RW: "250", RO: "40", RU: "7", EH: "212", SB: "677", WS: "685", KN: "1869",
  SM: "378", ST: "239", SN: "221", RS: "381", SC: "248", SL: "232", SG: "65", SX: "1721",
  SY: "963", SO: "252", LK: "94", ZA: "27", SS: "211", SD: "249", SE: "46", CH: "41",
  SR: "597", SJ: "47", SZ: "268", TH: "66", TL: "670", TG: "228", TO: "676", TT: "1868",
  TN: "216", TM: "993", TR: "90", TV: "688", UA: "380", UG: "256", UY: "598", UZ: "998",
  VU: "678", VE: "58", VN: "84", YE: "967", DJ: "253", ZM: "260", ZW: "263",
};

/** Teléfono: dígitos, + al inicio opcional. Máx 15 dígitos (E.164). */
export function formatPhone(value: string): string {
  const trimmed = value.trimStart();
  const hasPlus = trimmed.startsWith("+");
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (digits.length === 0) return hasPlus ? "+" : "";
  return (hasPlus ? "+" : "") + digits;
}

/** Códigos de marcación únicos ordenados por longitud descendente (para emparejar el más largo primero, ej. 1264 antes de 1). */
const DIAL_CODES_SORTED = [...new Set(Object.values(COUNTRY_DIAL_CODES))].sort(
  (a, b) => b.length - a.length
);

/** Devuelve un código de país ISO para un código de marcación (si varios comparten, devuelve el primero). */
function countryCodeFromDialCode(dialCode: string): string | undefined {
  return Object.entries(COUNTRY_DIAL_CODES).find(([, d]) => d === dialCode)?.[0];
}

/**
 * Teléfono internacional: detecta el código de país por el prefijo y formatea.
 * Acepta cualquier código (ej. +1, +34, +506). Para input y para mostrar.
 * @param value - Valor actual (puede ser "+506 6216-4040", "50662164040", "+1 555 1234567", etc.).
 */
export function formatPhoneInternational(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (digits.length === 0) return "";

  let dial = "";
  let localDigits = digits;
  for (const d of DIAL_CODES_SORTED) {
    if (digits.startsWith(d)) {
      dial = d;
      localDigits = digits.slice(d.length);
      break;
    }
  }
  if (!dial) {
    dial = digits;
    localDigits = "";
  }

  const prefix = `+${dial}`;
  if (localDigits.length === 0) return prefix + (dial === digits ? "" : " ");

  const countryCode = countryCodeFromDialCode(dial);

  // Costa Rica: +506 XXXX-XXXX (8 dígitos locales)
  if (countryCode === "CR" && dial === "506") {
    const a = localDigits.slice(0, 4);
    const b = localDigits.slice(4, 8);
    if (b.length === 0) return `${prefix} ${a}`;
    return `${prefix} ${a}-${b}`;
  }

  // US/CA (código 1): +1 (XXX) XXX-XXXX
  if (dial === "1" && localDigits.length <= 10) {
    const a = localDigits.slice(0, 3);
    const b = localDigits.slice(3, 6);
    const c = localDigits.slice(6, 10);
    if (c.length === 0 && b.length === 0) return `${prefix} ${a.length ? `(${a})` : ""}`.trim();
    if (c.length === 0) return `${prefix} (${a}) ${b}`;
    return `${prefix} (${a}) ${b}-${c}`;
  }

  // Genérico: +dial XXXX-XXXX-...
  const parts: string[] = [];
  for (let i = 0; i < localDigits.length; i += 4) parts.push(localDigits.slice(i, i + 4));
  return `${prefix} ${parts.join("-")}`;
}

/**
 * Teléfono con máscara de código de país (cuando ya conoces el país, ej. empresa).
 * Ej: Costa Rica → "+506 6216-4040". Para compatibilidad y cuando el contexto tiene countryCode.
 * @param value - Valor actual del input (puede incluir o no el + y el código de país).
 * @param countryCode - Código ISO del país (ej. "CR"). Por defecto "CR".
 */
export function formatPhoneWithCountryCode(value: string, countryCode: string = "CR"): string {
  const dial = COUNTRY_DIAL_CODES[countryCode] ?? "506";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";

  let localDigits: string;
  if (digits.startsWith(dial)) {
    localDigits = digits.slice(dial.length);
  } else {
    localDigits = digits;
  }
  localDigits = localDigits.slice(0, 15);

  const prefix = `+${dial}`;
  if (localDigits.length === 0) return prefix + " ";

  if (countryCode === "CR" && dial === "506") {
    const a = localDigits.slice(0, 4);
    const b = localDigits.slice(4, 8);
    if (b.length === 0) return `${prefix} ${a}`;
    return `${prefix} ${a}-${b}`;
  }

  if (dial === "1" && localDigits.length <= 10) {
    const a = localDigits.slice(0, 3);
    const b = localDigits.slice(3, 6);
    const c = localDigits.slice(6, 10);
    if (c.length === 0 && b.length === 0) return `${prefix} ${a.length ? `(${a})` : ""}`;
    if (c.length === 0) return `${prefix} (${a}) ${b}`;
    return `${prefix} (${a}) ${b}-${c}`;
  }

  const parts: string[] = [];
  for (let i = 0; i < localDigits.length; i += 4) parts.push(localDigits.slice(i, i + 4));
  return `${prefix} ${parts.join("-")}`;
}

/** NIF / Tax ID: dígitos y guiones, formato 3-101-123456 (cédula jurídica CR) o similar */
export function formatTaxId(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (digits.length <= 1) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4)}`;
}

/**
 * Placa Costa Rica: solo números (ej. 345723) o alfanumérico LLL-NNN (ej. RWF-001).
 * Acepta solo A-Z y 0-9; formatea automáticamente con guion en el formato mixto.
 */
export function formatPlate(value: string): string {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const letters = raw.replace(/[^A-Z]/g, "").slice(0, 3);
  const allDigits = raw.replace(/[^0-9]/g, "");

  // Solo numérico: hasta 6 dígitos (ej. 345723)
  if (letters.length === 0) {
    return allDigits.slice(0, 6);
  }

  // Alfanumérico: 3 letras + guion + 3 dígitos (ej. RWF-001)
  const digits = allDigits.slice(0, 3);
  return letters + (digits.length > 0 ? "-" + digits : "");
}

/** Para mostrar en UI: primera letra de cada palabra en mayúscula, resto en minúscula. Ej: TOYOTA → Toyota */
export function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(?:^|\s|[-])\w/g, (c) => c.toUpperCase());
}
