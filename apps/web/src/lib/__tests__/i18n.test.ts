import { t, tWithCompany, translateEnum, getStoredLocale, setStoredLocale } from "../i18n";

describe("i18n", () => {
  describe("t", () => {
    it("devuelve traducción en español por clave anidada", () => {
      expect(t("es", "common.save")).toBe("Guardar");
      expect(t("es", "validation.required")).toBe("Este campo es obligatorio.");
    });
    it("devuelve traducción en inglés", () => {
      expect(t("en", "common.save")).toBe("Save");
    });
    it("sustituye variables {{var}}", () => {
      expect(t("es", "validation.minLength", { min: 5 })).toBe("Mínimo 5 caracteres.");
    });
    it("devuelve la clave si no existe", () => {
      expect(t("es", "missing.key")).toBe("missing.key");
    });
  });

  describe("tWithCompany", () => {
    it("sustituye {{companyName}} por el nombre dado", () => {
      const result = tWithCompany("es", "tables.employees.description", "Acme Corp");
      expect(result).toContain("Acme Corp");
    });
    it("usa 'tu empresa' cuando companyName es null", () => {
      const result = tWithCompany("es", "tables.employees.description", null);
      expect(result).toContain("tu empresa");
    });
  });

  describe("translateEnum", () => {
    it("traduce valor de enum conocido", () => {
      expect(translateEnum("es", "systemRole", "ADMIN")).toBe("Administrador");
      expect(translateEnum("en", "systemRole", "STAFF")).toBe("Staff");
    });
    it("devuelve 'N/A' para null o vacío", () => {
      expect(translateEnum("es", "systemRole", null)).toBe("N/A");
      expect(translateEnum("es", "systemRole", "")).toBe("N/A");
    });
    it("devuelve valor original si no hay traducción", () => {
      expect(translateEnum("es", "systemRole", "UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("getStoredLocale / setStoredLocale", () => {
    const KEY = "parkit_locale";

    beforeEach(() => {
      localStorage.removeItem(KEY);
    });

    it("getStoredLocale devuelve 'es' por defecto", () => {
      expect(getStoredLocale()).toBe("es");
    });
    it("setStoredLocale guarda y getStoredLocale recupera", () => {
      setStoredLocale("en");
      expect(getStoredLocale()).toBe("en");
      setStoredLocale("es");
      expect(getStoredLocale()).toBe("es");
    });
  });
});
