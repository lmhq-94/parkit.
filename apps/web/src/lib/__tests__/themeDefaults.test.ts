import {
  THEME_DEFAULT_PRIMARY_LIGHT,
  THEME_DEFAULT_PRIMARY_DARK,
  getThemeDefaultColors,
} from "../themeDefaults";

describe("themeDefaults", () => {
  it("exporta constantes de color", () => {
    expect(THEME_DEFAULT_PRIMARY_LIGHT).toBe("#2563eb");
    expect(THEME_DEFAULT_PRIMARY_DARK).toBe("#3b82f6");
  });

  describe("getThemeDefaultColors", () => {
    it("devuelve colores para modo claro", () => {
      const colors = getThemeDefaultColors(false);
      expect(colors.primary).toBe(THEME_DEFAULT_PRIMARY_LIGHT);
      expect(colors.secondary).toBeDefined();
      expect(colors.tertiary).toBeDefined();
    });
    it("devuelve colores para modo oscuro", () => {
      const colors = getThemeDefaultColors(true);
      expect(colors.primary).toBe(THEME_DEFAULT_PRIMARY_DARK);
      expect(colors.secondary).toBeDefined();
      expect(colors.tertiary).toBeDefined();
    });
  });
});
