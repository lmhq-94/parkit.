import React from "react";
import { render, screen } from "@testing-library/react";
import { Providers } from "../Providers";

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));
const mockSetLocale = jest.fn();
jest.mock("@/lib/store", () => ({
  useLocaleStore: (selector: (s: { setLocale: jest.Mock }) => unknown) => {
    const state = { setLocale: mockSetLocale };
    return typeof selector === "function" ? selector(state) : state;
  },
}));
jest.mock("@/lib/i18n", () => ({
  getStoredLocale: () => "es",
}));
jest.mock("@/components/CompanyThemeSync", () => ({
  CompanyThemeSync: () => <div data-testid="company-theme-sync" />,
}));
jest.mock("@/components/Toaster", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe("Providers", () => {
  it("envuelve children con ThemeProvider, CompanyThemeSync y Toaster", () => {
    render(
      <Providers>
        <span>Contenido</span>
      </Providers>
    );
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("company-theme-sync")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
