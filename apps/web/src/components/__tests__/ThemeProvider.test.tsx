import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../ThemeProvider";

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="next-themes-provider">{children}</div>,
}));

describe("ThemeProvider", () => {
  it("envuelve children con el provider de next-themes", () => {
    render(
      <ThemeProvider>
        <span>Contenido</span>
      </ThemeProvider>
    );
    expect(screen.getByTestId("next-themes-provider")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
