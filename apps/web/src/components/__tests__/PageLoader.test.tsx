import React from "react";
import { render, screen } from "@testing-library/react";
import { PageLoader } from "../PageLoader";
import { useLocaleStore } from "@/lib/store";

describe("PageLoader", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "es" });
  });

  it("renderiza spinner y texto de carga", () => {
    render(<PageLoader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
