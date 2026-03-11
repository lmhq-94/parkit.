import React from "react";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renderiza con rol status y aria-label por defecto", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status", { name: /cargando/i });
    expect(spinner).toBeInTheDocument();
  });

  it("acepta aria-label personalizado", () => {
    render(<LoadingSpinner aria-label="Esperando datos" />);
    expect(screen.getByRole("status", { name: /esperando datos/i })).toBeInTheDocument();
  });

  it("aplica clases de tamaño sm, md, lg", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let el = screen.getByRole("status");
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("w-4");

    rerender(<LoadingSpinner size="lg" />);
    el = screen.getByRole("status");
    expect(el.className).toContain("h-10");
    expect(el.className).toContain("w-10");
  });

  it("aplica variant primary por defecto", () => {
    render(<LoadingSpinner />);
    const el = screen.getByRole("status");
    expect(el.className).toMatch(/company-primary/);
  });
});
