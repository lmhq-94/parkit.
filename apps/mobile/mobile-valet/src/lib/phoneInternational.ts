/**
 * Misma lógica que `apps/web/src/lib/inputMasks.ts` (formatPhoneInternational).
 * Teléfono internacional con máscara según prefijo (+506 CR, +1 US, etc.).
 */

/** Códigos de marcación E.164 por código de país ISO (sin el +). */
export const COUNTRY_DIAL_CODES: Record<string, string> = {
  AF: "93",
  AL: "355",
  DE: "49",
  AD: "376",
  AO: "244",
  AI: "1264",
  AG: "1268",
  SA: "966",
  DZ: "213",
  AR: "54",
  AM: "374",
  AW: "297",
  AU: "61",
  AT: "43",
  AZ: "994",
  BS: "1242",
  BH: "973",
  BD: "880",
  BB: "1246",
  BE: "32",
  BZ: "501",
  BJ: "229",
  BM: "1441",
  BY: "375",
  BO: "591",
  BA: "387",
  BW: "267",
  BR: "55",
  BN: "673",
  BG: "359",
  BF: "226",
  BI: "257",
  BT: "975",
  CV: "238",
  KH: "855",
  CM: "237",
  CA: "1",
  QA: "974",
  TD: "235",
  CL: "56",
  CN: "86",
  CY: "357",
  VA: "379",
  CO: "57",
  KM: "269",
  CG: "242",
  CD: "243",
  KP: "850",
  KR: "82",
  CR: "506",
  CI: "225",
  HR: "385",
  CU: "53",
  CW: "599",
  DK: "45",
  DM: "1767",
  EC: "593",
  EG: "20",
  SV: "503",
  AE: "971",
  ER: "291",
  SK: "421",
  SI: "386",
  ES: "34",
  US: "1",
  EE: "372",
  ET: "251",
  PH: "63",
  FI: "358",
  FJ: "679",
  FR: "33",
  GA: "241",
  GM: "220",
  GE: "995",
  GH: "233",
  GI: "350",
  GD: "1473",
  GR: "30",
  GL: "299",
  GP: "590",
  GT: "502",
  GN: "224",
  GW: "245",
  GQ: "240",
  GY: "592",
  GF: "594",
  HT: "509",
  HN: "504",
  HK: "852",
  HU: "36",
  IN: "91",
  ID: "62",
  IQ: "964",
  IR: "98",
  IE: "353",
  IS: "354",
  IL: "972",
  IT: "39",
  JM: "1876",
  JP: "81",
  JO: "962",
  KZ: "7",
  KE: "254",
  KY: "1345",
  KI: "686",
  XK: "383",
  KW: "965",
  LA: "856",
  LS: "266",
  LV: "371",
  LB: "961",
  LR: "231",
  LY: "218",
  LI: "423",
  LT: "370",
  LU: "352",
  MO: "853",
  MK: "389",
  MG: "261",
  MY: "60",
  MW: "265",
  MV: "960",
  ML: "223",
  MT: "356",
  MA: "212",
  MU: "230",
  MR: "222",
  MX: "52",
  FM: "691",
  MD: "373",
  MC: "377",
  MN: "976",
  ME: "382",
  MS: "1664",
  MZ: "258",
  MM: "95",
  NA: "264",
  NR: "674",
  NP: "977",
  NI: "505",
  NE: "227",
  NG: "234",
  NO: "47",
  NZ: "64",
  OM: "968",
  NL: "31",
  PW: "680",
  PA: "507",
  PG: "675",
  PK: "92",
  PY: "595",
  PE: "51",
  PL: "48",
  PT: "351",
  PR: "1787",
  GB: "44",
  CF: "236",
  CZ: "420",
  DO: "1809",
  TW: "886",
  RE: "262",
  RW: "250",
  RO: "40",
  RU: "7",
  EH: "212",
  SB: "677",
  WS: "685",
  KN: "1869",
  SM: "378",
  ST: "239",
  SN: "221",
  RS: "381",
  SC: "248",
  SL: "232",
  SG: "65",
  SX: "1721",
  SY: "963",
  SO: "252",
  LK: "94",
  ZA: "27",
  SS: "211",
  SD: "249",
  SE: "46",
  CH: "41",
  SR: "597",
  SJ: "47",
  SZ: "268",
  TH: "66",
  TL: "670",
  TG: "228",
  TO: "676",
  TT: "1868",
  TN: "216",
  TM: "993",
  TR: "90",
  TV: "688",
  UA: "380",
  UG: "256",
  UY: "598",
  UZ: "998",
  VU: "678",
  VE: "58",
  VN: "84",
  YE: "967",
  DJ: "253",
  ZM: "260",
  ZW: "263",
};

const DIAL_CODES_SORTED = [...new Set(Object.values(COUNTRY_DIAL_CODES))].sort(
  (a, b) => b.length - a.length
);

function countryCodeFromDialCode(dialCode: string): string | undefined {
  return Object.entries(COUNTRY_DIAL_CODES).find(([, d]) => d === dialCode)?.[0];
}

/**
 * Teléfono internacional: detecta el código de país por el prefijo y formatea (igual que web).
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
    if (c.length === 0 && b.length === 0) return `${prefix} ${a.length ? `(${a})` : ""}`.trim();
    if (c.length === 0) return `${prefix} (${a}) ${b}`;
    return `${prefix} (${a}) ${b}-${c}`;
  }

  const parts: string[] = [];
  for (let i = 0; i < localDigits.length; i += 4) parts.push(localDigits.slice(i, i + 4));
  return `${prefix} ${parts.join("-")}`;
}

/** Vacío = válido (opcional). Si hay dígitos, E.164 10–15 dígitos (como web). */
export function isValidPhoneOptional(phone: string): boolean {
  const s = phone.trim();
  if (s === "") return true;
  const digits = s.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/** Para API: solo dígitos o undefined si vacío (como perfil web). */
export function phoneDigitsForApi(phone: string): string | undefined {
  const d = phone.replace(/\D/g, "");
  return d.length > 0 ? d : undefined;
}
