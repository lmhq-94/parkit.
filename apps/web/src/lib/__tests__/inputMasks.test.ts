import {
  COUNTRY_DIAL_CODES,
  formatPhone,
  formatPhoneInternational,
  formatPhoneWithCountryCode,
  getDeviceCountryCode,
  formatTaxId,
  formatPlate,
  toTitleCase,
} from "../inputMasks";

describe("inputMasks", () => {
  describe("COUNTRY_DIAL_CODES", () => {
    it("contiene códigos conocidos", () => {
      expect(COUNTRY_DIAL_CODES["CR"]).toBe("506");
      expect(COUNTRY_DIAL_CODES["US"]).toBe("1");
      expect(COUNTRY_DIAL_CODES["ES"]).toBe("34");
    });
  });

  describe("formatPhone", () => {
    it("mantiene solo dígitos y opcional + al inicio", () => {
      expect(formatPhone("506 6216-4040")).toBe("50662164040");
      expect(formatPhone("+506 6216-4040")).toBe("+50662164040");
      expect(formatPhone("+")).toBe("+");
      expect(formatPhone("abc")).toBe("");
    });
    it("limita a 15 dígitos", () => {
      expect(formatPhone("123456789012345678").replace(/\D/g, "").length).toBe(15);
    });
  });

  describe("formatPhoneInternational", () => {
    const originalIntl = Intl.DateTimeFormat;

    afterEach(() => {
      Intl.DateTimeFormat = originalIntl;
    });

    it("formatea Costa Rica +506 XXXX-XXXX", () => {
      Intl.DateTimeFormat = (() =>
        ({
          resolvedOptions: () => ({ locale: "es-CR" }),
        }) as Intl.DateTimeFormat) as typeof Intl.DateTimeFormat;
      expect(formatPhoneInternational("50662164040")).toBe("+506 6216-4040");
    });
    it("formatea US +1 (XXX) XXX-XXXX", () => {
      Intl.DateTimeFormat = (() =>
        ({
          resolvedOptions: () => ({ locale: "en-US" }),
        }) as Intl.DateTimeFormat) as typeof Intl.DateTimeFormat;
      expect(formatPhoneInternational("15551234567")).toBe("+1 (555) 123-4567");
    });
    it("si no hay prefijo usa el del pais del dispositivo", () => {
      Intl.DateTimeFormat = (() =>
        ({
          resolvedOptions: () => ({ locale: "en-US" }),
        }) as Intl.DateTimeFormat) as typeof Intl.DateTimeFormat;
      expect(formatPhoneInternational("5551234567")).toBe("+1 (555) 123-4567");
    });
  });

  describe("getDeviceCountryCode", () => {
    const originalIntl = Intl.DateTimeFormat;

    afterEach(() => {
      Intl.DateTimeFormat = originalIntl;
    });

    it("extrae region del locale del dispositivo", () => {
      Intl.DateTimeFormat = (() =>
        ({
          resolvedOptions: () => ({ locale: "es-CR" }),
        }) as Intl.DateTimeFormat) as typeof Intl.DateTimeFormat;
      expect(getDeviceCountryCode()).toBe("CR");
    });
    it("si locale no trae region, usa fallback del entorno (navigator)", () => {
      Intl.DateTimeFormat = (() =>
        ({
          resolvedOptions: () => ({ locale: "es" }),
        }) as Intl.DateTimeFormat) as typeof Intl.DateTimeFormat;
      expect(getDeviceCountryCode()).toBe("US");
    });
  });

  describe("formatPhoneWithCountryCode", () => {
    it("formatea CR por defecto", () => {
      expect(formatPhoneWithCountryCode("62164040")).toBe("+506 6216-4040");
    });
    it("acepta countryCode explícito", () => {
      expect(formatPhoneWithCountryCode("5551234567", "US")).toContain("+1");
    });
  });

  describe("formatTaxId", () => {
    it("formatea NIF tipo 3-101-123456", () => {
      expect(formatTaxId("3101123456")).toBe("3-101-123456");
    });
    it("solo dígitos y guiones", () => {
      expect(formatTaxId("3a1")).toBe("3-1");
    });
  });

  describe("formatPlate", () => {
    it("formatea LLL-NNN", () => {
      expect(formatPlate("ABC123")).toBe("ABC-123");
    });
    it("solo números: toma hasta 3 dígitos cuando no hay letras", () => {
      expect(formatPlate("123")).toBe("123");
      expect(formatPlate("12")).toBe("12");
    });
    it("vacío devuelve vacío", () => {
      expect(formatPlate("")).toBe("");
    });
  });

  describe("toTitleCase", () => {
    it("primera letra de cada palabra en mayúscula", () => {
      expect(toTitleCase("TOYOTA")).toBe("Toyota");
      expect(toTitleCase("hello world")).toBe("Hello World");
    });
  });
});
