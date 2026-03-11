import React from "react";
import { render } from "@testing-library/react";
import { CompanyThemeSync } from "../CompanyThemeSync";

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: jest.fn() }),
}));

jest.mock("@/lib/store", () => ({
  useDashboardStore: (selector: (s: { companyBranding: unknown }) => unknown) => {
    const state = { companyBranding: null };
    return typeof selector === "function" ? selector(state) : state;
  },
}));

jest.mock("@/lib/themeDefaults", () => ({
  getThemeDefaultColors: (isDark: boolean) =>
    isDark
      ? { primary: "#3b82f6", secondary: "#94a3b8", tertiary: "#cbd5e1" }
      : { primary: "#2563eb", secondary: "#64748b", tertiary: "#94a3b8" },
}));

describe("CompanyThemeSync", () => {
  it("aplica variables CSS por defecto cuando no hay companyBranding", () => {
    const setProperty = jest.spyOn(document.documentElement.style, "setProperty");
    render(<CompanyThemeSync />);
    expect(setProperty).toHaveBeenCalledWith("--company-primary", "#2563eb");
    expect(setProperty).toHaveBeenCalledWith("--company-secondary", "#64748b");
    expect(setProperty).toHaveBeenCalledWith("--company-tertiary", "#94a3b8");
    setProperty.mockRestore();
  });
});
