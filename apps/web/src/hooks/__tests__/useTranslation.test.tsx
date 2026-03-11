import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useTranslation } from "../useTranslation";
import { useLocaleStore } from "@/lib/store";

describe("useTranslation", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "es" });
  });

  it("devuelve locale y t según el store", () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.locale).toBe("es");
    expect(result.current.t("common.save")).toBe("Guardar");
    expect(result.current.t("validation.required")).toBe("Este campo es obligatorio.");
  });

  it("t sustituye variables", () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t("validation.minLength", { min: 8 })).toBe("Mínimo 8 caracteres.");
  });

  it("tWithCompany sustituye companyName", () => {
    const { result } = renderHook(() => useTranslation());
    const text = result.current.tWithCompany("tables.employees.description", "Acme");
    expect(text).toContain("Acme");
  });

  it("tEnum traduce valor de enum", () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.tEnum("systemRole", "ADMIN")).toBe("Administrador");
    expect(result.current.tEnum("systemRole", null)).toBe("N/A");
  });

    it("reacciona al cambio de locale", () => {
      const { result, rerender } = renderHook(() => useTranslation());
      expect(result.current.t("common.save")).toBe("Guardar");
      act(() => {
        useLocaleStore.setState({ locale: "en" });
      });
      rerender();
      expect(result.current.locale).toBe("en");
      expect(result.current.t("common.save")).toBe("Save");
    });
});
