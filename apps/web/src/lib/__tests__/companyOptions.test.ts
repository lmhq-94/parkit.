import { COUNTRIES, CURRENCIES, LICENSE_TYPES, TIMEZONES } from "../companyOptions";

describe("companyOptions", () => {
  describe("COUNTRIES", () => {
    it("es un array de objetos con code y label", () => {
      expect(Array.isArray(COUNTRIES)).toBe(true);
      expect(COUNTRIES.length).toBeGreaterThan(0);
      COUNTRIES.forEach((c) => {
        expect(c).toHaveProperty("code");
        expect(c).toHaveProperty("label");
        expect(typeof c.code).toBe("string");
        expect(typeof c.label).toBe("string");
      });
    });
    it("contiene Costa Rica y Estados Unidos", () => {
      const codes = COUNTRIES.map((c) => c.code);
      expect(codes).toContain("CR");
      expect(codes).toContain("US");
      expect(COUNTRIES.find((c) => c.code === "CR")?.label).toContain("Costa Rica");
    });
    it("todos los codes son únicos", () => {
      const codes = COUNTRIES.map((c) => c.code);
      expect(new Set(codes).size).toBe(codes.length);
    });
  });

  describe("CURRENCIES", () => {
    it("es un array de objetos con code y label", () => {
      expect(Array.isArray(CURRENCIES)).toBe(true);
      expect(CURRENCIES.length).toBeGreaterThan(0);
      CURRENCIES.forEach((c) => {
        expect(c).toHaveProperty("code");
        expect(c).toHaveProperty("label");
      });
    });
    it("contiene USD y CRC", () => {
      const codes = CURRENCIES.map((c) => c.code);
      expect(codes).toContain("USD");
      expect(codes).toContain("CRC");
    });
  });

  describe("LICENSE_TYPES", () => {
    it("es un array de objetos con value y label", () => {
      expect(Array.isArray(LICENSE_TYPES)).toBe(true);
      LICENSE_TYPES.forEach((l) => {
        expect(l).toHaveProperty("value");
        expect(l).toHaveProperty("label");
      });
    });
    it("contiene tipos comunes B1, B2", () => {
      const values = LICENSE_TYPES.map((l) => l.value);
      expect(values).toContain("B1");
      expect(values).toContain("B2");
    });
  });

  describe("TIMEZONES", () => {
    it("es un array de objetos con value y label", () => {
      expect(Array.isArray(TIMEZONES)).toBe(true);
      expect(TIMEZONES.length).toBeGreaterThan(0);
      TIMEZONES.forEach((t) => {
        expect(t).toHaveProperty("value");
        expect(t).toHaveProperty("label");
      });
    });
    it("contiene zonas comunes", () => {
      const values = TIMEZONES.map((t) => t.value);
      expect(values.some((v) => v.includes("America"))).toBe(true);
      expect(values.some((v) => v.includes("Europe"))).toBe(true);
    });
  });
});
