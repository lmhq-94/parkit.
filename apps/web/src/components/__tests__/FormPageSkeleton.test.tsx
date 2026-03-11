import React from "react";
import { render, screen } from "@testing-library/react";
import { FormPageSkeleton } from "../FormPageSkeleton";

describe("FormPageSkeleton", () => {
  it("renderiza estructura de skeleton con secciones y placeholders", () => {
    const { container } = render(<FormPageSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(container.querySelector(".flex-1.flex.flex-col")).toBeInTheDocument();
    const sections = container.querySelectorAll(".overflow-hidden");
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  it("contiene grid de campos placeholder", () => {
    const { container } = render(<FormPageSkeleton />);
    expect(container.querySelector(".grid")).toBeInTheDocument();
  });
});
